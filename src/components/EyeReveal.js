"use client";

import { useEffect, useRef, useState } from "react";

const PHASE_LINE_DRAW = 2000;
const PHASE_LINE_HOLD = 300;
const PHASE_FADE_OUT = 600;

export default function EyeReveal({ onComplete }) {
  const canvasRef = useRef(null);
  const startRef = useRef(null);
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

    // Exact same geometry as DigitalEye.js
    const isMobile = W < 768;
    const cx = W / 2;
    const cy = isMobile ? H * 0.46 : H / 2;
    const R = isMobile ? Math.min(W, H) * 0.3 : H * 0.35;
    const rx = R * 1.6;  // sclera ellipse half-width

    const total = PHASE_LINE_DRAW + PHASE_LINE_HOLD + PHASE_FADE_OUT;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, W, H);

      // Black background — fades out after hold
      const afterHold = elapsed - PHASE_LINE_DRAW - PHASE_LINE_HOLD;
      const fadeProgress = afterHold > 0 ? Math.min(afterHold / PHASE_FADE_OUT, 1) : 0;
      const bgAlpha = 1 - fadeProgress;

      ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
      ctx.fillRect(0, 0, W, H);

      // Line draw progress
      const lineProgress = Math.min(elapsed / PHASE_LINE_DRAW, 1);
      const lineAlpha = bgAlpha; // line fades with background
      const startX = cx - rx;
      const endX = cx + rx;
      const drawnX = startX + (endX - startX) * easeInOut(lineProgress);

      if (drawnX > startX && lineAlpha > 0.01) {
        // Outer glow
        const glow = ctx.createLinearGradient(startX, cy, drawnX, cy);
        glow.addColorStop(0, `rgba(0,245,255,0)`);
        glow.addColorStop(0.05, `rgba(0,245,255,${0.35 * lineAlpha})`);
        glow.addColorStop(0.95, `rgba(0,245,255,${0.35 * lineAlpha})`);
        glow.addColorStop(1, `rgba(0,245,255,0)`);
        ctx.beginPath();
        ctx.moveTo(startX, cy);
        ctx.lineTo(drawnX, cy);
        ctx.lineWidth = 10;
        ctx.strokeStyle = glow;
        ctx.stroke();

        // Core bright line
        const core = ctx.createLinearGradient(startX, cy, drawnX, cy);
        core.addColorStop(0, `rgba(0,245,255,0)`);
        core.addColorStop(0.04, `rgba(0,245,255,${lineAlpha})`);
        core.addColorStop(0.96, `rgba(0,245,255,${lineAlpha})`);
        core.addColorStop(1, `rgba(0,245,255,0)`);
        ctx.beginPath();
        ctx.moveTo(startX, cy);
        ctx.lineTo(drawnX, cy);
        ctx.lineWidth = 2;
        ctx.strokeStyle = core;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00F5FF";
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Leading point (only while still drawing)
        if (lineProgress < 1) {
          const pt = ctx.createRadialGradient(drawnX, cy, 0, drawnX, cy, 18);
          pt.addColorStop(0, `rgba(255,255,255,${lineAlpha})`);
          pt.addColorStop(0.25, `rgba(0,245,255,${0.9 * lineAlpha})`);
          pt.addColorStop(1, `rgba(0,245,255,0)`);
          ctx.beginPath();
          ctx.arc(drawnX, cy, 18, 0, Math.PI * 2);
          ctx.fillStyle = pt;
          ctx.fill();
        }
      }

      if (elapsed < total) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        setDone(true);
        onComplete && onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  if (done) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
    />
  );
}