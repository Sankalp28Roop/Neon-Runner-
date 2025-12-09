import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLOR_OBSTACLE, COLOR_COIN, OBSTACLE_SIZE, COIN_SIZE, COLOR_BARRIER, COLOR_SIGNAL, COLOR_MAGNET, COLOR_SNEAKERS } from '../constants';

export const ObstacleMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[OBSTACLE_SIZE, OBSTACLE_SIZE, OBSTACLE_SIZE]} />
      <meshStandardMaterial color={COLOR_OBSTACLE} roughness={0.4} metalness={0.6} />
      <pointLight distance={3} intensity={2} color={COLOR_OBSTACLE} decay={2} />
    </mesh>
  );
};

export const BarrierMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Low wooden barrier */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[OBSTACLE_SIZE + 0.5, 0.8, 0.2]} />
        <meshStandardMaterial color={COLOR_BARRIER} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.8, 0.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.4]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0.8, 0.2, 0]} castShadow>
         <boxGeometry args={[0.2, 0.4, 0.4]} />
         <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  );
};

export const SignalMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      {/* Light Box */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color={COLOR_SIGNAL} />
      </mesh>
      {/* Light */}
      <mesh position={[0, 2.5, 0.21]}>
         <circleGeometry args={[0.15]} />
         <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};

export const TrainMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[OBSTACLE_SIZE, 3.5, 6]} />
        <meshStandardMaterial color="#444" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 3.01]}>
        <planeGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#0ff" emissive="#0ff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.9, -0.5, 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
};

export const CoinMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 3;
  });

  return (
    <group ref={ref} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[COIN_SIZE, COIN_SIZE, 0.1, 16]} />
        <meshStandardMaterial color={COLOR_COIN} metalness={1} roughness={0.3} emissive={COLOR_COIN} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

export const MagnetMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.y += delta * 2;
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  return (
    <group ref={ref} position={position}>
       {/* U Shape */}
       <mesh rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI]} />
          <meshStandardMaterial color={COLOR_MAGNET} />
       </mesh>
       <mesh position={[-0.3, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#bdc3c7" />
       </mesh>
       <mesh position={[0.3, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#bdc3c7" />
       </mesh>
    </group>
  );
};

export const SneakerMesh: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.y += delta * 2;
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  return (
    <group ref={ref} position={position}>
       <mesh rotation={[0, -Math.PI/2, 0]}>
         {/* Simple Shoe Shape */}
         <boxGeometry args={[0.3, 0.3, 0.6]} />
         <meshStandardMaterial color={COLOR_SNEAKERS} />
       </mesh>
       <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color="white" />
       </mesh>
    </group>
  );
};