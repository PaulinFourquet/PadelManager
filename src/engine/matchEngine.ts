import type {
  MatchLogEntry,
  MatchOptions,
  MatchResult,
  MatchState,
  Player,
  RallyEvent,
  RallyOutcome,
  RallyResult,
  ShotType,
  TacticalOrders,
  Team,
} from '../types';
import { average, clamp, round } from './math';
import { createRng, type Rng } from './rng';
import { applyPointToScore, createInitialScore, getOpponent, isBreakPoint, isSetPoint, scorePointLabel } from './scoring';

export const defaultOrders = (): TacticalOrders => ({
  globalStyle: 'balanced',
  netPosition: 'standard',
  netPressure: 'medium',
  targetPreference: 'balanced',
  riskTaking: 'standard',
  moraleBoostsRemaining: 1,
});

export const defaultMatchOptions = (): MatchOptions => ({
  bestOfSets: 3,
  puntoDeOro: false,
  surface: 'standard',
  maxRalliesPerPoint: 14,
});

export const createInitialMatchState = (
  teams: Record<'A' | 'B', Team>,
  seed = 12345,
  options: Partial<MatchOptions> = {},
  orders: Partial<Record<'A' | 'B', TacticalOrders>> = {},
): MatchState => ({
  teams,
  score: createInitialScore(),
  server: 'A',
  serverPlayerIndex: 0,
  receiver: 'B',
  receiverPlayerIndex: 0,
  orders: {
    A: orders.A ?? defaultOrders(),
    B: orders.B ?? defaultOrders(),
  },
  fatigue: { A: 0, B: 0 },
  momentum: [],
  rngSeed: seed,
  options: { ...defaultMatchOptions(), ...options },
  pointNumber: 0,
});

const familyAverage = (player: Player, family: keyof Player['stats']) => average(Object.values(player.stats[family]));

const teamAttack = (team: Team) => average(team.players.map((player) => familyAverage(player, 'attack')));
const teamDefense = (team: Team) => average(team.players.map((player) => familyAverage(player, 'defense')));
const teamTechnique = (team: Team) => average(team.players.map((player) => familyAverage(player, 'technique')));
const teamMental = (team: Team) => average(team.players.map((player) => familyAverage(player, 'mental')));
const teamTactical = (team: Team) => average(team.players.map((player) => familyAverage(player, 'tactical')));
const teamPhysical = (team: Team) => average(team.players.map((player) => familyAverage(player, 'physical')));

const styleBias: Record<TacticalOrders['globalStyle'], number> = {
  veryDefensive: -1,
  defensive: -0.55,
  balanced: 0,
  offensive: 0.55,
  veryOffensive: 1,
};

const riskBias: Record<TacticalOrders['riskTaking'], number> = {
  safe: -0.08,
  standard: 0,
  risky: 0.09,
};

const targetBias: Record<TacticalOrders['targetPreference'], number> = {
  weakPlayer: 0.018,
  balanced: 0,
  strongPlayer: -0.014,
  center: 0.01,
};

export const calculateTacticalMultiplier = (
  attackingTeam: Team,
  defendingTeam: Team,
  orders: TacticalOrders,
  opponentOrders: TacticalOrders,
) => {
  const ownAttackEdge = (teamAttack(attackingTeam) - teamDefense(defendingTeam)) / 100;
  const ownDefenseEdge = (teamDefense(attackingTeam) - teamAttack(defendingTeam)) / 100;
  const identityEdge = (teamAttack(attackingTeam) - teamDefense(attackingTeam)) / 100;
  const style = styleBias[orders.globalStyle];
  const desiredEdge = style >= 0 ? ownAttackEdge : ownDefenseEdge;
  const mismatchPenalty = desiredEdge < -0.08 ? desiredEdge * 0.42 : 0;
  const synergyBonus = desiredEdge > 0.06 ? desiredEdge * 0.32 : 0;
  const identityFit = style * identityEdge * 0.12;
  const netBonus = orders.netPosition === 'advanced' && orders.netPressure === 'high' ? ownAttackEdge * 0.18 : 0;
  const pressureBonus = orders.netPressure === 'high' ? 0.006 : orders.netPressure === 'low' ? -0.004 : 0;
  const targetBonus = targetBias[orders.targetPreference];
  const overcommitPenalty =
    orders.netPosition === 'advanced' && opponentOrders.globalStyle === 'veryDefensive' ? -0.02 : 0;
  return clamp(
    1 +
      style * desiredEdge * 0.22 +
      identityFit +
      synergyBonus +
      mismatchPenalty +
      netBonus +
      pressureBonus +
      targetBonus +
      overcommitPenalty,
    0.78,
    1.22,
  );
};

export const calculatePointWinProbability = (state: MatchState, serverTeam: 'A' | 'B') => {
  const receiverTeam = getOpponent(serverTeam);
  const servingTeam = state.teams[serverTeam];
  const returningTeam = state.teams[receiverTeam];
  const server = servingTeam.players[state.serverPlayerIndex];
  const receiver = returningTeam.players[state.receiverPlayerIndex];
  const serveEdge = (server.stats.technique.serve - receiver.stats.tactical.anticipation) / 100;
  const qualityEdge =
    (teamAttack(servingTeam) +
      teamDefense(servingTeam) +
      teamTechnique(servingTeam) +
      teamMental(servingTeam) +
      teamTactical(servingTeam) -
      (teamAttack(returningTeam) +
        teamDefense(returningTeam) +
        teamTechnique(returningTeam) +
        teamMental(returningTeam) +
        teamTactical(returningTeam))) /
    500;
  const fatigueEdge = (state.fatigue[receiverTeam] - state.fatigue[serverTeam]) * 0.13;
  const momentumEdge =
    (state.momentum.filter((winner) => winner === serverTeam).length -
      state.momentum.filter((winner) => winner === receiverTeam).length) *
    0.018;
  const surfaceModifier = state.options.surface === 'fast' ? 0.018 : state.options.surface === 'slow' ? -0.014 : 0;
  const tacticalServer = calculateTacticalMultiplier(
    servingTeam,
    returningTeam,
    state.orders[serverTeam],
    state.orders[receiverTeam],
  );
  const tacticalReceiver = calculateTacticalMultiplier(
    returningTeam,
    servingTeam,
    state.orders[receiverTeam],
    state.orders[serverTeam],
  );
  const raw =
    0.52 +
    serveEdge * 0.12 +
    qualityEdge * 0.27 +
    fatigueEdge +
    momentumEdge +
    surfaceModifier +
    (tacticalServer - tacticalReceiver) * 0.32;
  return clamp(raw, 0.18, 0.82);
};

const chooseShot = (player: Player, orders: TacticalOrders, rng: Rng): ShotType => {
  const attacking = styleBias[orders.globalStyle] + riskBias[orders.riskTaking] > 0.2;
  return rng.pickWeighted<ShotType>([
    { item: 'lob', weight: player.stats.defense.lob * (attacking ? 0.6 : 1.2) },
    { item: 'bandeja', weight: (player.stats.attack.bandejaOff + player.stats.defense.bandejaDef) / 2 },
    { item: 'vibora', weight: player.stats.attack.vibora * (attacking ? 1.15 : 0.85) },
    { item: 'smash', weight: player.stats.attack.smash * (attacking ? 1.35 : 0.65) },
    { item: 'volley', weight: player.stats.attack.volleyAttack * (orders.netPressure === 'high' ? 1.25 : 1) },
    { item: 'wallExit', weight: player.stats.defense.wallExit * (attacking ? 0.65 : 1.1) },
  ]);
};

const shotQuality = (player: Player, shot: ShotType) => {
  switch (shot) {
    case 'serve':
      return average([player.stats.technique.serve, player.stats.technique.precision, player.stats.mental.focus]);
    case 'lob':
      return average([player.stats.defense.lob, player.stats.technique.precision, player.stats.tactical.gameReading]);
    case 'bandeja':
      return average([player.stats.attack.bandejaOff, player.stats.defense.bandejaDef, player.stats.technique.slice]);
    case 'vibora':
      return average([player.stats.attack.vibora, player.stats.technique.slice, player.stats.physical.reflexes]);
    case 'smash':
      return average([player.stats.attack.smash, player.stats.physical.jump, player.stats.technique.precision]);
    case 'volley':
      return average([player.stats.attack.volleyAttack, player.stats.physical.reflexes, player.stats.tactical.positioning]);
    case 'wallExit':
      return average([player.stats.defense.wallExit, player.stats.defense.recovery, player.stats.mental.composure]);
  }
};

const defenseQuality = (player: Player) =>
  average([
    player.stats.defense.recovery,
    player.stats.defense.wallExit,
    player.stats.physical.reflexes,
    player.stats.tactical.anticipation,
    player.stats.mental.focus,
  ]);

const pressureModifier = (state: MatchState, team: 'A' | 'B') => {
  const players = state.teams[team].players;
  const composure = average(players.map((player) => player.stats.mental.composure));
  const important = isBreakPoint(state.score, team) || isSetPoint(state.score, team) ? 1 : 0;
  return important ? (composure - 75) / 1000 : 0;
};

export const simulateRally = (state: MatchState): RallyResult => {
  const rng = createRng(state.rngSeed);
  const serverTeam = state.server;
  const returnTeam = state.receiver;
  const events: RallyEvent[] = [];
  const server = state.teams[serverTeam].players[state.serverPlayerIndex];
  const receiver = state.teams[returnTeam].players[state.receiverPlayerIndex];
  const serverOrders = state.orders[serverTeam];
  const returnOrders = state.orders[returnTeam];
  const tacticalMultiplier = {
    A: calculateTacticalMultiplier(state.teams.A, state.teams.B, state.orders.A, state.orders.B),
    B: calculateTacticalMultiplier(state.teams.B, state.teams.A, state.orders.B, state.orders.A),
  };

  const serveSuccess =
    0.86 +
    (server.stats.technique.serve - 70) * 0.002 +
    (server.stats.mental.composure - 70) * 0.001 +
    (serverOrders.riskTaking === 'risky' ? -0.035 : serverOrders.riskTaking === 'safe' ? 0.025 : 0) +
    pressureModifier(state, serverTeam);

  events.push({
    shot: 'serve',
    hitterTeam: serverTeam,
    hitterId: server.id,
    defenderTeam: returnTeam,
    quality: round(shotQuality(server, 'serve')),
    description: `${server.name} sert vers ${receiver.name}.`,
  });

  if (rng.next() > clamp(serveSuccess, 0.68, 0.97)) {
    return {
      pointWinner: returnTeam,
      outcome: 'unforcedError',
      events,
      winProbabilityForServer: calculatePointWinProbability(state, serverTeam),
      tacticalMultiplier,
      log: `Faute au service de ${server.name}. Point ${state.teams[returnTeam].name}.`,
    };
  }

  let hitterTeam = returnTeam;
  let defenderTeam = serverTeam;
  let hitterIndex: 0 | 1 = state.receiverPlayerIndex;
  let defenderIndex: 0 | 1 = state.serverPlayerIndex;
  const serverWinProbability = calculatePointWinProbability(state, serverTeam);

  for (let rallyShot = 0; rallyShot < state.options.maxRalliesPerPoint; rallyShot += 1) {
    const hitter = state.teams[hitterTeam].players[hitterIndex];
    const defender = state.teams[defenderTeam].players[defenderIndex];
    const orders = state.orders[hitterTeam];
    const shot = chooseShot(hitter, orders, rng);
    const attackQuality = shotQuality(hitter, shot) * tacticalMultiplier[hitterTeam] * (1 - state.fatigue[hitterTeam] * 0.18);
    const defendingQuality = defenseQuality(defender) * tacticalMultiplier[defenderTeam] * (1 - state.fatigue[defenderTeam] * 0.15);
    const risk = riskBias[orders.riskTaking];
    const qualityEdge = (attackQuality - defendingQuality) / 100;
    const winnerChance = clamp(0.085 + qualityEdge * 0.22 + Math.max(risk, 0) * 0.26, 0.025, 0.31);
    const errorChance = clamp(0.055 - qualityEdge * 0.08 + Math.max(risk, 0) * 0.22 - Math.min(risk, 0) * 0.12, 0.018, 0.24);
    const roll = rng.next();

    events.push({
      shot,
      hitterTeam,
      hitterId: hitter.id,
      defenderTeam,
      quality: round(attackQuality),
      description: `${hitter.name} joue ${shot} face a ${defender.name}.`,
    });

    if (roll < winnerChance) {
      return buildRallyResult(hitterTeam, 'winner', events, serverWinProbability, tacticalMultiplier, hitter.name, shot);
    }

    if (roll < winnerChance + errorChance) {
      return buildRallyResult(defenderTeam, rng.next() < 0.55 ? 'forcedError' : 'unforcedError', events, serverWinProbability, tacticalMultiplier, hitter.name, shot);
    }

    const previousHitterTeam = hitterTeam;
    hitterTeam = defenderTeam;
    defenderTeam = previousHitterTeam;
    hitterIndex = defenderIndex;
    defenderIndex = hitterIndex === 0 ? 1 : 0;
  }

  const winner = rng.next() < serverWinProbability ? serverTeam : returnTeam;
  return {
    pointWinner: winner,
    outcome: 'forcedError',
    events,
    winProbabilityForServer: serverWinProbability,
    tacticalMultiplier,
    log: `Long echange. ${state.teams[winner].name} finit par provoquer l'erreur.`,
  };
};

const buildRallyResult = (
  pointWinner: 'A' | 'B',
  outcome: RallyOutcome,
  events: RallyEvent[],
  winProbabilityForServer: number,
  tacticalMultiplier: Record<'A' | 'B', number>,
  playerName: string,
  shot: ShotType,
): RallyResult => ({
  pointWinner,
  outcome,
  events,
  winProbabilityForServer,
  tacticalMultiplier,
  log:
    outcome === 'winner'
      ? `${playerName} claque un ${shot} gagnant.`
      : `${playerName} cede sur un ${shot}.`,
});

export const advanceStateAfterRally = (state: MatchState, rally: RallyResult): MatchState => {
  const rng = createRng(state.rngSeed);
  for (let i = 0; i <= rally.events.length; i += 1) {
    rng.next();
  }

  const nextScore = applyPointToScore(state.score, rally.pointWinner, state.options);
  const next: MatchState = {
    ...state,
    score: nextScore,
    pointNumber: state.pointNumber + 1,
    rngSeed: rng.seed,
    fatigue: {
      A: clamp(state.fatigue.A + (rally.events.length * (rally.pointWinner === 'A' ? 0.0012 : 0.0015)), 0, 0.42),
      B: clamp(state.fatigue.B + (rally.events.length * (rally.pointWinner === 'B' ? 0.0012 : 0.0015)), 0, 0.42),
    },
    momentum: [...state.momentum, rally.pointWinner].slice(-3),
  };

  const gameOrSetReset = nextScore.points.A === 0 && nextScore.points.B === 0 && !nextScore.matchWinner;
  if (gameOrSetReset || nextScore.tieBreak) {
    const server = getOpponent(state.server);
    next.server = server;
    next.receiver = getOpponent(server);
    next.serverPlayerIndex = state.serverPlayerIndex === 0 ? 1 : 0;
    next.receiverPlayerIndex = state.receiverPlayerIndex === 0 ? 1 : 0;
  }

  return next;
};

export const simulatePoint = (state: MatchState): { state: MatchState; entry: MatchLogEntry } => {
  const rally = simulateRally(state);
  const nextState = advanceStateAfterRally(state, rally);
  return {
    state: nextState,
    entry: {
      pointNumber: state.pointNumber + 1,
      winner: rally.pointWinner,
      scoreLabel: scorePointLabel(nextState.score),
      rally,
    },
  };
};

export const simulateMatch = (initialState: MatchState, pointLimit = 500): MatchResult => {
  let state = initialState;
  const log: MatchLogEntry[] = [];

  while (!state.score.matchWinner && log.length < pointLimit) {
    const point = simulatePoint(state);
    state = point.state;
    log.push(point.entry);
  }

  if (!state.score.matchWinner) {
    throw new Error(`Match did not finish within ${pointLimit} points`);
  }

  return {
    winner: state.score.matchWinner,
    finalScore: state.score,
    log,
    finalState: state,
  };
};
