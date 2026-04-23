"use client";

import { useEffect, useRef, useState } from "react";

const PHASE_LINE_DRAW = 2000;
const PHASE_LINE_HOLD = 200;
const PHASE_EYE_OPEN = 1100;
const PHASE_FADE_OUT = 500;

export default function EyeReveal({ onComplete }) {
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

    // ── Exact same geometry as DigitalEye.js ─────────────────────────────
    const isMobile = W < 768;
    const cx = W / 2;
    const cy = isMobile ? H * 0.46 : H / 2;
    const R = isMobile ? Math.min(W, H) * 0.3 : H * 0.35;
    // Sclera ellipse — matches DigitalEye exactly
    const rx = R * 1.6;   // ellipseW  (horizontal half-width)
    const ry = R * 0.85;  // ellipseH  (vertical half-height)

    const totalDuration = PHASE_LINE_DRAW + PHASE_LINE_HOLD + PHASE_EYE_OPEN + PHASE_FADE_OUT;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    // Build SVG-style ellipse clip-path string for CSS (used externally if needed)
    // Canvas eye shape: true ellipse via bezier approximation (kappa = 0.5523)
    const K = 0.5523;

    // Draw the upper or lower half of the sclera ellipse
    // openAmt 0 = flat horizontal line, 1 = full ellipse half
    const drawEyeHalf = (top, openAmt) => {
      const ryScaled = ry * openAmt;
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy);
      if (top) {
        ctx.bezierCurveTo(
          cx - rx + rx * K, cy - ryScaled * K * 1.8,
          cx + rx - rx * K, cy - ryScaled * K * 1.8,
          cx + rx, cy
        );
      } else {
        ctx.bezierCurveTo(
          cx - rx + rx * K, cy + ryScaled * K * 1.2,
          cx + rx - rx * K, cy + ryScaled * K * 1.2,
          cx + rx, cy
        );
      }
    };

    const draw = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;

      ctx.clearRect(0, 0, W, H);

      const lineProgress = Math.min(elapsed / PHASE_LINE_DRAW, 1);
      const afterHold = elapsed - PHASE_LINE_DRAW - PHASE_LINE_HOLD;
      const openProgress = afterHold > 0 ? Math.min(afterHold / PHASE_EYE_OPEN, 1) : 0;
      const fadeProgress = afterHold > PHASE_EYE_OPEN
        ? Math.min((afterHold - PHASE_EYE_OPEN) / PHASE_FADE_OUT, 1)
        : 0;

      const overlayAlpha = 1 - fadeProgress;
      const openEased = easeOut(openProgress);

      if (overlayAlpha > 0.01) {
        // ── TOP black mask — everything above the upper eye curve ──────────
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // upper curve reversed (right → left)
        const ryTop = ry * openEased;
        ctx.bezierCurveTo(
          cx + rx - rx * K, cy - ryTop * K * 1.8,
          cx - rx + rx * K, cy - ryTop * K * 1.8,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();

        // ── BOTTOM black mask — everything below the lower eye curve ───────
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(W, H);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // lower curve reversed (right → left)
        const ryBot = ry * openEased;
        ctx.bezierCurveTo(
          cx + rx - rx * K, cy + ryBot * K * 1.2,
          cx - rx + rx * K, cy + ryBot * K * 1.2,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();
        ctx.restore();

        // ── LEFT corner triangle (pointed corner) ──────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cx - rx, 0);
        ctx.lineTo(cx - rx, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();
        ctx.restore();

        // ── RIGHT corner triangle ───────────────────────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx + rx, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H);
        ctx.lineTo(cx + rx, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fill();
        ctx.restore();

        // ── Glowing eyelid edges ───────────────────────────────────────────
        const startX = cx - rx;
        const endX = cx + rx;
        const drawnX = startX + (endX - startX) * easeInOut(lineProgress);
        const lineAlpha = openProgress > 0.55
          ? Math.max(0, 1 - (openProgress - 0.55) / 0.45) * overlayAlpha
          : overlayAlpha;

        if (drawnX > startX && lineAlpha > 0.01) {
          // Clip glow to drawn portion only
          ctx.save();
          ctx.beginPath();
          ctx.rect(startX, 0, drawnX - startX, H);
          ctx.clip();

          // Top glow
          drawEyeHalf(true, openEased);
          ctx.lineWidth = 10;
          ctx.strokeStyle = `rgba(0,245,255,${0.3 * lineAlpha})`;
          ctx.stroke();
          drawEyeHalf(true, openEased);
          ctx.lineWidth = 2;
          ctx.strokeStyle = `rgba(0,245,255,${lineAlpha})`;
          ctx.shadowBlur = 14;
          ctx.shadowColor = "#00F5FF";
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Bottom glow
          drawEyeHalf(false, openEased);
          ctx.lineWidth = 7;
          ctx.strokeStyle = `rgba(0,245,255,${0.2 * lineAlpha})`;
          ctx.stroke();
          drawEyeHalf(false, openEased);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(0,245,255,${lineAlpha * 0.75})`;
          ctx.stroke();

          ctx.restore();

          // Leading point (only while drawing, before eye opens)
          if (lineProgress < 1 && openProgress === 0) {
            const ptGrad = ctx.createRadialGradient(drawnX, cy, 0, drawnX, cy, 18);
            ptGrad.addColorStop(0, `rgba(255,255,255,${lineAlpha})`);
            ptGrad.addColorStop(0.25, `rgba(0,245,255,${0.9 * lineAlpha})`);
            ptGrad.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.arc(drawnX, cy, 18, 0, Math.PI * 2);
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