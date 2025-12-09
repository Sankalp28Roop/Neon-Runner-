export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export type Lane = -1 | 0 | 1;

export type PowerUpType = 'sneakers' | 'magnet';

export type ObstacleType = 'train' | 'barrier' | 'signal';

export interface GameStore {
  status: GameState;
  score: number;
  highScore: number;
  speed: number;
  activePowerups: Record<PowerUpType, number>; // value is timestamp when it expires
  policemanChase: boolean; // if true, policeman is right behind you (stumbled)
  
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  increaseSpeed: () => void;
  activatePowerup: (type: PowerUpType) => void;
  triggerStumble: () => void;
}