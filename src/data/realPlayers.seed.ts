import type { DominantHand, NaturalStyle, Player, PreferredSide, PlayerGender, PlayerStats } from '../types';

type StatProfile = {
  attack: number;
  defense: number;
  technique: number;
  physical: number;
  mental: number;
  tactical: number;
};

type PlayerSeed = {
  id: string;
  name: string;
  gender: PlayerGender;
  ranking: number;
  rankingPoints: number;
  age: number;
  heightCm: number;
  nationality: string;
  preferredSide: PreferredSide;
  dominantHand: DominantHand;
  naturalStyle: NaturalStyle;
  profile: StatProfile;
};

const clamp = (value: number) => Math.max(55, Math.min(99, Math.round(value)));

const buildStats = (profile: StatProfile, style: NaturalStyle): PlayerStats => {
  const attackTilt = style === 'offensive' ? 4 : style === 'counter' ? 1 : style === 'defensive' ? -3 : 0;
  const defenseTilt = style === 'defensive' ? 4 : style === 'counter' ? 3 : style === 'offensive' ? -2 : 0;

  return {
    attack: {
      smash: clamp(profile.attack + attackTilt + profile.physical * 0.08 - 7),
      vibora: clamp(profile.attack + attackTilt + profile.technique * 0.05 - 3),
      bandejaOff: clamp(profile.attack + attackTilt + profile.tactical * 0.04 - 4),
      volleyAttack: clamp(profile.attack + attackTilt + profile.mental * 0.03 - 5),
    },
    defense: {
      lob: clamp(profile.defense + defenseTilt + profile.technique * 0.04 - 4),
      wallExit: clamp(profile.defense + defenseTilt + profile.physical * 0.04 - 4),
      recovery: clamp(profile.defense + defenseTilt + profile.physical * 0.06 - 5),
      bandejaDef: clamp(profile.defense + defenseTilt + profile.tactical * 0.04 - 4),
    },
    technique: {
      precision: clamp(profile.technique + 2),
      slice: clamp(profile.technique + (style === 'counter' ? 3 : 0)),
      topspin: clamp(profile.technique - 2),
      serve: clamp(profile.technique + attackTilt - 3),
    },
    physical: {
      speed: clamp(profile.physical + (style === 'defensive' || style === 'counter' ? 3 : 0)),
      stamina: clamp(profile.physical + profile.mental * 0.04 - 3),
      reflexes: clamp(profile.physical + profile.tactical * 0.04 - 2),
      jump: clamp(profile.physical + attackTilt - 5),
    },
    mental: {
      composure: clamp(profile.mental + 1),
      focus: clamp(profile.mental + 2),
      adaptability: clamp(profile.mental + profile.tactical * 0.04 - 3),
      teamwork: clamp(profile.mental + (style === 'balanced' ? 2 : 0)),
    },
    tactical: {
      gameReading: clamp(profile.tactical + 2),
      positioning: clamp(profile.tactical + 1),
      anticipation: clamp(profile.tactical + (style === 'counter' ? 3 : 0)),
    },
  };
};

const player = (seed: PlayerSeed): Player => ({
  id: seed.id,
  name: seed.name,
  gender: seed.gender,
  ranking: seed.ranking,
  rankingPoints: seed.rankingPoints,
  age: seed.age,
  heightCm: seed.heightCm,
  nationality: seed.nationality,
  photoUrl: `/players/${seed.id}.jpg`,
  preferredSide: seed.preferredSide,
  dominantHand: seed.dominantHand,
  naturalStyle: seed.naturalStyle,
  stats: buildStats(seed.profile, seed.naturalStyle),
});

export const realPlayerNotes = [
  'Coello: elite left-handed finisher, huge smash/jump profile and aggressive net value.',
  'Tapia: complete attacking creator, very high technique, composure and shot variety.',
  'Chingotto: lower smash ceiling but elite defense, speed, teamwork and tactical reading.',
  'Triay: complete right-side/left-side profile with top-tier technique and mental stability.',
  'Brea: explosive attacking profile, high physicality and finishing quality.',
];

export const realPlayers: Player[] = [
  // Men, ranking order approximated from current FIP/Premier Padel top lists.
  player({ id: 'arturo-coello', name: 'Arturo Coello', gender: 'male', ranking: 1, rankingPoints: 20400, age: 24, heightCm: 190, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 97, defense: 82, technique: 89, physical: 96, mental: 89, tactical: 88 } }),
  player({ id: 'agustin-tapia', name: 'Agustin Tapia', gender: 'male', ranking: 1, rankingPoints: 20400, age: 26, heightCm: 179, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 96, defense: 86, technique: 96, physical: 91, mental: 94, tactical: 93 } }),
  player({ id: 'fede-chingotto', name: 'Fede Chingotto', gender: 'male', ranking: 3, rankingPoints: 17740, age: 29, heightCm: 170, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'counter', profile: { attack: 78, defense: 96, technique: 91, physical: 95, mental: 96, tactical: 97 } }),
  player({ id: 'ale-galan', name: 'Ale Galan', gender: 'male', ranking: 3, rankingPoints: 17740, age: 29, heightCm: 186, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 94, defense: 86, technique: 91, physical: 91, mental: 89, tactical: 90 } }),
  player({ id: 'juan-lebron', name: 'Juan Lebron', gender: 'male', ranking: 5, rankingPoints: 7605, age: 31, heightCm: 184, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 92, defense: 83, technique: 90, physical: 89, mental: 84, tactical: 88 } }),
  player({ id: 'franco-stupaczuk', name: 'Franco Stupaczuk', gender: 'male', ranking: 6, rankingPoints: 7485, age: 30, heightCm: 180, nationality: 'ARG', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'counter', profile: { attack: 89, defense: 91, technique: 90, physical: 92, mental: 91, tactical: 92 } }),
  player({ id: 'mike-yanguas', name: 'Mike Yanguas', gender: 'male', ranking: 7, rankingPoints: 7350, age: 24, heightCm: 189, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 88, defense: 86, technique: 87, physical: 90, mental: 85, tactical: 87 } }),
  player({ id: 'coki-nieto', name: 'Coki Nieto', gender: 'male', ranking: 8, rankingPoints: 6760, age: 27, heightCm: 176, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'defensive', profile: { attack: 80, defense: 91, technique: 87, physical: 89, mental: 90, tactical: 91 } }),
  player({ id: 'jon-sanz', name: 'Jon Sanz', gender: 'male', ranking: 9, rankingPoints: 6400, age: 25, heightCm: 181, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 89, defense: 82, technique: 86, physical: 90, mental: 84, tactical: 85 } }),
  player({ id: 'martin-di-nenno', name: 'Martin Di Nenno', gender: 'male', ranking: 10, rankingPoints: 6200, age: 29, heightCm: 175, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'defensive', profile: { attack: 82, defense: 94, technique: 91, physical: 91, mental: 93, tactical: 94 } }),
  player({ id: 'paquito-navarro', name: 'Paquito Navarro', gender: 'male', ranking: 11, rankingPoints: 5800, age: 37, heightCm: 181, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 88, defense: 82, technique: 91, physical: 82, mental: 87, tactical: 90 } }),
  player({ id: 'momo-gonzalez', name: 'Momo Gonzalez', gender: 'male', ranking: 12, rankingPoints: 5550, age: 28, heightCm: 180, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 85, defense: 90, technique: 89, physical: 89, mental: 89, tactical: 90 } }),
  player({ id: 'javi-garrido', name: 'Javi Garrido', gender: 'male', ranking: 13, rankingPoints: 5300, age: 25, heightCm: 184, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 90, defense: 82, technique: 86, physical: 88, mental: 82, tactical: 85 } }),
  player({ id: 'lucas-bergamini', name: 'Lucas Bergamini', gender: 'male', ranking: 14, rankingPoints: 5100, age: 28, heightCm: 173, nationality: 'BRA', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 84, defense: 89, technique: 87, physical: 90, mental: 88, tactical: 89 } }),
  player({ id: 'pablo-cardona', name: 'Pablo Cardona', gender: 'male', ranking: 15, rankingPoints: 4820, age: 21, heightCm: 188, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 90, defense: 80, technique: 84, physical: 91, mental: 80, tactical: 82 } }),
  player({ id: 'javi-leal', name: 'Javi Leal', gender: 'male', ranking: 16, rankingPoints: 4700, age: 22, heightCm: 182, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 88, defense: 81, technique: 84, physical: 89, mental: 81, tactical: 83 } }),
  player({ id: 'juan-tello', name: 'Juan Tello', gender: 'male', ranking: 17, rankingPoints: 4500, age: 31, heightCm: 183, nationality: 'ARG', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 88, defense: 83, technique: 85, physical: 88, mental: 84, tactical: 84 } }),
  player({ id: 'edu-alonso', name: 'Edu Alonso', gender: 'male', ranking: 18, rankingPoints: 4380, age: 24, heightCm: 180, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 84, defense: 86, technique: 85, physical: 87, mental: 84, tactical: 85 } }),
  player({ id: 'sanyo-gutierrez', name: 'Sanyo Gutierrez', gender: 'male', ranking: 19, rankingPoints: 4020, age: 41, heightCm: 177, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 84, defense: 84, technique: 94, physical: 76, mental: 91, tactical: 94 } }),
  player({ id: 'lucho-capra', name: 'Lucho Capra', gender: 'male', ranking: 20, rankingPoints: 3900, age: 32, heightCm: 176, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'left', naturalStyle: 'balanced', profile: { attack: 83, defense: 87, technique: 87, physical: 86, mental: 86, tactical: 87 } }),
  player({ id: 'alex-ruiz', name: 'Alex Ruiz', gender: 'male', ranking: 21, rankingPoints: 3760, age: 31, heightCm: 186, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 86, defense: 82, technique: 85, physical: 86, mental: 84, tactical: 85 } }),
  player({ id: 'alejandro-ruiz-granados', name: 'Alejandro Ruiz Granados', gender: 'male', ranking: 22, rankingPoints: 3600, age: 30, heightCm: 182, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 83, defense: 85, technique: 85, physical: 85, mental: 84, tactical: 85 } }),
  player({ id: 'victor-ruiz', name: 'Victor Ruiz', gender: 'male', ranking: 23, rankingPoints: 3450, age: 36, heightCm: 181, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'defensive', profile: { attack: 79, defense: 88, technique: 84, physical: 82, mental: 86, tactical: 88 } }),
  player({ id: 'pablo-lima', name: 'Pablo Lima', gender: 'male', ranking: 24, rankingPoints: 3300, age: 39, heightCm: 180, nationality: 'BRA', preferredSide: 'drive', dominantHand: 'left', naturalStyle: 'defensive', profile: { attack: 81, defense: 89, technique: 88, physical: 80, mental: 89, tactical: 91 } }),
  player({ id: 'maxi-sanchez', name: 'Maxi Sanchez', gender: 'male', ranking: 25, rankingPoints: 3180, age: 39, heightCm: 183, nationality: 'ARG', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 83, defense: 84, technique: 86, physical: 79, mental: 86, tactical: 87 } }),

  // Women.
  player({ id: 'gemma-triay', name: 'Gemma Triay', gender: 'female', ranking: 1, rankingPoints: 18840, age: 33, heightCm: 174, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 93, defense: 91, technique: 95, physical: 89, mental: 95, tactical: 96 } }),
  player({ id: 'delfi-brea', name: 'Delfi Brea', gender: 'female', ranking: 2, rankingPoints: 17260, age: 26, heightCm: 170, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 94, defense: 87, technique: 92, physical: 92, mental: 91, tactical: 90 } }),
  player({ id: 'ari-sanchez', name: 'Ari Sanchez', gender: 'female', ranking: 3, rankingPoints: 14740, age: 28, heightCm: 165, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 89, defense: 92, technique: 94, physical: 91, mental: 94, tactical: 94 } }),
  player({ id: 'paula-josemaria', name: 'Paula Josemaria', gender: 'female', ranking: 4, rankingPoints: 14740, age: 29, heightCm: 168, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 94, defense: 87, technique: 92, physical: 91, mental: 92, tactical: 91 } }),
  player({ id: 'claudia-fernandez', name: 'Claudia Fernandez', gender: 'female', ranking: 5, rankingPoints: 13130, age: 20, heightCm: 169, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 87, defense: 90, technique: 90, physical: 90, mental: 88, tactical: 89 } }),
  player({ id: 'bea-gonzalez', name: 'Bea Gonzalez', gender: 'female', ranking: 6, rankingPoints: 10860, age: 24, heightCm: 171, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 93, defense: 84, technique: 90, physical: 91, mental: 86, tactical: 88 } }),
  player({ id: 'sofia-araujo', name: 'Sofia Araujo', gender: 'female', ranking: 7, rankingPoints: 7790, age: 31, heightCm: 178, nationality: 'POR', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 90, defense: 84, technique: 87, physical: 90, mental: 86, tactical: 86 } }),
  player({ id: 'marta-ortega', name: 'Marta Ortega', gender: 'female', ranking: 8, rankingPoints: 7550, age: 29, heightCm: 170, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 86, defense: 90, technique: 91, physical: 88, mental: 90, tactical: 91 } }),
  player({ id: 'andrea-ustero', name: 'Andrea Ustero', gender: 'female', ranking: 9, rankingPoints: 6345, age: 18, heightCm: 171, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'left', naturalStyle: 'offensive', profile: { attack: 88, defense: 84, technique: 86, physical: 90, mental: 82, tactical: 84 } }),
  player({ id: 'tamara-icardo', name: 'Tamara Icardo', gender: 'female', ranking: 10, rankingPoints: 5940, age: 30, heightCm: 168, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 85, defense: 89, technique: 89, physical: 86, mental: 88, tactical: 89 } }),
  player({ id: 'alejandra-alonso', name: 'Alejandra Alonso', gender: 'female', ranking: 11, rankingPoints: 5485, age: 19, heightCm: 170, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 87, defense: 83, technique: 85, physical: 89, mental: 82, tactical: 84 } }),
  player({ id: 'claudia-jensen', name: 'Claudia Jensen', gender: 'female', ranking: 12, rankingPoints: 5160, age: 20, heightCm: 168, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 86, defense: 86, technique: 87, physical: 88, mental: 84, tactical: 85 } }),
  player({ id: 'alejandra-salazar', name: 'Alejandra Salazar', gender: 'female', ranking: 13, rankingPoints: 5030, age: 40, heightCm: 169, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 84, defense: 88, technique: 92, physical: 78, mental: 91, tactical: 93 } }),
  player({ id: 'vero-virseda', name: 'Vero Virseda', gender: 'female', ranking: 14, rankingPoints: 4560, age: 33, heightCm: 174, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 85, defense: 87, technique: 87, physical: 84, mental: 86, tactical: 87 } }),
  player({ id: 'aranzazu-osoro', name: 'Aranzazu Osoro', gender: 'female', ranking: 15, rankingPoints: 3600, age: 29, heightCm: 168, nationality: 'ARG', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'counter', profile: { attack: 82, defense: 91, technique: 87, physical: 90, mental: 90, tactical: 90 } }),
  player({ id: 'martina-calvo', name: 'Martina Calvo', gender: 'female', ranking: 16, rankingPoints: 3372, age: 17, heightCm: 170, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 84, defense: 84, technique: 84, physical: 88, mental: 80, tactical: 82 } }),
  player({ id: 'jessica-castello', name: 'Jessica Castello', gender: 'female', ranking: 17, rankingPoints: 3340, age: 28, heightCm: 165, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 83, defense: 87, technique: 86, physical: 86, mental: 86, tactical: 86 } }),
  player({ id: 'lucia-sainz', name: 'Lucia Sainz', gender: 'female', ranking: 18, rankingPoints: 3220, age: 41, heightCm: 170, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'defensive', profile: { attack: 80, defense: 89, technique: 88, physical: 78, mental: 90, tactical: 91 } }),
  player({ id: 'bea-caldera', name: 'Bea Caldera', gender: 'female', ranking: 19, rankingPoints: 3185, age: 23, heightCm: 169, nationality: 'ESP', preferredSide: 'revers', dominantHand: 'right', naturalStyle: 'offensive', profile: { attack: 85, defense: 83, technique: 84, physical: 86, mental: 82, tactical: 83 } }),
  player({ id: 'marina-guinart', name: 'Marina Guinart', gender: 'female', ranking: 20, rankingPoints: 3180, age: 28, heightCm: 171, nationality: 'ESP', preferredSide: 'drive', dominantHand: 'right', naturalStyle: 'balanced', profile: { attack: 82, defense: 86, technique: 85, physical: 85, mental: 84, tactical: 85 } }),
];
