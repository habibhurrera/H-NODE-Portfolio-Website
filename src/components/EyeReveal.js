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

      // ── Black overlay + eyelids ────────────────────────────────────────────
      const lineDrawProgress = Math.min(elapsed / PHASE_LINE_DRAW, 1);
      const afterHold = elapsed - PHASE_LINE_DRAW - PHASE_LINE_HOLD;
      const eyeOpenProgress = afterHold > 0 ? Math.min(afterHold / PHASE_EYE_OPEN, 1) : 0;
      const fadeProgress = afterHold > PHASE_EYE_OPEN
        ? Math.min((afterHold - PHASE_EYE_OPEN) / PHASE_FADE_OUT, 1)
        : 0;

      const overlayAlpha = 1 - fadeProgress;
      const openEased = easeOut(eyeOpenProgress);
      const maxGap = cy + rx * 0.55;

      const topLidBottom = lineY - openEased * maxGap;
      const bottomLidTop = lineY + openEased * maxGap;

      // Top black lid
      ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
      ctx.fillRect(0, 0, W, topLidBottom);

      // Bottom black lid
      ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
      ctx.fillRect(0, bottomLidTop, W, H - bottomLidTop);

      // Curved top lid edge
      ctx.beginPath();
      ctx.moveTo(cx - rx, topLidBottom);
      ctx.quadraticCurveTo(cx, topLidBottom - openEased * rx * 0.35, cx + rx, topLidBottom);
      ctx.lineTo(cx + rx, 0);
      ctx.lineTo(cx - rx, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
      ctx.fill();

      // Curved bottom lid edge
      ctx.beginPath();
      ctx.moveTo(cx - rx, bottomLidTop);
      ctx.quadraticCurveTo(cx, bottomLidTop + openEased * rx * 0.2, cx + rx, bottomLidTop);
      ctx.lineTo(cx + rx, H);
      ctx.lineTo(cx - rx, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
      ctx.fill();

      // ── Glowing line / eyelid edge ────────────────────────────────────────
      // Line draws during lineDrawProgress, then becomes the eyelid split edge
      if (fadeProgress < 1) {
        const startX = cx - rx;
        const endX = cx + rx;
        const currentEndX = lineDrawProgress < 1
          ? startX + (endX - startX) * easeInOut(lineDrawProgress)
          : endX;

        // Line alpha: fully visible while drawing, fades as eye opens past 50%
        const lineAlpha = eyeOpenProgress > 0.5
          ? Math.max(0, 1 - (eyeOpenProgress - 0.5) / 0.5) * (1 - fadeProgress)
          : (1 - fadeProgress);

        if (currentEndX > startX && lineAlpha > 0) {
          // The line follows the eyelid edges once opening begins
          const topY = topLidBottom;
          const bottomY = bottomLidTop;

          // Draw glow on TOP eyelid edge
          const topGrad = ctx.createLinearGradient(startX, topY, currentEndX, topY);
          topGrad.addColorStop(0, `rgba(0,245,255,0)`);
          topGrad.addColorStop(0.05, `rgba(0,245,255,${0.4 * lineAlpha})`);
          topGrad.addColorStop(0.95, `rgba(0,245,255,${0.4 * lineAlpha})`);
          topGrad.addColorStop(1, `rgba(0,245,255,0)`);
          ctx.beginPath();
          ctx.moveTo(startX, topY);
          ctx.lineTo(currentEndX, topY);
          ctx.lineWidth = 8;
          ctx.strokeStyle = topGrad;
          ctx.stroke();

          // Core bright line on top
          const topCore = ctx.createLinearGradient(startX, topY, currentEndX, topY);
          topCore.addColorStop(0, `rgba(0,245,255,0)`);
          topCore.addColorStop(0.05, `rgba(0,245,255,${lineAlpha})`);
          topCore.addColorStop(0.95, `rgba(0,245,255,${lineAlpha})`);
          topCore.addColorStop(1, `rgba(0,245,255,0)`);
          ctx.beginPath();
          ctx.moveTo(startX, topY);
          ctx.lineTo(currentEndX, topY);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = topCore;
          ctx.stroke();

          // Draw glow on BOTTOM eyelid edge (only when opening)
          if (eyeOpenProgress > 0) {
            const botGrad = ctx.createLinearGradient(startX, bottomY, currentEndX, bottomY);
            botGrad.addColorStop(0, `rgba(0,245,255,0)`);
            botGrad.addColorStop(0.05, `rgba(0,245,255,${0.3 * lineAlpha})`);
            botGrad.addColorStop(0.95, `rgba(0,245,255,${0.3 * lineAlpha})`);
            botGrad.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.moveTo(startX, bottomY);
            ctx.lineTo(currentEndX, bottomY);
            ctx.lineWidth = 6;
            ctx.strokeStyle = botGrad;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(startX, bottomY);
            ctx.lineTo(currentEndX, bottomY);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = botGrad;
            ctx.stroke();
          }

          // Leading point (only while still drawing)
          if (lineDrawProgress < 1) {
            const ptGrad = ctx.createRadialGradient(currentEndX, lineY, 0, currentEndX, lineY, 18);
            ptGrad.addColorStop(0, `rgba(255,255,255,${lineAlpha})`);
            ptGrad.addColorStop(0.2, `rgba(0,245,255,${0.9 * lineAlpha})`);
            ptGrad.addColorStop(1, `rgba(0,245,255,0)`);
            ctx.beginPath();
            ctx.arc(currentEndX, lineY, 18, 0, Math.PI * 2);
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