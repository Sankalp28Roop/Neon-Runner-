
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Track } from './Track';
import { Player } from './Player';
import { Policeman } from './Policeman';
import { COLOR_GROUND } from '../constants';
import { Lane } from '../types';

export const GameScene = () => {
  const [playerZ, setPlayerZ] = useState(0);
  const [playerLane, setPlayerLane] = useState<Lane>(0);
  const [playerY, setPlayerY] = useState(0);

  // Sync player position to State for Track generation logic
  const handlePositionUpdate = (z: number, lane: Lane, y: number) => {
    setPlayerZ(z);
    setPlayerLane(lane);
    setPlayerY(y);
  };

  return (
    <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
      <fog attach="fog" args={[COLOR_GROUND, 10, 50]} />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      
      {/* Dynamic World */}
      <Track playerZ={playerZ} playerLane={playerLane} playerY={playerY} />
      <Player onPositionUpdate={handlePositionUpdate} />
      <Policeman playerZ={playerZ} playerLane={playerLane} />
      
      {/* Environment Decor */}
      <mesh position={[0, -1, playerZ - 20]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color={COLOR_GROUND} />
      </mesh>

    </Canvas>
  );
};
