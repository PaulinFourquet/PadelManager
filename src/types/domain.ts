export type PreferredSide = 'drive' | 'revers';
export type DominantHand = 'right' | 'left';
export type NaturalStyle = 'offensive' | 'balanced' | 'defensive' | 'counter';
export type PlayerGender = 'male' | 'female';

export type PlayerStats = {
  attack: {
    smash: number;
    vibora: number;
    bandejaOff: number;
    volleyAttack: number;
  };
  defense: {
    lob: number;
    wallExit: number;
    recovery: number;
    bandejaDef: number;
  };
  technique: {
    precision: number;
    slice: number;
    topspin: number;
    serve: number;
  };
  physical: {
    speed: number;
    stamina: number;
    reflexes: number;
    jump: number;
  };
  mental: {
    composure: number;
    focus: number;
    adaptability: number;
    teamwork: number;
  };
  tactical: {
    gameReading: number;
    positioning: number;
    anticipation: number;
  };
};

export type Player = {
  id: string;
  name: string;
  gender: PlayerGender;
  ranking: number;
  rankingPoints: number;
  age: number;
  heightCm: number;
  nationality: string;
  photoUrl: string;
  preferredSide: PreferredSide;
  dominantHand: DominantHand;
  naturalStyle: NaturalStyle;
  stats: PlayerStats;
};

export type Team = {
  id: 'A' | 'B';
  name: string;
  players: [Player, Player];
};

export type GlobalStyle = 'veryDefensive' | 'defensive' | 'balanced' | 'offensive' | 'veryOffensive';
export type NetPosition = 'deep' | 'standard' | 'advanced';
export type NetPressure = 'low' | 'medium' | 'high';
export type TargetPreference = 'weakPlayer' | 'balanced' | 'strongPlayer' | 'center';
export type RiskTaking = 'safe' | 'standard' | 'risky';

export type TacticalOrders = {
  globalStyle: GlobalStyle;
  netPosition: NetPosition;
  netPressure: NetPressure;
  targetPreference: TargetPreference;
  riskTaking: RiskTaking;
  moraleBoostsRemaining: number;
};

export type MatchOptions = {
  bestOfSets: 3;
  puntoDeOro: boolean;
  surface: 'standard' | 'fast' | 'slow';
  maxRalliesPerPoint: number;
};

export type PointScore = 0 | 15 | 30 | 40 | 'AD';

export type GameScore = {
  points: Record<'A' | 'B', PointScore>;
  games: Record<'A' | 'B', number>;
  sets: Record<'A' | 'B', number>;
  completedSets: Array<Record<'A' | 'B', number>>;
  tieBreak: null | {
    points: Record<'A' | 'B', number>;
    serverAfterFirstPoint: 'A' | 'B';
  };
  matchWinner: 'A' | 'B' | null;
};

export type MatchState = {
  teams: Record<'A' | 'B', Team>;
  score: GameScore;
  server: 'A' | 'B';
  serverPlayerIndex: 0 | 1;
  receiver: 'A' | 'B';
  receiverPlayerIndex: 0 | 1;
  orders: Record<'A' | 'B', TacticalOrders>;
  fatigue: Record<'A' | 'B', number>;
  momentum: Array<'A' | 'B'>;
  rngSeed: number;
  options: MatchOptions;
  pointNumber: number;
};

export type ShotType = 'serve' | 'lob' | 'bandeja' | 'vibora' | 'smash' | 'volley' | 'wallExit';
export type RallyOutcome = 'winner' | 'forcedError' | 'unforcedError';

export type RallyEvent = {
  shot: ShotType;
  hitterTeam: 'A' | 'B';
  hitterId: string;
  defenderTeam: 'A' | 'B';
  quality: number;
  description: string;
};

export type RallyResult = {
  pointWinner: 'A' | 'B';
  outcome: RallyOutcome;
  events: RallyEvent[];
  winProbabilityForServer: number;
  tacticalMultiplier: Record<'A' | 'B', number>;
  log: string;
};

export type MatchLogEntry = {
  pointNumber: number;
  winner: 'A' | 'B';
  scoreLabel: string;
  rally: RallyResult;
};

export type MatchResult = {
  winner: 'A' | 'B';
  finalScore: GameScore;
  log: MatchLogEntry[];
  finalState: MatchState;
};

export type TournamentCategory = 'FIP Bronze' | 'FIP Silver' | 'FIP Gold' | 'Challenger' | 'P2' | 'P1' | 'Premier Padel';

export type Tournament = {
  id: string;
  name: string;
  category: TournamentCategory;
  surface: MatchOptions['surface'];
  startDay: number;
  prizeMoney: number;
  participantPairs: number;
  opponentPlayerIds: [string, string];
};

export type CareerProfile = {
  managerName: string;
  playerId: string | null;
  partnerId: string | null;
  currentDay: number;
  season: number;
  rankingPoints: number;
  money: number;
  injury: Injury | null;
  trainingLoad: number;
};

export type CareerMatchSummary = {
  tournamentId: string;
  playerTeamName: string;
  opponentTeamName: string;
  result: MatchResult;
};

export type CameraMode = 'broadcast' | 'top' | 'ball';
export type PlaybackSpeed = 1 | 2 | 5;

export type TrainingFocus = 'attack' | 'defense' | 'technique' | 'physical' | 'mental' | 'tactical' | 'recovery';

export type Injury = {
  id: string;
  label: string;
  severity: 'minor' | 'moderate' | 'major';
  remainingDays: number;
  affectedFamily: keyof PlayerStats;
};

export type CareerEvent = {
  id: string;
  day: number;
  type: 'training' | 'injury' | 'recovery' | 'ranking' | 'season';
  message: string;
};

export type RankingEntry = {
  playerId: string;
  name: string;
  points: number;
  rank: number;
};
