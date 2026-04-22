"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Lightweight rotating core sphere
const Core = () => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      {/* 32x32 instead of 64x64 — 4x fewer vertices */}
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#001a1f"
        emissive="#00F5FF"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.9}
        wireframe={true}
      />
    </mesh>
  );
};

// Simple orbit rings — torus geometry only, no HTML labels, no pointLights
const OrbitRing = ({ radius, tilt, speed }) => {
  const groupRef = useRef();
  const nodeRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    nodeRef.current.position.x = Math.cos(t) * radius;
    nodeRef.current.position.z = Math.sin(t) * radius;
  });

  return (
    <group rotation={tilt}>
      {/* Ring path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 64]} />
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.08} />
      </mesh>

      {/* Moving node — just a small sphere, no lights, no HTML */}
      <group ref={nodeRef}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#00F5FF" />
        </mesh>
      </group>
    </group>
  );
};

// Minimal particle field — 40 points instead of 100
const Particles = () => {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(() => {
    ref.current.rotation.y += 0.0003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={40}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#00F5FF" transparent opacity={0.25} sizeAttenuation />
    </points>
  );
};

const ORBITS = [
  { radius: 2.8, tilt: [0, 0, 0],                       speed: 0.35 },
  { radius: 3.2, tilt: [Math.PI / 3, 0, 0],             speed: 0.28 },
  { radius: 3.6, tilt: [-Math.PI / 3, 0, 0],            speed: 0.22 },
  { radius: 4.0, tilt: [0, 0, Math.PI / 3],             speed: 0.18 },
  { radius: 4.4, tilt: [Math.PI / 4, Math.PI / 4, 0],  speed: 0.14 },
];

export default function CyberCore() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-70">
      <Canvas
        dpr={[1, 1.5]}           // cap pixel ratio — biggest single perf win
        gl={{
          antialias: false,       // no MSAA — not needed at this scale
          powerPreference: "high-performance",
          alpha: true,
        }}
        frameloop="always"
      >
        {/* Minimal lighting — no shadow casting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[8, 8, 8]} color="#00F5FF" intensity={1.5} castShadow={false} />

        <Core />

        {ORBITS.map((o, i) => (
          <OrbitRing key={i} radius={o.radius} tilt={o.tilt} speed={o.speed} />
        ))}

        <Particles />

        {/* No EffectComposer, no Bloom, no Stars, no Html */}
      </Canvas>
    </div>
  );
}