import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterModel, Outfit } from './Player';
import { useGameStore } from '../store';
import { LANE_WIDTH, PLAYER_SPEED_INITIAL, CHAR_POLICE_HAT, CHAR_POLICE_PANTS, CHAR_POLICE_SHIRT, CHAR_POLICE_SHOES, CHAR_POLICE_SKIN } from '../constants';
import { Lane } from '../types';

const POLICE_OUTFIT: Outfit = {
  skin: CHAR_POLICE_SKIN,
  hat: CHAR_POLICE_HAT,
  top: CHAR_POLICE_SHIRT,
  vest: CHAR_POLICE_SHIRT,
  pants: CHAR_POLICE_PANTS,
  shoes: CHAR_POLICE_SHOES
};

interface PolicemanProps {
  playerZ: number;
  playerLane: Lane;
}

export const Policeman = ({ playerZ, playerLane }: PolicemanProps) => {
  const { speed, status, policemanChase } = useGameStore();
  const meshRef = useRef<THREE.Group>(null);
  const currentLaneX = useRef(0);

  // Chase distance calculation
  // If policemanChase is true (stumble), he is VERY close (2-3 units).
  // Otherwise he drifts back based on speed.
  const targetDistance = policemanChase ? 2.5 : (3 + (speed - PLAYER_SPEED_INITIAL) * 2);
  const isVisible = targetDistance < 12; 

  useFrame((state, delta) => {
    if (status !== 'PLAYING' || !meshRef.current) return;

    // Follow player lane
    const targetX = playerLane * LANE_WIDTH;
    currentLaneX.current = THREE.MathUtils.lerp(currentLaneX.current, targetX, delta * 3);

    // Z Position
    // We interpolate current Z to target Z for smooth "catching up" effect when stumbling
    const currentRelZ = meshRef.current.position.z - playerZ;
    const newRelZ = THREE.MathUtils.lerp(currentRelZ, targetDistance, delta * 2);
    
    meshRef.current.position.z = playerZ + newRelZ;
    meshRef.current.position.x = currentLaneX.current;
    meshRef.current.position.y = 0;
  });

  if (!isVisible) return null;

  return (
    <group ref={meshRef}>
      <CharacterModel 
        isJumping={false} 
        isSliding={false} 
        speed={speed} 
        runDelta={0}
        outfit={POLICE_OUTFIT}
      />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
         <circleGeometry args={[0.6, 16]} />
         <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};