import type { Tournament } from '../types';

export const careerCalendar: Tournament[] = [
  {
    id: 'sevilla-challenger',
    name: 'Sevilla Challenger',
    category: 'Challenger',
    surface: 'slow',
    startDay: 7,
    prizeMoney: 45000,
    participantPairs: 32,
    opponentPlayerIds: ['momo-gonzalez', 'javi-garrido'],
  },
  {
    id: 'mendoza-p2',
    name: 'Mendoza P2',
    category: 'P2',
    surface: 'standard',
    startDay: 18,
    prizeMoney: 120000,
    participantPairs: 48,
    opponentPlayerIds: ['martin-di-nenno', 'franco-stupaczuk'],
  },
  {
    id: 'madrid-p1',
    name: 'Madrid P1',
    category: 'P1',
    surface: 'fast',
    startDay: 31,
    prizeMoney: 240000,
    participantPairs: 56,
    opponentPlayerIds: ['fede-chingotto', 'ale-galan'],
  },
];
