import type { Team } from '../types';
import { realPlayers } from './realPlayers.seed';

export const samplePlayers = realPlayers;

export const sampleTeams: Record<'A' | 'B', Team> = {
  A: {
    id: 'A',
    name: 'Coello / Tapia',
    players: [realPlayers[0], realPlayers[1]],
  },
  B: {
    id: 'B',
    name: 'Chingotto / Galan',
    players: [realPlayers[2], realPlayers[3]],
  },
};
