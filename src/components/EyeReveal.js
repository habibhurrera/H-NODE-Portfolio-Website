"use client";

import { useEffect, useRef, useState } from "react";

const PHASE_LINE_DRAW = 2000;
const PHASE_LINE_HOLD = 250;
const PHASE_SPLIT = 1200;
const PHASE_FADE_OUT = 500;

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
    const rx = R * 1.6;   // sclera ellipse half-width
    const ry = R * 0.85;  // sclera ellipse half-height

    const total = PHASE_LINE_DRAW + PHASE_LINE_HOLD + PHASE_SPLIT + PHASE_FADE_OUT;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    // Bezier kappa for ellipse approximation
    const K = 0.5523;

    // Draw upper or lower half of the sclera ellipse at a given open amount
    const drawHalf = (top, openAmt) => {
      const ryS = ry * openAmt;
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy);
      if (top) {
        ctx.bezierCurveTo(
          cx - rx + rx * K, cy - ryS * K * 1.8,
          cx + rx - rx * K, cy - ryS * K * 1.8,
          cx + rx, cy
        );
      } else {
        ctx.bezierCurveTo(
          cx - rx + rx * K, cy + ryS * K * 1.2,
          cx + rx - rx * K, cy + ryS * K * 1.2,
          cx + rx, cy
        );
      }
    };

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, W, H);

      const lineProgress = Math.min(elapsed / PHASE_LINE_DRAW, 1);
      const afterHold = elapsed - PHASE_LINE_DRAW - PHASE_LINE_HOLD;
      const splitProgress = afterHold > 0 ? Math.min(afterHold / PHASE_SPLIT, 1) : 0;
      const afterSplit = afterHold - PHASE_SPLIT;
      const fadeProgress = afterSplit > 0 ? Math.min(afterSplit / PHASE_FADE_OUT, 1) : 0;

      const splitEased = easeOut(splitProgress);
      const overlayAlpha = 1 - fadeProgress;

      // ── Black masks (top & bottom) with eye-shaped gap between them ──────
      if (overlayAlpha > 0.01) {
        // Top black mask — everything above the upper split line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // Upper bezier reversed right→left
        const ryTop = ry * splitEased;
        ctx.bezierCurveTo(
          cx + rx - rx * K, cy - ryTop * K * 1.8,
          cx - rx + rx * K, cy - ryTop * K * 1.8,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();

        // Bottom black mask — everything below the lower split line
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(W, H);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // Lower bezier reversed right→left
        const ryBot = ry * splitEased;
        ctx.bezierCurveTo(
          cx + rx - rx * K, cy + ryBot * K * 1.2,
          cx - rx + rx * K, cy + ryBot * K * 1.2,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();

        // Left black block (outside eye width)
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fillRect(0, 0, cx - rx, H);

        // Right black block (outside eye width)
        ctx.fillRect(cx + rx, 0, W - (cx + rx), H);
        ctx.restore();

        // ── Glowing lines ──────────────────────────────────────────────────
        const startX = cx - rx;
        const endX = cx + rx;
        const drawnX = startX + (endX - startX) * easeInOut(lineProgress);

        // Line alpha — fades out as fade begins
        const lineAlpha = overlayAlpha;

        if (drawnX > startX && lineAlpha > 0.01) {
          // While still drawing — single horizontal line with leading point
          if (splitProgress === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(startX, 0, drawnX - startX, H);
            ctx.clip();

            const glow = ctx.createLinearGradient(startX, cy, drawnX, cy);
            glow.addColorStop(0, `rgba(0,245,255,0)`);
            glow.addColorStop(0.04, `rgba(0,245,255,${0.35 * lineAlpha})`);
            glow.addColorStop(0.96, `rgba(0,245,255,${0.35 * lineAlpha})`);
            glow.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.moveTo(startX, cy);
            ctx.lineTo(drawnX, cy);
            ctx.lineWidth = 10;
            ctx.strokeStyle = glow;
            ctx.stroke();

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
            ctx.restore();

            // Leading point
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
          } else {
            // Splitting — draw glowing bezier edges on both halves
            // Top edge glow
            drawHalf(true, splitEased);
            ctx.lineWidth = 10;
            ctx.strokeStyle = `rgba(0,245,255,${0.3 * lineAlpha})`;
            ctx.stroke();
            drawHalf(true, splitEased);
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(0,245,255,${lineAlpha})`;
            ctx.shadowBlur = 14;
            ctx.shadowColor = "#00F5FF";
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Bottom edge glow
            drawHalf(false, splitEased);
            ctx.lineWidth = 8;
            ctx.strokeStyle = `rgba(0,245,255,${0.2 * lineAlpha})`;
            ctx.stroke();
            drawHalf(false, splitEased);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(0,245,255,${0.75 * lineAlpha})`;
            ctx.stroke();
          }
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