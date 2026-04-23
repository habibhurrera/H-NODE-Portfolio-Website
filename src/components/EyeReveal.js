"use client";

import { useEffect, useRef, useState } from "react";

const PHASE_LINE_DRAW = 2000;
const PHASE_LINE_HOLD = 200;
const PHASE_EYE_OPEN = 1000;
const PHASE_FADE_OUT = 400;

export default function EyeReveal({ onComplete, onUpdate, eyeCenterY, eyeRadiusX }) {
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

    const cx = W / 2;
    const cy = eyeCenterY || H * 0.46;
    const rx = eyeRadiusX || Math.min(W, H) * 0.3 * 1.6;
    // Vertical half-height of the eye shape
    const ry = rx * 0.65;

    const totalDuration = PHASE_LINE_DRAW + PHASE_LINE_HOLD + PHASE_EYE_OPEN + PHASE_FADE_OUT;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    // Draw the eye-shaped eyelid path
    // top=true draws the upper half, top=false draws lower half
    // openAmount: 0 = closed (flat line), 1 = fully open (full curve)
    const eyePath = (top, openAmount) => {
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy);
      if (top) {
        // Upper eyelid curves UP
        ctx.bezierCurveTo(
          cx - rx * 0.3, cy - ry * openAmount * 1.2,
          cx + rx * 0.3, cy - ry * openAmount * 1.2,
          cx + rx, cy
        );
      } else {
        // Lower eyelid curves DOWN
        ctx.bezierCurveTo(
          cx - rx * 0.3, cy + ry * openAmount * 1.2,
          cx + rx * 0.3, cy + ry * openAmount * 1.2,
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

      const alpha = 1 - fadeProgress;
      const openEased = easeOut(openProgress);

      // Report progress to parent for clipping
      onUpdate && onUpdate({ openAmount: openEased, alpha });

      if (alpha > 0) {
        // ── TOP eyelid black mask ──────────────────────────────────────────
        ctx.save();
        ctx.beginPath();
        // Fill everything ABOVE the upper eyelid curve
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // Upper curve (reversed — right to left)
        ctx.bezierCurveTo(
          cx + rx * 0.3, cy - ry * openEased * 1.7,
          cx - rx * 0.3, cy - ry * openEased * 1.7,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fill();

        // ── BOTTOM eyelid black mask ───────────────────────────────────────
        ctx.beginPath();
        // Fill everything BELOW the lower eyelid curve
        ctx.moveTo(0, H);
        ctx.lineTo(W, H);
        ctx.lineTo(W, cy);
        ctx.lineTo(cx + rx, cy);
        // Lower curve (reversed — right to left)
        ctx.bezierCurveTo(
          cx + rx * 0.3, cy + ry * openEased * 1.7,
          cx - rx * 0.3, cy + ry * openEased * 1.7,
          cx - rx, cy
        );
        ctx.lineTo(0, cy);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fill();
        ctx.restore();

        // ── Glowing line / eyelid edges ───────────────────────────────────
        const startX = cx - rx;
        const endX = cx + rx;
        const drawnX = startX + (endX - startX) * easeInOut(lineProgress);
        const lineAlpha = openProgress > 0.6
          ? Math.max(0, 1 - (openProgress - 0.6) / 0.4) * alpha
          : alpha;

        if (drawnX > startX && lineAlpha > 0) {
          // Clip line drawing to only the portion drawn so far
          ctx.save();
          ctx.beginPath();
          ctx.rect(startX, 0, drawnX - startX, H);
          ctx.clip();

          // TOP eyelid glow edge
          eyePath(true, openEased);
          ctx.lineWidth = 10;
          ctx.strokeStyle = `rgba(0,245,255,${0.35 * lineAlpha})`;
          ctx.stroke();

          eyePath(true, openEased);
          ctx.lineWidth = 2;
          ctx.strokeStyle = `rgba(0,245,255,${lineAlpha})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#00F5FF";
          ctx.stroke();
          ctx.shadowBlur = 0;

          // BOTTOM eyelid glow edge
          eyePath(false, openEased);
          ctx.lineWidth = 8;
          ctx.strokeStyle = `rgba(0,245,255,${0.25 * lineAlpha})`;
          ctx.stroke();

          eyePath(false, openEased);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(0,245,255,${lineAlpha * 0.8})`;
          ctx.stroke();

          ctx.restore();

          // Leading point while line is drawing
          if (lineProgress < 1) {
            const ptGrad = ctx.createRadialGradient(drawnX, cy, 0, drawnX, cy, 16);
            ptGrad.addColorStop(0, `rgba(255,255,255,${lineAlpha})`);
            ptGrad.addColorStop(0.3, `rgba(0,245,255,${0.9 * lineAlpha})`);
            ptGrad.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.arc(drawnX, cy, 16, 0, Math.PI * 2);
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