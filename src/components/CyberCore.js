"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const SKILLS = [
  "ESP32", "STM32", "FreeRTOS", "MQTT", "LVGL",
  "Next.js", "KiCAD", "n8n", "Docker", "Supabase",
  "Python", "C / C++", "Grafana", "TypeScript",
  "Arduino", "Modbus", "LoRa", "Tailwind", "Claude API",
];

// ── Generate PCB trace texture on a canvas ──────────────────────────────────
function createPCBTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Dark PCB base
  ctx.fillStyle = "#001210";
  ctx.fillRect(0, 0, size, size);

  const traceColor = "rgba(0, 245, 255, 0.55)";
  const padColor = "rgba(0, 245, 255, 0.9)";
  ctx.strokeStyle = traceColor;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "square";

  const cellSize = 32;
  const cols = size / cellSize;
  const rows = size / cellSize;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      if (Math.random() > 0.45) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize / 2);
        ctx.lineTo(x + cellSize * (0.4 + Math.random() * 0.6), y + cellSize / 2);
        ctx.stroke();
      }
      if (Math.random() > 0.45) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize / 2, y);
        ctx.lineTo(x + cellSize / 2, y + cellSize * (0.4 + Math.random() * 0.6));
        ctx.stroke();
      }
      if (Math.random() > 0.6) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize / 2);
        ctx.lineTo(x + cellSize / 2, y + cellSize / 2);
        ctx.lineTo(x + cellSize / 2, y + cellSize);
        ctx.stroke();
      }
    }
  }

  // Solder pads
  ctx.fillStyle = padColor;
  for (let i = 0; i < 80; i++) {
    const px = Math.round(Math.random() * cols) * cellSize;
    const py = Math.round(Math.random() * rows) * cellSize;
    ctx.beginPath();
    ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,245,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, 6 + Math.random() * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = 1.5;
  }

  // IC chip outlines
  for (let i = 0; i < 6; i++) {
    const ix = 40 + Math.random() * (size - 120);
    const iy = 40 + Math.random() * (size - 120);
    const iw = 30 + Math.random() * 40;
    const ih = 20 + Math.random() * 30;
    ctx.strokeStyle = "rgba(0,245,255,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(ix, iy, iw, ih);
    const pins = Math.floor(iw / 8);
    for (let p = 0; p < pins; p++) {
      ctx.beginPath();
      ctx.moveTo(ix + p * (iw / pins) + 4, iy);
      ctx.lineTo(ix + p * (iw / pins) + 4, iy - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ix + p * (iw / pins) + 4, iy + ih);
      ctx.lineTo(ix + p * (iw / pins) + 4, iy + ih + 5);
      ctx.stroke();
    }
  }

  return canvas;
}

// ── PCB Sphere ───────────────────────────────────────────────────────────────
const PCBCore = () => {
  const meshRef = useRef();

  const texture = useMemo(() => {
    const canvas = createPCBTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  const emissiveTexture = useMemo(() => {
    const canvas = createPCBTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.07) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissiveMap={emissiveTexture}
        emissive={new THREE.Color("#00F5FF")}
        emissiveIntensity={0.7}
        roughness={0.3}
        metalness={0.85}
      />
    </mesh>
  );
};

// ── Glowing Atomic Orbital Ring ──────────────────────────────────────────────
const AtomOrbit = ({ radius, tilt, speed, skillIndex }) => {
  const nodeRef = useRef();
  const glowRef = useRef();
  const [skill, setSkill] = useState(SKILLS[skillIndex % SKILLS.length]);
  const lastSwap = useRef(0);
  const swapInterval = 3 + skillIndex * 0.8;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + skillIndex * (Math.PI * 2 / 5);
    nodeRef.current.position.x = Math.cos(t) * radius;
    nodeRef.current.position.z = Math.sin(t) * radius;
    nodeRef.current.position.y = 0;

    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 2 + skillIndex) * 0.05;
    }

    if (clock.getElapsedTime() - lastSwap.current > swapInterval) {
      lastSwap.current = clock.getElapsedTime();
      setSkill(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    }
  });

  return (
    <group rotation={tilt}>
      {/* Core ring — thin, bright */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 8, 128]} />
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.9} />
      </mesh>

      {/* Glow ring — thick, soft, additive blending */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.07, 8, 128]} />
        <meshBasicMaterial
          color="#00F5FF"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Moving node */}
      <group ref={nodeRef}>
        {/* White core dot */}
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Inner cyan glow */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            color="#00F5FF"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* Outer soft glow */}
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial
            color="#00F5FF"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Skill label */}
        <Html center distanceFactor={6} style={{ pointerEvents: "none" }} zIndexRange={[0, 0]}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            fontWeight: "700",
            color: "#00F5FF",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            whiteSpace: "nowrap",
            textShadow: "0 0 10px rgba(0,245,255,1), 0 0 20px rgba(0,245,255,0.5)",
            padding: "2px 7px",
            background: "rgba(0,8,12,0.85)",
            border: "1px solid rgba(0,245,255,0.45)",
            borderRadius: "2px",
            transform: "translateY(-22px)",
            userSelect: "none",
          }}>
            {skill}
          </div>
        </Html>
      </group>
    </group>
  );
};

// ── Ambient particles ────────────────────────────────────────────────────────
const Particles = () => {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      const r = 5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(() => { ref.current.rotation.y += 0.0002; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={50} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#00F5FF"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ── 5 orbital rings at atom-like tilts ───────────────────────────────────────
const ORBITS = [
  { radius: 2.6, tilt: [0, 0, 0], speed: 0.38 },
  { radius: 2.9, tilt: [Math.PI / 3, 0, 0], speed: 0.30 },
  { radius: 3.3, tilt: [-Math.PI / 3, 0, 0], speed: 0.24 },
  { radius: 3.7, tilt: [0, 0, Math.PI / 4], speed: 0.19 },
  { radius: 4.1, tilt: [Math.PI / 5, Math.PI / 3, 0], speed: 0.14 },
];

export default function CyberCore() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-90">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 11], fov: 50 }}
        frameloop="always"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[6, 6, 6]} color="#00F5FF" intensity={2} castShadow={false} />
        <pointLight position={[-6, -4, -4]} color="#0055FF" intensity={0.8} castShadow={false} />

        <group scale={isMobile ? 0.6 : 1}>
          <PCBCore />
          {ORBITS.map((o, i) => (
            <AtomOrbit key={i} radius={o.radius} tilt={o.tilt} speed={o.speed} skillIndex={i} />
          ))}
          <Particles />
        </group>
      </Canvas>
    </div>
  );
}