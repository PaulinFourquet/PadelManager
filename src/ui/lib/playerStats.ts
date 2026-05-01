import type { Player } from '@/types';

export const statAverage = (player: Player) => {
  const values = Object.values(player.stats).flatMap((family) => Object.values(family));
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const statFamilies = ['attack', 'defense', 'technique', 'physical', 'mental', 'tactical'] as const;
