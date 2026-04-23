"use client";

import { useEffect, useRef, useState } from "react";

// Phase timings (ms)
const PHASE_LINE_DRAW = 2000; // line draws left → right
const PHASE_LINE_HOLD = 300;  // brief pause at full line
const PHASE_EYE_OPEN = 900;  // eyelids split open
const PHASE_FADE_OUT = 400;  // overlay fades away

export default function EyeReveal({ onComplete, eyeCenterY, eyeRadiusX }) {
  const canvasRef = useRef(null);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    // Eye geometry — passed from parent or estimated
    const cx = W / 2;
    const cy = eyeCenterY || H * 0.46;
    const rx = eyeRadiusX || Math.min(W, H) * 0.3 * 1.6; // sclera ellipse width
    const lineY = cy; // horizontal line sits at eye center

    const totalDuration = PHASE_LINE_DRAW + PHASE_LINE_HOLD + PHASE_EYE_OPEN + PHASE_FADE_OUT;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const draw = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Black overlay ──────────────────────────────────────────────────────
      // During eye-open phase we use two black rectangles (top/bottom eyelids)
      // that pull apart. Before that, solid black.

      const lineDrawProgress = Math.min(elapsed / PHASE_LINE_DRAW, 1);
      const afterLineDraw = elapsed - PHASE_LINE_DRAW;
      const afterHold = elapsed - PHASE_LINE_DRAW - PHASE_LINE_HOLD;
      const eyeOpenProgress = afterHold > 0 ? Math.min(afterHold / PHASE_EYE_OPEN, 1) : 0;
      const fadeProgress = afterHold > PHASE_EYE_OPEN
        ? Math.min((afterHold - PHASE_EYE_OPEN) / PHASE_FADE_OUT, 1)
        : 0;

      if (fadeProgress < 1) {
        const overlayAlpha = 1 - fadeProgress;

        if (eyeOpenProgress === 0) {
          // Solid black before eye opens
          ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
          ctx.fillRect(0, 0, W, H);
        } else {
          // Two eyelid halves pulling apart
          // Gap grows as a quadratic curve (eye shape)
          const openEased = easeOut(eyeOpenProgress);
          const maxGap = cy + rx * 0.55; // how far lids travel

          // Top lid moves up
          const topLidBottom = lineY - openEased * maxGap;
          // Bottom lid moves down
          const bottomLidTop = lineY + openEased * maxGap;

          // Draw top black rectangle
          ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
          ctx.fillRect(0, 0, W, topLidBottom);

          // Draw bottom black rectangle
          ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
          ctx.fillRect(0, bottomLidTop, W, H - bottomLidTop);

          // Curved eyelid edges — top lid bottom edge
          ctx.beginPath();
          ctx.moveTo(cx - rx, topLidBottom);
          ctx.quadraticCurveTo(cx, topLidBottom - openEased * rx * 0.35, cx + rx, topLidBottom);
          ctx.lineTo(cx + rx, 0);
          ctx.lineTo(cx - rx, 0);
          ctx.closePath();
          ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
          ctx.fill();

          // Curved eyelid edges — bottom lid top edge
          ctx.beginPath();
          ctx.moveTo(cx - rx, bottomLidTop);
          ctx.quadraticCurveTo(cx, bottomLidTop + openEased * rx * 0.2, cx + rx, bottomLidTop);
          ctx.lineTo(cx + rx, H);
          ctx.lineTo(cx - rx, H);
          ctx.closePath();
          ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
          ctx.fill();
        }
      }

      // ── Glowing line ───────────────────────────────────────────────────────
      if (eyeOpenProgress < 0.6 && fadeProgress === 0) {
        const lineAlpha = eyeOpenProgress > 0
          ? Math.max(0, 1 - eyeOpenProgress / 0.6)
          : 1;

        // Line goes from left sclera edge to right sclera edge
        const startX = cx - rx;
        const endX = cx + rx;
        const currentEndX = startX + (endX - startX) * easeInOut(lineDrawProgress);

        if (currentEndX > startX) {
          // Outer glow
          const glowGrad = ctx.createLinearGradient(startX, lineY, currentEndX, lineY);
          glowGrad.addColorStop(0, `rgba(0,245,255,0)`);
          glowGrad.addColorStop(0.1, `rgba(0,245,255,${0.3 * lineAlpha})`);
          glowGrad.addColorStop(0.9, `rgba(0,245,255,${0.3 * lineAlpha})`);
          glowGrad.addColorStop(1, `rgba(0,245,255,0)`);

          ctx.beginPath();
          ctx.moveTo(startX, lineY);
          ctx.lineTo(currentEndX, lineY);
          ctx.lineWidth = 12;
          ctx.strokeStyle = glowGrad;
          ctx.shadowBlur = 0;
          ctx.stroke();

          // Core bright line
          const coreGrad = ctx.createLinearGradient(startX, lineY, currentEndX, lineY);
          coreGrad.addColorStop(0, `rgba(0,245,255,0)`);
          coreGrad.addColorStop(0.05, `rgba(0,245,255,${lineAlpha})`);
          coreGrad.addColorStop(0.95, `rgba(0,245,255,${lineAlpha})`);
          coreGrad.addColorStop(1, `rgba(0,245,255,0)`);

          ctx.beginPath();
          ctx.moveTo(startX, lineY);
          ctx.lineTo(currentEndX, lineY);
          ctx.lineWidth = 2;
          ctx.strokeStyle = coreGrad;
          ctx.stroke();

          // Leading point glow
          if (lineDrawProgress < 1) {
            const ptX = currentEndX;
            const ptGrad = ctx.createRadialGradient(ptX, lineY, 0, ptX, lineY, 18);
            ptGrad.addColorStop(0, `rgba(255,255,255,${lineAlpha})`);
            ptGrad.addColorStop(0.2, `rgba(0,245,255,${0.9 * lineAlpha})`);
            ptGrad.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.arc(ptX, lineY, 18, 0, Math.PI * 2);
            ctx.fillStyle = ptGrad;
            ctx.fill();
          }
        }
      }

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        setDone(true);
        onComplete && onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (done) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
}
