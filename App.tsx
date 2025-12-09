import React, { useEffect, useState } from 'react';
import { GameScene } from './components/GameScene';
import { useGameStore } from './store';
import { GameState } from './types';
import { playSound } from './utils';
import { COLOR_MAGNET, COLOR_SNEAKERS } from './constants';

const App: React.FC = () => {
  const { status, score, highScore, startGame, restart, speed, activePowerups } = useGameStore();
  const [now, setNow] = useState(Date.now());

  // Timer loop for UI updates
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAudio = () => playSound('click');
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const getPowerupTime = (expiry?: number) => {
    if (!expiry || expiry < now) return 0;
    return Math.ceil((expiry - now) / 1000);
  };

  const magnetTime = getPowerupTime(activePowerups.magnet);
  const sneakersTime = getPowerupTime(activePowerups.sneakers);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono select-none">
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start text-white drop-shadow-md">
          <div className="text-xl font-bold bg-black/50 p-2 rounded">
            <div>SCORE: {Math.floor(score).toString().padStart(6, '0')}</div>
            <div className="text-sm text-gray-400">HI: {highScore.toString().padStart(6, '0')}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right bg-black/50 p-2 rounded">
               <div className="text-cyan-400 font-bold">SPEED: {Math.floor(speed)} MPH</div>
            </div>
            {/* Powerups HUD */}
            {magnetTime > 0 && (
              <div className="bg-black/50 p-2 rounded flex items-center gap-2 text-white">
                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_MAGNET }}></div>
                 <span>MAGNET: {magnetTime}s</span>
              </div>
            )}
            {sneakersTime > 0 && (
              <div className="bg-black/50 p-2 rounded flex items-center gap-2 text-white">
                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_SNEAKERS }}></div>
                 <span>SNEAKERS: {sneakersTime}s</span>
              </div>
            )}
          </div>
        </div>

        {status === GameState.MENU && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
            <div className="text-center">
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 animate-pulse">
                NEON RUNNER
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                WASD / Arrows to Move • SPACE to Jump • DOWN to Roll/Drop
              </p>
              <button 
                onClick={() => { playSound('click'); startGame(); }}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105 active:scale-95"
              >
                START RUN
              </button>
            </div>
          </div>
        )}

        {status === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-md pointer-events-auto">
             <div className="text-center transform transition-all animate-bounce-in">
              <h2 className="text-5xl font-bold text-white mb-2">BUSTED!</h2>
              <div className="text-2xl text-red-200 mb-6">Final Score: {Math.floor(score)}</div>
              <button 
                onClick={() => { playSound('click'); restart(); }}
                className="px-8 py-3 bg-white text-red-600 font-bold text-xl rounded shadow-lg hover:bg-gray-100 transition-colors"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
      
      {status === GameState.PLAYING && (
        <div className="absolute bottom-10 left-0 right-0 text-center text-white/30 text-sm pointer-events-none">
           (Use Keyboard to Play)
        </div>
      )}
    </div>
  );
};

export default App;