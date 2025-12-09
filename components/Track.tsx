import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LANE_WIDTH, SEGMENT_LENGTH, VISIBLE_SEGMENTS, OBSTACLE_SIZE, COIN_SIZE } from '../constants';
import { seededRandom, playSound } from '../utils';
import { ObstacleMesh, CoinMesh, TrainMesh, BarrierMesh, SignalMesh, MagnetMesh, SneakerMesh } from './AssetPrimitives';
import { useGameStore } from '../store';
import { Lane, ObstacleType, PowerUpType } from '../types';

interface TrackProps {
  playerZ: number;
  playerLane: Lane;
  playerY: number;
}

type TrackItem = {
  type: 'obstacle' | 'coin' | 'powerup',
  subtype?: ObstacleType | PowerUpType,
  lane: Lane,
  z: number,
  collected?: boolean
};

const checkCollision = (
  pZ: number, 
  pLane: number, 
  pY: number, 
  item: TrackItem
): 'none' | 'crash' | 'stumble' | 'collect' => {
  const zDiff = Math.abs(pZ - item.z);
  const laneMatch = pLane === item.lane;
  
  if (item.type === 'coin') {
    // Magnet Logic handled in component, this is physical touch
    if (zDiff < 1.5 && laneMatch && pY < 2) return 'collect';
  }

  if (item.type === 'powerup') {
    if (zDiff < 1.5 && laneMatch) return 'collect';
  }

  if (item.type === 'obstacle' && zDiff < 1.0 && laneMatch) {
    if (item.subtype === 'train') {
      return 'crash'; // Always crash
    }
    if (item.subtype === 'barrier') {
      // Jumpable
      if (pY > 0.8) return 'none';
      return 'crash'; // Hitting it kills you in this version (or stumble if we are lenient, but usually crash)
    }
    if (item.subtype === 'signal') {
      // Tall, thin. "Side" obstacle. Causes stumble.
      return 'stumble';
    }
    // Default box
    if (pY > OBSTACLE_SIZE) return 'none';
    return 'crash';
  }
  return 'none';
};

const Segment = React.memo(({ index, playerZ, playerLane, playerY }: { index: number } & TrackProps) => {
  const { gameOver, incrementScore, activatePowerup, triggerStumble, activePowerups } = useGameStore();
  const startZ = -index * SEGMENT_LENGTH;
  const endZ = -(index + 1) * SEGMENT_LENGTH;

  // Deterministic generation
  const data = useMemo(() => {
    const seed = index * 1337;
    const items: TrackItem[] = [];
    
    if (index > 2) {
      // Pattern 1: Trains
      if (seededRandom(seed) > 0.7) {
         const blockedLane = Math.floor(seededRandom(seed + 1) * 3) - 1 as Lane;
         items.push({ type: 'obstacle', subtype: 'train', lane: blockedLane, z: startZ - 10 });
      }

      // Pattern 2: Barriers and Coins
      [0.2, 0.5, 0.8].forEach((zRel, i) => {
        const itemZ = startZ - (zRel * SEGMENT_LENGTH);
        const subSeed = seed + i * 100;
        const typeRoll = seededRandom(subSeed);

        if (typeRoll > 0.4) {
          const laneRoll = Math.floor(seededRandom(subSeed + 1) * 3) - 1 as Lane;
          
          // Determine Obstacle Type
          let obsType: ObstacleType = 'barrier'; // default
          const obsRoll = seededRandom(subSeed + 2);
          if (obsRoll > 0.8) obsType = 'signal';
          else if (obsRoll > 0.9) obsType = 'train'; // rare random train

          items.push({ type: 'obstacle', subtype: obsType, lane: laneRoll, z: itemZ });
          
          // Coins
          const coinLane = ((laneRoll + 1) > 1 ? -1 : laneRoll + 1) as Lane;
          items.push({ type: 'coin', lane: coinLane, z: itemZ });

        } else if (typeRoll > 0.2) {
           // Powerup chance
           if (seededRandom(subSeed + 9) > 0.9) {
             const pType: PowerUpType = seededRandom(subSeed + 10) > 0.5 ? 'magnet' : 'sneakers';
             const laneRoll = Math.floor(seededRandom(subSeed + 4) * 3) - 1 as Lane;
             items.push({ type: 'powerup', subtype: pType, lane: laneRoll, z: itemZ });
           } else {
             // Coin line
             const laneRoll = Math.floor(seededRandom(subSeed + 4) * 3) - 1 as Lane;
             items.push({ type: 'coin', lane: laneRoll, z: itemZ });
           }
        }
      });
    }
    return items;
  }, [index, startZ]);

  useFrame((state, delta) => {
    // Only check if player is near this segment
    if (playerZ < startZ + 10 && playerZ > endZ - 10) {
      data.forEach(item => {
        if (!item.collected) {
           // Magnet Logic: If magnet active, coins fly to player
           if (item.type === 'coin' && activePowerups.magnet && activePowerups.magnet > Date.now()) {
              const dist = Math.sqrt(Math.pow(item.z - playerZ, 2) + Math.pow((item.lane * LANE_WIDTH) - (playerLane * LANE_WIDTH), 2));
              if (dist < 10 && item.z < playerZ) { // Only pull if ahead or close
                  // We can't easily animate 'z' in the immutable item data without force update
                  // But we can just "collect" it if close enough
                  if (dist < 3) {
                     item.collected = true;
                     incrementScore(10);
                     playSound('coin');
                     // Dispatch event for UI/Sound
                  }
              }
           }

           const col = checkCollision(playerZ, playerLane, playerY, item);
           
           if (col === 'crash') {
             gameOver();
             playSound('crash');
           } else if (col === 'stumble') {
             item.collected = true; // Remove the obstacle logically so we don't hit it next frame
             triggerStumble();
             playSound('crash'); // lighter sound ideally
           } else if (col === 'collect') {
             item.collected = true;
             if (item.type === 'coin') {
               incrementScore(10);
               playSound('coin');
             } else if (item.type === 'powerup') {
               activatePowerup(item.subtype as PowerUpType);
               playSound('coin'); // powerup sound
             }
           }
        }
      });
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.1, startZ - SEGMENT_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, SEGMENT_LENGTH]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Grid Lines */}
      <gridHelper position={[0, 0.01, startZ - SEGMENT_LENGTH / 2]} args={[20, SEGMENT_LENGTH, 0xff00ff, 0x333333]} />

      {/* Items */}
      {data.map((item, i) => (
        <React.Fragment key={`${index}-${i}`}>
          {!item.collected && (
            item.type === 'obstacle' ? (
              item.subtype === 'train' ? <TrainMesh position={[item.lane * LANE_WIDTH, 0, item.z]} /> :
              item.subtype === 'barrier' ? <BarrierMesh position={[item.lane * LANE_WIDTH, 0, item.z]} /> :
              item.subtype === 'signal' ? <SignalMesh position={[item.lane * LANE_WIDTH, 0, item.z]} /> :
              <ObstacleMesh position={[item.lane * LANE_WIDTH, OBSTACLE_SIZE / 2, item.z]} />
            ) : item.type === 'powerup' ? (
              item.subtype === 'magnet' ? <MagnetMesh position={[item.lane * LANE_WIDTH, 1, item.z]} /> :
              <SneakerMesh position={[item.lane * LANE_WIDTH, 1, item.z]} />
            ) : (
               <CoinWithLogic item={item} playerZ={playerZ} />
            )
          )}
        </React.Fragment>
      ))}
    </group>
  );
});

const CoinWithLogic = ({ item, playerZ }: { item: any, playerZ: number }) => {
  const { activePowerups } = useGameStore();
  const ref = React.useRef<THREE.Group>(null);
  const isMagnet = activePowerups.magnet && activePowerups.magnet > Date.now();
  
  useFrame((state, delta) => {
    if (isMagnet && ref.current && !item.collected) {
       // Visual pull
       const distZ = item.z - playerZ;
       if (distZ > 0 && distZ < 15) {
          ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, playerZ, delta * 5);
          ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 0, delta * 5); // Pull to center/player
       }
    }
  });

  return (
    <group ref={ref}>
      <CoinMesh position={[item.lane * LANE_WIDTH, 1, item.z]} />
    </group>
  );
};

export const Track = ({ playerZ, playerLane, playerY }: TrackProps) => {
  const currentSegment = Math.floor(-playerZ / SEGMENT_LENGTH);
  const segments = [];
  for (let i = Math.max(0, currentSegment - 2); i < currentSegment + VISIBLE_SEGMENTS; i++) {
    segments.push(i);
  }

  return (
    <group>
      {segments.map(index => (
        <Segment key={index} index={index} playerZ={playerZ} playerLane={playerLane} playerY={playerY} />
      ))}
    </group>
  );
};