import type { GameScore, MatchOptions, PointScore } from '../types';

export const createInitialScore = (): GameScore => ({
  points: { A: 0, B: 0 },
  games: { A: 0, B: 0 },
  sets: { A: 0, B: 0 },
  completedSets: [],
  tieBreak: null,
  matchWinner: null,
});

const pointOrder: PointScore[] = [0, 15, 30, 40];

export const cloneScore = (score: GameScore): GameScore => ({
  points: { ...score.points },
  games: { ...score.games },
  sets: { ...score.sets },
  completedSets: score.completedSets.map((setScore) => ({ ...setScore })),
  tieBreak: score.tieBreak
    ? {
        points: { ...score.tieBreak.points },
        serverAfterFirstPoint: score.tieBreak.serverAfterFirstPoint,
      }
    : null,
  matchWinner: score.matchWinner,
});

export const getOpponent = (team: 'A' | 'B'): 'A' | 'B' => (team === 'A' ? 'B' : 'A');

export const isBreakPoint = (score: GameScore, receiver: 'A' | 'B') => {
  const server = getOpponent(receiver);
  if (score.tieBreak) {
    return false;
  }
  return score.points[receiver] === 40 && score.points[server] !== 'AD';
};

export const isSetPoint = (score: GameScore, team: 'A' | 'B') => {
  const opponent = getOpponent(team);
  if (score.tieBreak) {
    return score.tieBreak.points[team] >= 6 && score.tieBreak.points[team] - score.tieBreak.points[opponent] >= 1;
  }
  const couldWinGame = score.points[team] === 40 || score.points[team] === 'AD';
  return couldWinGame && score.games[team] >= 5 && score.games[team] >= score.games[opponent];
};

export const scorePointLabel = (score: GameScore) => {
  if (score.tieBreak) {
    return `TB ${score.tieBreak.points.A}-${score.tieBreak.points.B}, games ${score.games.A}-${score.games.B}, sets ${score.sets.A}-${score.sets.B}`;
  }
  return `${score.points.A}-${score.points.B}, games ${score.games.A}-${score.games.B}, sets ${score.sets.A}-${score.sets.B}`;
};

export const applyPointToScore = (score: GameScore, winner: 'A' | 'B', options: MatchOptions): GameScore => {
  const next = cloneScore(score);
  const loser = getOpponent(winner);

  if (next.tieBreak) {
    next.tieBreak.points[winner] += 1;
    if (next.tieBreak.points[winner] >= 7 && next.tieBreak.points[winner] - next.tieBreak.points[loser] >= 2) {
      next.games[winner] += 1;
      return completeSet(next, winner, options);
    }
    return next;
  }

  if (options.puntoDeOro && next.points.A === 40 && next.points.B === 40) {
    next.games[winner] += 1;
    return completeGame(next, winner, options);
  }

  const winningPoint = next.points[winner];
  const losingPoint = next.points[loser];

  if (winningPoint === 'AD') {
    next.games[winner] += 1;
    return completeGame(next, winner, options);
  }

  if (winningPoint === 40 && losingPoint !== 40 && losingPoint !== 'AD') {
    next.games[winner] += 1;
    return completeGame(next, winner, options);
  }

  if (winningPoint === 40 && losingPoint === 40) {
    next.points[winner] = 'AD';
    return next;
  }

  if (winningPoint === 40 && losingPoint === 'AD') {
    next.points[loser] = 40;
    return next;
  }

  const currentIndex = pointOrder.indexOf(winningPoint);
  next.points[winner] = pointOrder[currentIndex + 1];
  return next;
};

const completeGame = (score: GameScore, gameWinner: 'A' | 'B', options: MatchOptions): GameScore => {
  score.points = { A: 0, B: 0 };
  const loser = getOpponent(gameWinner);

  if (score.games.A === 6 && score.games.B === 6) {
    score.tieBreak = {
      points: { A: 0, B: 0 },
      serverAfterFirstPoint: loser,
    };
    return score;
  }

  if (score.games[gameWinner] >= 6 && score.games[gameWinner] - score.games[loser] >= 2) {
    return completeSet(score, gameWinner, options);
  }

  return score;
};

const completeSet = (score: GameScore, setWinner: 'A' | 'B', options: MatchOptions): GameScore => {
  score.completedSets.push({ ...score.games });
  score.sets[setWinner] += 1;
  score.points = { A: 0, B: 0 };
  score.games = { A: 0, B: 0 };
  score.tieBreak = null;

  const setsToWin = Math.ceil(options.bestOfSets / 2);
  if (score.sets[setWinner] >= setsToWin) {
    score.matchWinner = setWinner;
  }

  return score;
};
