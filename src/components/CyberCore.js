"use client";
import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const SKILLS = [
  "ESP32", "STM32", "FreeRTOS", "MQTT", "LVGL",
  "Next.js", "KiCAD", "n8n", "Docker", "Supabase",
  "Python", "C / C++", "Grafana", "TypeScript",
  "Arduino", "Modbus", "LoRa", "Tailwind", "Claude API", "RTOS",
];

// ── Dark etched sphere core ──────────────────────────────────────────────────
const CircuitSphere = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.04;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 48, 48]} />
      <meshStandardMaterial
        color="#0a0600"
        emissive="#ff6a00"
        emissiveIntensity={0.08}
        roughness={0.6}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  );
};

// Wireframe overlay — the "etched" circuit grid
const CircuitEtching = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.04;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.52, 24, 24]} />
      <meshBasicMaterial
        color="#ff8c00"
        wireframe={true}
        transparent
        opacity={0.18}
      />
    </mesh>
  );
};

// ── Circuit trace lines radiating from sphere surface ───────────────────────
const CircuitTraces = () => {
  const groupRef = useRef();

  const lines = useMemo(() => {
    const result = [];
    const r = 1.55;
    const count = 18;
    for (let i = 0; i < count; i++) {
      const phi = (Math.PI / count) * i + 0.2;
      const theta = (Math.PI * 2 / count) * i * 1.618;
      const sx = r * Math.sin(phi) * Math.cos(theta);
      const sy = r * Math.sin(phi) * Math.sin(theta);
      const sz = r * Math.cos(phi);
      const seg1 = new THREE.Vector3(sx, sy, sz);
      const mid = new THREE.Vector3(
        sx + (Math.random() - 0.5) * 1.2,
        sy + (Math.random() - 0.5) * 1.2,
        sz + (Math.random() - 0.5) * 1.2
      );
      const end = new THREE.Vector3(
        mid.x + (Math.random() - 0.5) * 0.8,
        mid.y + (Math.random() - 0.5) * 0.8,
        mid.z + (Math.random() - 0.5) * 0.8
      );
      const elbow = new THREE.Vector3(mid.x, seg1.y, seg1.z);
      result.push([seg1, elbow, mid, end]);
    }
    return result;
  }, []);

  const geometry = useMemo(() => {
    const points = [];
    lines.forEach(seg => {
      for (let i = 0; i < seg.length - 1; i++) {
        points.push(seg[i].x, seg[i].y, seg[i].z);
        points.push(seg[i + 1].x, seg[i + 1].y, seg[i + 1].z);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [lines]);

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    groupRef.current.rotation.x = clock.getElapsedTime() * 0.04;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#ff8c00" transparent opacity={0.35} linewidth={1} />
      </lineSegments>
    </group>
  );
};

// ── Glowing intersection nodes on sphere surface ─────────────────────────────
const IntersectionNodes = () => {
  const groupRef = useRef();

  const nodes = useMemo(() => {
    const arr = [];
    const r = 1.56;
    const count = 28;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      arr.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        scale: 0.03 + Math.random() * 0.04,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    groupRef.current.rotation.x = clock.getElapsedTime() * 0.04;
    groupRef.current.children.forEach((child, i) => {
      if (nodes[i]) {
        const pulse = 0.85 + 0.15 * Math.sin(clock.getElapsedTime() * 2.5 + nodes[i].pulseOffset);
        child.scale.setScalar(pulse);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[n.scale, 8, 8]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// ── Outer orbit rings with cycling skill labels ───────────────────────────────
const OrbitRing = ({ radius, tilt, speed, skillIndex }) => {
  const nodeRef = useRef();
  const [skill, setSkill] = useState(SKILLS[skillIndex % SKILLS.length]);
  const lastSwap = useRef(0);
  const swapInterval = 2.8 + skillIndex * 0.65;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + skillIndex * (Math.PI * 2 / 5);
    nodeRef.current.position.x = Math.cos(t) * radius;
    nodeRef.current.position.z = Math.sin(t) * radius;
    if (clock.getElapsedTime() - lastSwap.current > swapInterval) {
      lastSwap.current = clock.getElapsedTime();
      setSkill(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    }
  });

  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.007, 8, 128]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.22} />
      </mesh>
      <group ref={nodeRef}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color="#ff8c00" transparent opacity={0.15} />
        </mesh>
        <Html center distanceFactor={6} style={{ pointerEvents: "none" }} zIndexRange={[0, 0]}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            fontWeight: "700",
            color: "#ffaa00",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            textShadow: "0 0 8px rgba(255,160,0,0.9), 0 0 20px rgba(255,100,0,0.5)",
            padding: "2px 6px",
            background: "rgba(10,4,0,0.75)",
            border: "1px solid rgba(255,140,0,0.35)",
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

// ── Ambient particles ─────────────────────────────────────────────────────────
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
      <pointsMaterial size={0.025} color="#ff8c00" transparent opacity={0.2} sizeAttenuation />
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
    <div className="absolute inset-0 w-full h-full -z-10 opacity-85">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        frameloop="always"
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[8, 8, 8]} color="#ff8c00" intensity={2.0} castShadow={false} />
        <pointLight position={[-6, -4, -6]} color="#ff4500" intensity={0.8} castShadow={false} />

        <CircuitSphere />
        <CircuitEtching />
        <CircuitTraces />
        <IntersectionNodes />

        {ORBITS.map((o, i) => (
          <OrbitRing key={i} radius={o.radius} tilt={o.tilt} speed={o.speed} skillIndex={i} />
        ))}

        <Particles />
      </Canvas>
    </div>
  );
}