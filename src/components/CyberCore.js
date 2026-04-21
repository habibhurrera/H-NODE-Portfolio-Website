"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera, Stars, Html, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

const placeholderSkills = [
  "ESP32", "STM32", "FreeRTOS", "LVGL v9", 
  "MQTT", "Modbus", "LoRa", "KiCAD", 
  "Firmware", "Edge AI", "PCB Design", "IoT"
];

const Core = () => {
  const meshRef = useRef();
  // Using the generated texture for PCB traces
  const pcbTexture = useTexture("/textures/pcb_traces.png");

  useFrame((state) => {
    const { clock } = state;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        map={pcbTexture}
        emissiveMap={pcbTexture}
        emissive="#00F5FF"
        emissiveIntensity={2}
        transparent
        opacity={0.9}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

const AtomOrbit = ({ radius, tilt, speed, offset, label }) => {
  const nodeRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset;
    nodeRef.current.position.x = Math.cos(t) * radius;
    nodeRef.current.position.z = Math.sin(t) * radius;
  });

  return (
    <group rotation={tilt}>
      {/* Elliptical Path visual */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.1} />
      </mesh>

      {/* Moving Node */}
      <group ref={nodeRef}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#00F5FF" />
          <pointLight color="#00F5FF" intensity={0.5} distance={2} />
        </mesh>
        <Html distanceFactor={15} position={[0, 0.25, 0]}>
          <div className="pointer-events-none select-none px-2 py-0.5 border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-sm">
            <p className="text-[7px] font-[family-name:var(--font-jetbrains)] text-cyan-400 whitespace-nowrap uppercase tracking-widest leading-none">
              {label}
            </p>
          </div>
        </Html>
      </group>
    </group>
  );
};

const DataStreams = ({ count = 40 }) => {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      temp[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      temp[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      temp[i * 3 + 2] = r * Math.cos(theta);
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    pointsRef.current.rotation.y += 0.0005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00F5FF" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

export default function CyberCore() {
  const atomTilts = [
    [0, 0, 0],
    [Math.PI / 3, 0, 0],
    [-Math.PI / 3, 0, 0],
    [0, 0, Math.PI / 3],
    [Math.PI / 4, Math.PI / 4, 0],
  ];

  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-80">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#00F5FF" intensity={2} />
          
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            <Core />
            
            {/* Atom Style Orbits */}
            {placeholderSkills.map((skill, index) => {
              const tiltIndex = index % atomTilts.length;
              const radius = 3.5 + (Math.floor(index / atomTilts.length) * 1.5);
              const speed = 0.3 + (index * 0.02);
              const offset = (index * Math.PI * 2) / 5; // spread nodes on orbits

              return (
                <AtomOrbit 
                  key={index}
                  radius={radius}
                  tilt={atomTilts[tiltIndex]}
                  speed={speed}
                  offset={offset}
                  label={skill}
                />
              );
            })}
            
            <DataStreams count={100} />
          </Float>

          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
