"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import useStore from "@/store/useStore";
import { motion } from "framer-motion-3d";

/* ═══════════════════════════════════════════════════════════════
   H-NODE 3D SYSTEM — The Core Differentiator
   ───────────────────────────────────────────────────────────────
   Exact replication of the H-NODE architecture:
   Left: Solid dark metallic pillar with 3 PCB traces
   Right: Wireframe web of exactly 11 glowing cyan nodes
   Background: Data packets on invisible circuit paths
═══════════════════════════════════════════════════════════════ */

/* ─── Coordinate Mapping ─── */
const S = 0.06;
const m = (x, y, z = 0) => [(x - 52.5) * S, -(y - 50) * S, z];

/* ─── Node Definitions (Exact 11 Nodes) ─── */
const NODE_DATA = [
  { id: "B1", pos: m(45, 45), label: null },
  { id: "B2", pos: m(45, 50), label: null },
  { id: "B3", pos: m(45, 55), label: null },
  { id: "H1", pos: m(55, 50), label: null },
  { id: "T1", pos: m(55, 15), label: null },
  { id: "T2", pos: m(70, 15), label: "About", section: "about" },
  { id: "D1", pos: m(55, 85), label: null },
  { id: "D2", pos: m(70, 85), label: "How I Work", section: "workflow" },
  { id: "C1", pos: m(70, 35), label: "Projects", section: "projects" },
  { id: "C2", pos: m(70, 65), label: "Services", section: "services" },
  { id: "C3", pos: m(85, 50), label: "Contact", section: "contact" },
];

const nodeMap = {};
NODE_DATA.forEach((n) => (nodeMap[n.id] = n.pos));

/* ─── Web Connections ─── */
const CONNECTIONS = [
  ["B1", "H1"], ["B2", "H1"], ["B3", "H1"],
  ["T1", "T2"], ["T1", "H1"], ["T2", "C1"],
  ["D1", "D2"], ["D1", "H1"], ["D2", "C2"],
  ["H1", "C1"], ["H1", "C2"],
  ["C1", "C3"], ["C2", "C3"],
];

/* ─── PCB Trace Definitions ─── */
const TZ = 0.16;
const TRACES = [
  [m(25, 20, TZ), m(25, 45, TZ), m(35, 55, TZ), m(40, 55, TZ)],
  [m(25, 50, TZ), m(40, 50, TZ)],
  [m(25, 80, TZ), m(25, 55, TZ), m(35, 45, TZ), m(40, 45, TZ)],
];
const VIA_POSITIONS = [m(25, 20, TZ), m(25, 50, TZ), m(25, 80, TZ)];
const BRIDGE_LINES = [
  [m(40, 45, TZ), nodeMap.B1],
  [m(40, 50, TZ), nodeMap.B2],
  [m(40, 55, TZ), nodeMap.B3],
];

/* ─── Colors ─── */
const CYAN = "#00FFFF";
const TRACE_COLOR = "#3A5A6C";
const PILLAR_COLOR = "#1A202C";

/* ════════════════════════════════════════════
   Component: GlowNode — Single Cyan Node
════════════════════════════════════════════ */
function GlowNode({ position, nodeData, isHovered, onHover, onClick }) {
  const baseScale = nodeData.label ? 0.09 : 0.07;
  
  // Create an offset for the pulse animation so nodes don't pulse synchronously
  const timeOffset = position[0] * 3;

  return (
    <group position={position}>
      {/* Core sphere */}
      <motion.mesh
        onPointerEnter={(e) => { e.stopPropagation(); onHover(nodeData.id); }}
        onPointerLeave={(e) => { e.stopPropagation(); onHover(null); }}
        onClick={(e) => { e.stopPropagation(); if (nodeData.section) onClick(nodeData.section); }}
        animate={isHovered ? "hovered" : "idle"}
        variants={{
          idle: {
            scale: [1, 1.15, 1],
            transition: {
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
              delay: timeOffset % 2.5
            }
          },
          hovered: {
            scale: 1.6,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 15
            }
          }
        }}
      >
        <sphereGeometry args={[baseScale, 16, 16]} />
        <meshStandardMaterial
          color={CYAN}
          emissive={CYAN}
          emissiveIntensity={isHovered ? 4 : 2}
          toneMapped={false}
        />
      </motion.mesh>
      {/* Mid glow halo */}
      <mesh>
        <sphereGeometry args={[baseScale * 2, 16, 16]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={isHovered ? 0.12 : 0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Outer ambient glow */}
      <mesh>
        <sphereGeometry args={[baseScale * 3.5, 12, 12]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={isHovered ? 0.05 : 0.015}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Label on hover */}
      {isHovered && nodeData.label && (
        <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(0,255,255,0.1)",
            border: "1px solid rgba(0,255,255,0.3)",
            borderRadius: 6,
            padding: "4px 12px",
            color: CYAN,
            fontSize: 11,
            fontFamily: "var(--font-jetbrains), monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
            textShadow: "0 0 8px rgba(0,255,255,0.5)",
          }}>
            {nodeData.label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════
   Component: LeftPillar — Solid Dark Block
════════════════════════════════════════════ */
function LeftPillar() {
  const center = m(30, 50);
  return (
    <mesh position={[center[0], center[1], 0]}>
      <boxGeometry args={[20 * S, 80 * S, 0.3]} />
      <meshStandardMaterial
        color={PILLAR_COLOR}
        roughness={0.7}
        metalness={0.8}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════
   Component: PCBTraces — 3 Etched Traces
════════════════════════════════════════════ */
function PCBTraces() {
  return (
    <group>
      {/* 3 Trace lines */}
      {TRACES.map((points, i) => (
        <Line
          key={`trace-${i}`}
          points={points}
          color={TRACE_COLOR}
          lineWidth={2.5}
          transparent
          opacity={0.8}
        />
      ))}
      {/* Via nodes at trace start points */}
      {VIA_POSITIONS.map((pos, i) => (
        <mesh key={`via-${i}`} position={pos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color={CYAN}
            emissive={CYAN}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Bridge connections (trace exits → bridge nodes) */}
      {BRIDGE_LINES.map((pts, i) => (
        <Line
          key={`bridge-${i}`}
          points={pts}
          color={CYAN}
          lineWidth={1.5}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════
   Component: WebConnections — Cyan Lines
════════════════════════════════════════════ */
function WebConnections() {
  return (
    <group>
      {CONNECTIONS.map(([a, b], i) => (
        <Line
          key={`conn-${i}`}
          points={[nodeMap[a], nodeMap[b]]}
          color={CYAN}
          lineWidth={1.2}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════
   Component: DataPackets — InstancedMesh
════════════════════════════════════════════ */
const PACKET_COUNT = 24;
const PACKET_PATHS = [
  [m(25, 20, TZ), m(25, 45, TZ), m(35, 55, TZ), m(40, 55, TZ), nodeMap.B3, nodeMap.H1],
  [m(25, 50, TZ), m(40, 50, TZ), nodeMap.B2, nodeMap.H1, nodeMap.C3],
  [m(25, 80, TZ), m(25, 55, TZ), m(35, 45, TZ), m(40, 45, TZ), nodeMap.B1, nodeMap.H1],
  [nodeMap.H1, nodeMap.C1, nodeMap.C3, nodeMap.C2, nodeMap.H1],
  [nodeMap.T1, nodeMap.H1, nodeMap.D1],
  [nodeMap.T2, nodeMap.C1, nodeMap.C3],
];

function getPointOnPath(path, t) {
  const totalSegs = path.length - 1;
  const segFloat = t * totalSegs;
  const segIdx = Math.min(Math.floor(segFloat), totalSegs - 1);
  const segT = segFloat - segIdx;
  const a = path[segIdx];
  const b = path[segIdx + 1];
  return [
    a[0] + (b[0] - a[0]) * segT,
    a[1] + (b[1] - a[1]) * segT,
    (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * segT,
  ];
}

function DataPackets() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const packets = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PACKET_COUNT; i++) {
      arr.push({
        pathIdx: i % PACKET_PATHS.length,
        progress: Math.random(),
        speed: 0.08 + Math.random() * 0.12,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    packets.forEach((p, i) => {
      p.progress = (p.progress + delta * p.speed) % 1;
      const path = PACKET_PATHS[p.pathIdx];
      const pos = getPointOnPath(path, p.progress);
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.scale.setScalar(0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PACKET_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ════════════════════════════════════════════
   Component: HNodeCore — Full H Assembly
════════════════════════════════════════════ */
function HNodeCore() {
  const [hovered, setHovered] = useState(null);
  const navigateToSection = useStore((s) => s.navigateToSection);

  const handleClick = useCallback(
    (section) => {
      if (section) navigateToSection(section);
    },
    [navigateToSection]
  );

  return (
    <motion.group
      animate={{
        rotateY: [0.08, -0.08],
        rotateX: [0.03, -0.03],
      }}
      transition={{
        rotateY: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 20.9,
          ease: "easeInOut"
        },
        rotateX: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 31.4,
          ease: "easeInOut"
        }
      }}
    >
      <LeftPillar />
      <PCBTraces />
      <WebConnections />
      {NODE_DATA.map((node) => (
        <GlowNode
          key={node.id}
          position={node.pos}
          nodeData={node}
          isHovered={hovered === node.id}
          onHover={setHovered}
          onClick={handleClick}
        />
      ))}
      <DataPackets />
    </motion.group>
  );
}

/* ════════════════════════════════════════════
   Main Export: HNodeScene — Canvas Wrapper
════════════════════════════════════════════ */
export default function HNodeScene() {
  const setHeroReady = useStore((s) => s.setHeroReady);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onCreated={() => setHeroReady()}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 4]} intensity={0.8} color="#ffffff" />
        <pointLight position={nodeMap.H1} intensity={1.5} color={CYAN} distance={4} />

        {/* The H-NODE */}
        <HNodeCore />

        {/* Post-processing bloom */}
        <EffectComposer disableNormalPass>
          <Bloom
            luminanceThreshold={1.0}
            luminanceSmoothing={0.4}
            intensity={1.0}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
