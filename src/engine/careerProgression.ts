import type { CareerEvent, CareerProfile, Injury, Player, PlayerStats, RankingEntry, TrainingFocus } from '../types';
import { createRng } from './rng';

const statKeys: Record<Exclude<TrainingFocus, 'recovery'>, Array<[keyof PlayerStats, string]>> = {
  attack: [
    ['attack', 'smash'],
    ['attack', 'vibora'],
    ['attack', 'volleyAttack'],
  ],
  defense: [
    ['defense', 'lob'],
    ['defense', 'recovery'],
    ['defense', 'wallExit'],
  ],
  technique: [
    ['technique', 'precision'],
    ['technique', 'serve'],
    ['technique', 'slice'],
  ],
  physical: [
    ['physical', 'speed'],
    ['physical', 'stamina'],
    ['physical', 'reflexes'],
  ],
  mental: [
    ['mental', 'composure'],
    ['mental', 'focus'],
    ['mental', 'teamwork'],
  ],
  tactical: [
    ['tactical', 'gameReading'],
    ['tactical', 'positioning'],
    ['tactical', 'anticipation'],
  ],
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

export const applyTrainingToPlayer = (player: Player, focus: TrainingFocus, injury: Injury | null): Player => {
  const next: Player = { ...player, stats: structuredClone(player.stats) };
  if (focus === 'recovery') {
    next.stats.physical.stamina = clamp(next.stats.physical.stamina + 1);
    next.stats.mental.focus = clamp(next.stats.mental.focus + 1);
    return next;
  }

  const injuryPenalty = injury ? 0.45 : 1;
  const ageFactor = player.age <= 24 ? 1.25 : player.age <= 31 ? 1 : player.age <= 35 ? 0.72 : 0.45;
  const gain = Math.max(1, Math.round(2 * injuryPenalty * ageFactor));

  for (const [family, key] of statKeys[focus]) {
    const statsFamily = next.stats[family] as Record<string, number>;
    statsFamily[key] = clamp(statsFamily[key] + gain);
  }

  return next;
};

export const rollTrainingInjury = (profile: CareerProfile, focus: TrainingFocus, seed: number): Injury | null => {
  if (focus === 'recovery' || profile.injury) {
    return null;
  }
  const rng = createRng(seed);
  const loadRisk = profile.trainingLoad * 0.018;
  const focusRisk = focus === 'physical' ? 0.045 : focus === 'attack' ? 0.026 : 0.018;
  if (rng.next() > loadRisk + focusRisk) {
    return null;
  }
  const major = rng.next() > 0.88;
  const moderate = !major && rng.next() > 0.68;
  return {
    id: `injury-${profile.currentDay}-${seed}`,
    label: major ? 'Dechirure musculaire' : moderate ? 'Tendinite genou' : 'Alerte epaule',
    severity: major ? 'major' : moderate ? 'moderate' : 'minor',
    remainingDays: major ? 42 : moderate ? 18 : 7,
    affectedFamily: focus === 'physical' ? 'physical' : focus === 'attack' ? 'attack' : 'mental',
  };
};

export const progressInjury = (injury: Injury | null, days: number): Injury | null => {
  if (!injury) {
    return null;
  }
  const remainingDays = injury.remainingDays - days;
  return remainingDays > 0 ? { ...injury, remainingDays } : null;
};

export const agePlayersOneSeason = (players: Player[]): Player[] =>
  players.map((player) => {
    const next: Player = { ...player, age: player.age + 1, stats: structuredClone(player.stats) };
    if (next.age >= 32) {
      const physicalDrop = next.age >= 36 ? 3 : 1;
      next.stats.physical.speed = clamp(next.stats.physical.speed - physicalDrop);
      next.stats.physical.stamina = clamp(next.stats.physical.stamina - physicalDrop);
      next.stats.physical.jump = clamp(next.stats.physical.jump - physicalDrop);
      next.stats.mental.composure = clamp(next.stats.mental.composure + 1);
      next.stats.tactical.gameReading = clamp(next.stats.tactical.gameReading + 1);
    }
    return next;
  });

export const recalculateRankings = (players: Player[], careerPlayerId: string | null, careerPoints: number): Player[] => {
  const withPoints = players.map((player) => ({
    ...player,
    rankingPoints: player.id === careerPlayerId ? careerPoints : Math.max(0, Math.round(player.rankingPoints * 0.985)),
  }));
  const sorted = [...withPoints].sort((a, b) => b.rankingPoints - a.rankingPoints || a.name.localeCompare(b.name));
  const rankById = new Map(sorted.map((player, index) => [player.id, index + 1]));
  return withPoints.map((player) => ({ ...player, ranking: rankById.get(player.id) ?? player.ranking }));
};

export const getRankingTable = (players: Player[], limit = 20): RankingEntry[] =>
  [...players]
    .sort((a, b) => b.rankingPoints - a.rankingPoints || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((player, index) => ({
      playerId: player.id,
      name: player.name,
      points: player.rankingPoints,
      rank: index + 1,
    }));

export const careerEvent = (day: number, type: CareerEvent['type'], message: string): CareerEvent => ({
  id: `${type}-${day}-${message.slice(0, 12)}`,
  day,
  type,
  message,
});
