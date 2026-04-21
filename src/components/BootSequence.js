"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import useStore from "@/store/useStore";

/* ═══════════════════════════════════════════════════════════════
   BOOT SEQUENCE — Terminal Startup Overlay
   ───────────────────────────────────────────────────────────────
   Fast terminal-style boot that plays on load:
   - Shows system initialization messages
   - Progress bar fills
   - Fades out → reveals hero
═══════════════════════════════════════════════════════════════ */

const BOOT_LINES = [
  { text: "> Initializing H-NODE Core v2.4.1...", delay: 0 },
  { text: "  [✓] Embedded firmware kernel loaded", delay: 0.3 },
  { text: "  [✓] FreeRTOS scheduler online", delay: 0.5 },
  { text: "  [✓] UART/SPI/I2C peripherals mapped", delay: 0.7 },
  { text: "> Loading AI Modules...", delay: 1.0 },
  { text: "  [✓] YOLO inference engine ready", delay: 1.2 },
  { text: "  [✓] Edge AI runtime initialized", delay: 1.4 },
  { text: "  [✓] Neural bridge established", delay: 1.6 },
  { text: "> Connecting telemetry pipeline...", delay: 1.9 },
  { text: "  [✓] MQTT broker linked", delay: 2.1 },
  { text: "  [✓] Data streams active", delay: 2.3 },
  { text: "", delay: 2.5 },
  { text: "█ SYSTEM READY", delay: 2.6, isReady: true },
];

export default function BootSequence() {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const linesRef = useRef([]);
  const completeBoot = useStore((s) => s.completeBoot);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      /* ─── Progress bar ─── */
      tl.to(progressRef.current, {
        width: "100%",
        duration: 2.8,
        ease: "power2.inOut",
      });

      /* ─── Reveal lines one by one ─── */
      BOOT_LINES.forEach((line, i) => {
        tl.call(
          () => setVisibleLines(i + 1),
          null,
          line.delay
        );
      });

      /* ─── Flash the SYSTEM READY text ─── */
      tl.to({}, { duration: 0.4 }); // brief hold

      /* ─── Fade out entire boot screen ─── */
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          completeBoot();
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [completeBoot]);

  return (
    <div
      ref={containerRef}
      id="boot-sequence"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl)",
      }}
    >
      {/* Terminal Window */}
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            padding: "10px 16px",
            background: "var(--bg-tertiary)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FF5F57",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FEBC2E",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#28C840",
            }}
          />
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "var(--text-xs)",
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.05em",
            }}
          >
            hnode-core — system boot
          </span>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            padding: "var(--space-xl)",
            minHeight: "320px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "var(--text-sm)",
            lineHeight: 1.8,
          }}
        >
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              ref={(el) => (linesRef.current[i] = el)}
              style={{
                color: line.isReady
                  ? "var(--accent-cyan)"
                  : line.text.startsWith(">")
                  ? "var(--text-primary)"
                  : line.text.includes("[✓]")
                  ? "var(--accent-cyan-dim)"
                  : "var(--text-tertiary)",
                fontWeight: line.isReady ? 700 : line.text.startsWith(">") ? 600 : 400,
                textShadow: line.isReady
                  ? "0 0 10px rgba(0,255,255,0.5)"
                  : "none",
                minHeight: line.text === "" ? "0.5em" : "auto",
              }}
            >
              {line.text}
              {i === visibleLines - 1 && !line.isReady && (
                <span className="terminal-cursor" />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 2,
            background: "var(--bg-tertiary)",
            position: "relative",
          }}
        >
          <div
            ref={progressRef}
            style={{
              height: "100%",
              width: "0%",
              background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))",
              boxShadow: "0 0 10px rgba(0,255,255,0.4)",
              borderRadius: "0 1px 1px 0",
            }}
          />
        </div>
      </div>

      {/* Status text below terminal */}
      <p
        style={{
          marginTop: "var(--space-xl)",
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-jetbrains), monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Muhammad Hurrera — Systems Architect
      </p>
    </div>
  );
}
