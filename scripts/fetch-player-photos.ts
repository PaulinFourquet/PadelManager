import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { realPlayers } from '../src/data/realPlayers.seed';
import type { Player } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'players');
const ATTRIBUTIONS_FILE = join(OUT_DIR, '_attributions.json');
const FORCE = process.argv.includes('--force');
const SIZE = 320;
const LANG_CASCADE = ['en', 'es', 'fr'] as const;
const USER_AGENT = 'PadelManager-DataBot/0.1 (https://github.com/anthropics/claude-code; teaching project)';
const FETCH_TIMEOUT_MS = 8000;
const BATCH_SIZE = 5;

type Source = 'wikipedia' | 'wikidata' | 'dicebear';

type Attribution = {
  id: string;
  name: string;
  source: Source;
  imageUrl: string;
  pageUrl?: string;
  license: string;
  author?: string;
};

const fetchWithTimeout = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

type WikipediaPage = {
  pageid: number;
  title: string;
  thumbnail?: { source: string; width: number; height: number };
  fullurl?: string;
};

const tryWikipedia = async (player: Player): Promise<{ thumbUrl: string; pageUrl: string; lang: string } | null> => {
  for (const lang of LANG_CASCADE) {
    const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('redirects', '1');
    url.searchParams.set('titles', player.name);
    url.searchParams.set('prop', 'pageimages|info');
    url.searchParams.set('pithumbsize', '480');
    url.searchParams.set('inprop', 'url');
    url.searchParams.set('origin', '*');

    try {
      const response = await fetchWithTimeout(url.toString());
      if (!response.ok) continue;
      const data = (await response.json()) as { query?: { pages?: Record<string, WikipediaPage> } };
      const pages = Object.values(data.query?.pages ?? {});
      const hit = pages.find((page) => page.thumbnail?.source);
      if (hit?.thumbnail) {
        return {
          thumbUrl: hit.thumbnail.source,
          pageUrl: hit.fullurl ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
          lang,
        };
      }
    } catch (error) {
      // try next lang
    }
  }
  return null;
};

type WikidataSearchEntity = {
  id: string;
  label?: string;
  description?: string;
};

type WikidataClaimImage = {
  mainsnak?: { datavalue?: { value?: string } };
};

const tryWikidata = async (player: Player): Promise<{ imageUrl: string; entityId: string } | null> => {
  const searchUrl = new URL('https://www.wikidata.org/w/api.php');
  searchUrl.searchParams.set('action', 'wbsearchentities');
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('language', 'en');
  searchUrl.searchParams.set('type', 'item');
  searchUrl.searchParams.set('limit', '5');
  searchUrl.searchParams.set('search', player.name);
  searchUrl.searchParams.set('origin', '*');

  let entities: WikidataSearchEntity[] = [];
  try {
    const response = await fetchWithTimeout(searchUrl.toString());
    if (!response.ok) return null;
    const data = (await response.json()) as { search?: WikidataSearchEntity[] };
    entities = data.search ?? [];
  } catch {
    return null;
  }

  const padelEntity = entities.find((entity) => (entity.description ?? '').toLowerCase().includes('padel'));
  if (!padelEntity) return null;

  const entityUrl = new URL('https://www.wikidata.org/w/api.php');
  entityUrl.searchParams.set('action', 'wbgetentities');
  entityUrl.searchParams.set('format', 'json');
  entityUrl.searchParams.set('ids', padelEntity.id);
  entityUrl.searchParams.set('props', 'claims');
  entityUrl.searchParams.set('origin', '*');

  try {
    const response = await fetchWithTimeout(entityUrl.toString());
    if (!response.ok) return null;
    const data = (await response.json()) as {
      entities?: Record<string, { claims?: { P18?: WikidataClaimImage[] } }>;
    };
    const claims = data.entities?.[padelEntity.id]?.claims?.P18 ?? [];
    const filename = claims[0]?.mainsnak?.datavalue?.value;
    if (!filename) return null;
    const commonsUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=480`;
    return { imageUrl: commonsUrl, entityId: padelEntity.id };
  } catch {
    return null;
  }
};

const buildDicebearUrl = (id: string, name: string, gender: 'male' | 'female') => {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  const palette = gender === 'female' ? 'd24a36,b8336e,7b3a8a,38a3a5' : '1f9c5e,38a3a5,2c6748,5b8a3a';
  const url = new URL('https://api.dicebear.com/9.x/initials/svg');
  url.searchParams.set('seed', `${initials}-${id}`);
  url.searchParams.set('backgroundColor', palette);
  url.searchParams.set('backgroundType', 'gradientLinear');
  url.searchParams.set('fontWeight', '700');
  url.searchParams.set('fontSize', '46');
  url.searchParams.set('chars', '2');
  return url.toString();
};

const downloadAndConvert = async (sourceUrl: string, destPath: string): Promise<{ width: number; height: number } | null> => {
  const response = await fetchWithTimeout(sourceUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${sourceUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pipeline = sharp(buffer, { density: 300 })
    .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 86, mozjpeg: true });
  const out = await pipeline.toBuffer({ resolveWithObject: true });
  writeFileSync(destPath, out.data);
  return { width: out.info.width, height: out.info.height };
};

const ensureOutDir = () => {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
};

const photoExists = (id: string) => {
  const candidates = readdirSync(OUT_DIR).filter((entry) => entry === `${id}.jpg`);
  return candidates.length > 0;
};

const loadPreviousAttributions = (): Map<string, Attribution> => {
  if (!existsSync(ATTRIBUTIONS_FILE)) return new Map();
  try {
    const raw = readFileSync(ATTRIBUTIONS_FILE, 'utf8');
    const arr = JSON.parse(raw) as Attribution[];
    return new Map(arr.map((entry) => [entry.id, entry]));
  } catch {
    return new Map();
  }
};

const previousAttributions = loadPreviousAttributions();

const processPlayer = async (player: Player): Promise<Attribution> => {
  const destPath = join(OUT_DIR, `${player.id}.jpg`);

  if (!FORCE && photoExists(player.id)) {
    const previous = previousAttributions.get(player.id);
    if (previous && previous.imageUrl !== 'cached') {
      return previous;
    }
  }

  // Try Wikipedia
  const wp = await tryWikipedia(player);
  if (wp) {
    try {
      await downloadAndConvert(wp.thumbUrl, destPath);
      return {
        id: player.id,
        name: player.name,
        source: 'wikipedia',
        imageUrl: wp.thumbUrl,
        pageUrl: wp.pageUrl,
        license: 'CC BY-SA (Wikimedia Commons)',
      };
    } catch (error) {
      console.warn(`  ! Wikipedia download failed for ${player.name}: ${(error as Error).message}`);
    }
  }

  // Try Wikidata
  const wd = await tryWikidata(player);
  if (wd) {
    try {
      await downloadAndConvert(wd.imageUrl, destPath);
      return {
        id: player.id,
        name: player.name,
        source: 'wikidata',
        imageUrl: wd.imageUrl,
        pageUrl: `https://www.wikidata.org/wiki/${wd.entityId}`,
        license: 'CC BY-SA (Wikimedia Commons)',
      };
    } catch (error) {
      console.warn(`  ! Wikidata download failed for ${player.name}: ${(error as Error).message}`);
    }
  }

  // Fallback DiceBear
  const dicebearUrl = buildDicebearUrl(player.id, player.name, player.gender);
  await downloadAndConvert(dicebearUrl, destPath);
  return {
    id: player.id,
    name: player.name,
    source: 'dicebear',
    imageUrl: dicebearUrl,
    license: 'DiceBear (CC0 — avataaars by Pablo Stanley CC BY 4.0)',
  };
};

const generateCustomDefault = async () => {
  const destPath = join(OUT_DIR, '_custom.jpg');
  if (!FORCE && existsSync(destPath)) return;
  const url = new URL('https://api.dicebear.com/9.x/initials/svg');
  url.searchParams.set('seed', 'CP');
  url.searchParams.set('backgroundColor', '1f9c5e,38a3a5,2c6748');
  url.searchParams.set('backgroundType', 'gradientLinear');
  url.searchParams.set('fontWeight', '700');
  url.searchParams.set('chars', '2');
  await downloadAndConvert(url.toString(), destPath);
};

const runInBatches = async <T,>(items: T[], batchSize: number, worker: (item: T) => Promise<Attribution>) => {
  const results: Attribution[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(worker));
    settled.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        results.push(res.value);
      } else {
        console.error(`  ! Failed for ${(batch[idx] as { name?: string }).name}:`, res.reason);
      }
    });
  }
  return results;
};

const main = async () => {
  ensureOutDir();
  console.log(`Fetching photos for ${realPlayers.length} players (force=${FORCE})...`);
  console.log(`Output: ${OUT_DIR}`);

  const attributions = await runInBatches(realPlayers, BATCH_SIZE, async (player) => {
    process.stdout.write(`  > ${player.name}...`);
    try {
      const attribution = await processPlayer(player);
      const flag = attribution.source === 'wikipedia' ? '✓ wp' : attribution.source === 'wikidata' ? '✓ wd' : 'fallback';
      process.stdout.write(` ${flag}\n`);
      return attribution;
    } catch (error) {
      process.stdout.write(` FAILED\n`);
      throw error;
    }
  });

  await generateCustomDefault();

  writeFileSync(ATTRIBUTIONS_FILE, JSON.stringify(attributions, null, 2));

  const counts = attributions.reduce(
    (acc, attr) => {
      acc[attr.source] = (acc[attr.source] ?? 0) + 1;
      return acc;
    },
    {} as Record<Source, number>,
  );

  console.log('\n--- Summary ---');
  console.log(`Wikipedia : ${counts.wikipedia ?? 0}`);
  console.log(`Wikidata  : ${counts.wikidata ?? 0}`);
  console.log(`DiceBear  : ${counts.dicebear ?? 0}`);
  console.log(`Total     : ${attributions.length}/${realPlayers.length}`);
  console.log(`Attributions saved to ${ATTRIBUTIONS_FILE}`);
};

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});
