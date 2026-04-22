"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const SKILLS = [
  "ESP32", "STM32", "FreeRTOS", "MQTT", "LVGL",
  "Next.js", "KiCAD", "n8n", "Docker", "Supabase",
  "Python", "C / C++", "Embedded AI", "Grafana", "TypeScript",
  "Arduino", "Modbus", "LoRa", "Tailwind", "Claude API",
];

const Core = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.08;
  });
  return (
    <mesh ref={meshRef}>
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

const OrbitRing = ({ radius, tilt, speed, skillIndex }) => {
  const nodeRef = useRef();
  const [skill, setSkill] = useState(SKILLS[skillIndex % SKILLS.length]);
  const lastSwapTime = useRef(0);
  // Each orbit gets a different swap interval so they don't all change at once
  const swapInterval = 2.5 + skillIndex * 0.7;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + skillIndex * (Math.PI * 2 / 5);
    nodeRef.current.position.x = Math.cos(t) * radius;
    nodeRef.current.position.z = Math.sin(t) * radius;
    // Cycle skill label
    if (clock.getElapsedTime() - lastSwapTime.current > swapInterval) {
      lastSwapTime.current = clock.getElapsedTime();
      setSkill(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    }
  });

  return (
    <group rotation={tilt}>
      {/* Visible orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 8, 128]} />
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.25} />
      </mesh>

      {/* Moving node with skill label */}
      <group ref={nodeRef}>
        {/* Glowing sphere */}
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color="#00F5FF" />
        </mesh>
        {/* Outer glow ring */}
        <mesh>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial color="#00F5FF" transparent opacity={0.15} />
        </mesh>
        {/* Skill label */}
        <Html
          center
          distanceFactor={6}
          style={{ pointerEvents: "none" }}
          zIndexRange={[0, 0]}
        >
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            fontWeight: "700",
            color: "#00F5FF",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            textShadow: "0 0 8px rgba(0,245,255,0.9), 0 0 16px rgba(0,245,255,0.4)",
            padding: "2px 6px",
            background: "rgba(0,10,15,0.7)",
            border: "1px solid rgba(0,245,255,0.3)",
            borderRadius: "2px",
            transform: "translateY(-18px)",
            userSelect: "none",
          }}>
            {skill}
          </div>
        </Html>
      </group>
    </group>
  );
};

const Particles = () => {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame(() => { ref.current.rotation.y += 0.0003; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={60} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00F5FF" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

const ORBITS = [
  { radius: 2.8, tilt: [0, 0, 0], speed: 0.35 },
  { radius: 3.2, tilt: [Math.PI / 3, 0, 0], speed: 0.28 },
  { radius: 3.6, tilt: [-Math.PI / 3, 0, 0], speed: 0.22 },
  { radius: 4.0, tilt: [0, 0, Math.PI / 3], speed: 0.18 },
  { radius: 4.4, tilt: [Math.PI / 4, Math.PI / 4, 0], speed: 0.14 },
];

export default function CyberCore() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-80">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        frameloop="always"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[8, 8, 8]} color="#00F5FF" intensity={1.5} castShadow={false} />
        <Core />
        {ORBITS.map((o, i) => (
          <OrbitRing
            key={i}
            radius={o.radius}
            tilt={o.tilt}
            speed={o.speed}
            skillIndex={i}
          />
        ))}
        <Particles />
      </Canvas>
    </div>
  );
}