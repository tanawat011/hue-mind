export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isBot?: boolean;
}

export interface ChatMessage {
  playerId: string;
  name: string;
  message: string;
  timestamp: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface GameState {
  round: number;
  maxRounds: number;
  currentTurnIndex: number;
  targetChoices?: Coordinate[];
  targetColor: Coordinate | null;
  clue: string | null;
  guesses: Record<string, Coordinate>;
  phase: 'CLUE_PHASE' | 'GUESS_PHASE' | 'SCORE_PHASE';
  turnDeadline?: number | null;
}

export interface Settings {
  useTimer?: boolean;
  timerDuration?: number;
  roundsCount?: number;
  boardSize?: Coordinate;
  botDifficulty?: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  allowDuplicateGuesses?: boolean;
}

export interface Room {
  code: string;
  password?: string | null;
  players: Player[];
  state: 'LOBBY' | 'PLAYING' | 'FINISHED';
  gameState: GameState | null;
  chat: ChatMessage[];
  settings?: Settings;
  timerId?: NodeJS.Timeout | null;
}
