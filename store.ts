import { create } from 'zustand';
import { GameState, PowerUpType } from './types';
import { SPEED_INCREMENT, PLAYER_SPEED_MAX, PLAYER_SPEED_INITIAL, POWERUP_DURATION } from './constants';

interface State {
  status: GameState;
  score: number;
  highScore: number;
  speed: number;
  activePowerups: { [key in PowerUpType]?: number }; // Expiry timestamp
  policemanChase: boolean;
  
  // Actions
  startGame: () => void;
  gameOver: () => void;
  restart: () => void;
  incrementScore: (amount: number) => void;
  increaseSpeed: () => void;
  activatePowerup: (type: PowerUpType) => void;
  triggerStumble: () => void;
  clearPowerups: () => void;
}

export const useGameStore = create<State>((set, get) => ({
  status: GameState.MENU,
  score: 0,
  highScore: parseInt(localStorage.getItem('neon-runner-highscore') || '0'),
  speed: PLAYER_SPEED_INITIAL,
  activePowerups: {},
  policemanChase: false,

  startGame: () => set({ 
    status: GameState.PLAYING, 
    score: 0, 
    speed: PLAYER_SPEED_INITIAL, 
    activePowerups: {},
    policemanChase: false 
  }),
  
  gameOver: () => set((state) => {
    const newHighScore = Math.max(state.score, state.highScore);
    localStorage.setItem('neon-runner-highscore', newHighScore.toString());
    return { status: GameState.GAME_OVER, highScore: newHighScore };
  }),

  restart: () => set({ 
    status: GameState.PLAYING, 
    score: 0, 
    speed: PLAYER_SPEED_INITIAL,
    activePowerups: {},
    policemanChase: false
  }),

  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),

  increaseSpeed: () => set((state) => ({ 
    speed: Math.min(state.speed + SPEED_INCREMENT, PLAYER_SPEED_MAX) 
  })),

  activatePowerup: (type) => set((state) => ({
    activePowerups: {
      ...state.activePowerups,
      [type]: Date.now() + POWERUP_DURATION
    }
  })),

  triggerStumble: () => {
    const { policemanChase, gameOver } = get();
    if (policemanChase) {
      // If already being chased and stumble again -> Caught
      gameOver();
    } else {
      // Start chase
      set({ policemanChase: true });
      // Reset chase after 5 seconds if no more stumbles
      setTimeout(() => {
        // We need to check if game is still playing, but minimal check here
        set(s => s.status === GameState.PLAYING ? { policemanChase: false } : {});
      }, 5000);
    }
  },

  clearPowerups: () => set({ activePowerups: {} })
}));