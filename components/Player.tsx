import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { 
  LANE_WIDTH, 
  JUMP_FORCE, 
  JUMP_FORCE_SNEAKERS,
  GRAVITY, 
  FAST_DROP_GRAVITY,
  CHAR_SKIN,
  CHAR_HAT_MAIN,
  CHAR_HOODIE,
  CHAR_VEST,
  CHAR_PANTS,
  CHAR_SHOES
} from '../constants';
import { Lane, GameState } from '../types';
import { playSound } from '../utils';

interface PlayerProps {
  onPositionUpdate: (z: number, lane: Lane, y: number) => void;
}

export interface Outfit {
  skin: string;
  hat: string;
  top: string;
  vest: string;
  pants: string;
  shoes: string;
}

// Reusable low-poly character model
export const CharacterModel = ({ 
  isJumping, 
  isSliding, 
  speed, 
  runDelta,
  outfit,
  hasSneakers
}: { 
  isJumping: boolean, 
  isSliding: boolean, 
  speed: number, 
  runDelta: number,
  outfit: Outfit,
  hasSneakers?: boolean
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const runTime = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (!isJumping && !isSliding) {
      runTime.current += delta * speed * 0.8;
      const legAmp = 0.8;
      const armAmp = 0.6;
      
      if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(runTime.current) * legAmp;
      if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(runTime.current + Math.PI) * legAmp;
      if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(runTime.current + Math.PI) * armAmp;
      if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(runTime.current) * armAmp;
      
      groupRef.current.position.y = Math.abs(Math.sin(runTime.current * 2)) * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 10);
    } 
    
    if (isJumping) {
       if(leftLegRef.current) leftLegRef.current.rotation.x = 0.5;
       if(rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
       if(leftArmRef.current) leftArmRef.current.rotation.x = -2.5;
       if(rightArmRef.current) rightArmRef.current.rotation.x = -2.5;
    }

    if (isSliding) {
       groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -Math.PI / 2, delta * 15);
       groupRef.current.position.y = -0.5; 
    } else {
       if(!isJumping) groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 10);
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0.75, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color={outfit.top} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.55, 0.45, 0.35]} />
          <meshStandardMaterial color={outfit.vest} />
        </mesh>
        <group position={[0, 0.5, 0]}>
           <mesh castShadow>
             <boxGeometry args={[0.35, 0.35, 0.35]} />
             <meshStandardMaterial color={outfit.skin} />
           </mesh>
           <mesh position={[0, 0.1, 0]} castShadow>
             <boxGeometry args={[0.36, 0.15, 0.36]} />
             <meshStandardMaterial color={outfit.hat} />
           </mesh>
           <mesh position={[0, 0.08, 0.2]} rotation={[0.2, 0, 0]} castShadow>
             <boxGeometry args={[0.36, 0.05, 0.2]} />
             <meshStandardMaterial color={outfit.hat} />
           </mesh>
        </group>
        <group position={[-0.35, 0.15, 0]} ref={leftArmRef}>
           <mesh position={[0, -0.25, 0]} castShadow>
             <boxGeometry args={[0.15, 0.5, 0.15]} />
             <meshStandardMaterial color={outfit.top} />
           </mesh>
           <mesh position={[0, -0.5, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color={outfit.skin} />
           </mesh>
        </group>
        <group position={[0.35, 0.15, 0]} ref={rightArmRef}>
           <mesh position={[0, -0.25, 0]} castShadow>
             <boxGeometry args={[0.15, 0.5, 0.15]} />
             <meshStandardMaterial color={outfit.top} />
           </mesh>
           <mesh position={[0, -0.5, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color={outfit.skin} />
           </mesh>
        </group>
      </group>

      <group position={[-0.15, 0.45, 0]} ref={leftLegRef}>
         <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshStandardMaterial color={outfit.pants} />
         </mesh>
         <mesh position={[0, -0.7, 0.05]} castShadow>
            <boxGeometry args={hasSneakers ? [0.3, 0.25, 0.45] : [0.2, 0.15, 0.35]} />
            <meshStandardMaterial color={hasSneakers ? "#e17055" : outfit.shoes} />
         </mesh>
      </group>
      
      <group position={[0.15, 0.45, 0]} ref={rightLegRef}>
         <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshStandardMaterial color={outfit.pants} />
         </mesh>
         <mesh position={[0, -0.7, 0.05]} castShadow>
            <boxGeometry args={hasSneakers ? [0.3, 0.25, 0.45] : [0.2, 0.15, 0.35]} />
            <meshStandardMaterial color={hasSneakers ? "#e17055" : outfit.shoes} />
         </mesh>
      </group>
    </group>
  );
};

const JAKE_OUTFIT: Outfit = {
  skin: CHAR_SKIN,
  hat: CHAR_HAT_MAIN,
  top: CHAR_HOODIE,
  vest: CHAR_VEST,
  pants: CHAR_PANTS,
  shoes: CHAR_SHOES
};

export const Player = ({ onPositionUpdate }: PlayerProps) => {
  const { status, speed, increaseSpeed, activePowerups } = useGameStore();
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const [lane, setLane] = useState<Lane>(0);
  const [yVelocity, setYVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [forceDrop, setForceDrop] = useState(false);
  
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const targetX = useRef(0);

  // Powerup checks
  const hasSneakers = !!(activePowerups.sneakers && activePowerups.sneakers > Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameState.PLAYING) return;

      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setLane(l => Math.max(l - 1, -1) as Lane);
          playSound('click');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setLane(l => Math.min(l + 1, 1) as Lane);
          playSound('click');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          if (!isJumping && !isSliding) {
            setYVelocity(hasSneakers ? JUMP_FORCE_SNEAKERS : JUMP_FORCE);
            setIsJumping(true);
            playSound('jump');
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (isJumping) {
            // Fast drop
            setForceDrop(true);
          } else if (!isSliding) {
            setIsSliding(true);
            setTimeout(() => setIsSliding(false), 800);
            playSound('click');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, isJumping, isSliding, hasSneakers]);

  useFrame((state, delta) => {
    if (status !== GameState.PLAYING) return;

    position.current.z -= speed * delta;
    targetX.current = lane * LANE_WIDTH;
    position.current.x = THREE.MathUtils.lerp(position.current.x, targetX.current, delta * 12);

    // Gravity logic
    let currentGravity = GRAVITY;
    if (isJumping && forceDrop) {
      currentGravity = FAST_DROP_GRAVITY;
    }

    let newY = position.current.y + yVelocity * delta;
    let newVel = yVelocity + currentGravity * delta;

    if (newY <= 0) {
      newY = 0;
      newVel = 0;
      setIsJumping(false);
      setForceDrop(false);
    }
    
    position.current.y = newY;
    setYVelocity(newVel);

    if (meshRef.current) {
      meshRef.current.position.copy(position.current);
      const tilt = (position.current.x - targetX.current) * 0.15;
      meshRef.current.rotation.z = -tilt;
      meshRef.current.rotation.y = -tilt * 0.5;
    }

    const camTargetZ = position.current.z + 7;
    const camTargetY = position.current.y + 4.5;
    const camTargetX = position.current.x * 0.7;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, delta * 6);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, delta * 6);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, delta * 6);
    camera.lookAt(position.current.x, position.current.y + 1.5, position.current.z - 8);

    onPositionUpdate(position.current.z, lane, position.current.y);
    
    if (Math.abs(position.current.z) % 100 < 1) {
       increaseSpeed();
    }
  });

  return (
    <group ref={meshRef}>
      <CharacterModel 
        isJumping={isJumping} 
        isSliding={isSliding} 
        speed={speed} 
        runDelta={0} 
        outfit={JAKE_OUTFIT}
        hasSneakers={hasSneakers}
      />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
         <circleGeometry args={[0.6, 16]} />
         <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};