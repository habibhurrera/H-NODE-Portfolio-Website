"use client";

import { useEffect, useRef } from "react";

export default function DigitalEye({ isBooting }) {
  const canvasRef = useRef(null);
  const isBootingRef = useRef(isBooting);

  useEffect(() => {
    isBootingRef.current = isBooting;
  }, [isBooting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    let animationFrameId;

    let width, height, cx, cy, R, r_pupil, r_iris;
    let irisRings = [];
    let rimCanvas, rimSize;

    let matrixColumns = [];
    let matrixActive = false;
    let bootStartTime = null;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: false });

    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (R) {
        targetX = nx * (R * 0.12);
        targetY = ny * (R * 0.12);
      }
    };

    const handleDeviceOrientation = (e) => {
      if (!e.beta || !e.gamma || !R) return;
      const nx = Math.max(-1, Math.min(1, e.gamma / 25));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      targetX = nx * (R * 0.12);
      targetY = ny * (R * 0.12);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      // On mobile, use screen.height so the canvas covers the full physical screen
      // instead of being clipped by the browser toolbar
      const isMobile = width < 768;
      const canvasHeight = isMobile ? window.screen.height : height;

      canvas.width = width * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${canvasHeight}px`;

      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.scale(dpr, dpr);

      // Use canvasHeight for all drawing so everything covers the full canvas
      height = canvasHeight;

      // Eye stays centered in the visible viewport, not the extended canvas
      const visibleHeight = window.innerHeight;
      cx = width / 2;
      cy = isMobile ? visibleHeight * 0.46 : visibleHeight / 2;

      R = isMobile ? Math.min(width, visibleHeight) * 0.3 : visibleHeight * 0.35;
      r_pupil = R * 0.28;
      r_iris = R * 0.85;

      irisRings = [];
      const numRings = 10;
      const colors = ["#00F5FF", "#00E5F0", "#00D5E0", "#00C8D8", "#00AABB", "#0090A0", "#008090", "#007080", "#006070", "#005566"];
      for (let i = 0; i < numRings; i++) {
        const radius = r_pupil + 8 + (i * ((r_iris - r_pupil) / numRings));
        const circumference = 2 * Math.PI * radius;
        const charCount = Math.floor(circumference / 5.5);
        const fontSize = i === 0 ? 9 : 7;

        const ringCanvas = document.createElement("canvas");
        const ringCtx = ringCanvas.getContext("2d", { alpha: true });
        const size = (radius + fontSize) * 2;
        ringCanvas.width = size * dpr;
        ringCanvas.height = size * dpr;
        ringCtx.scale(dpr, dpr);
        ringCtx.translate(size / 2, size / 2);
        ringCtx.fillStyle = colors[i % colors.length];
        ringCtx.font = `${fontSize}px monospace`;
        ringCtx.textBaseline = "middle";
        ringCtx.textAlign = "center";

        const angleStep = (Math.PI * 2) / charCount;
        for (let j = 0; j < charCount; j++) {
          const char = Math.random() > 0.5 ? "1" : "0";
          ringCtx.save();
          ringCtx.rotate(j * angleStep);
          ringCtx.translate(0, -radius);
          ringCtx.fillText(char, 0, 0);
          ringCtx.restore();
        }

        irisRings.push({
          canvas: ringCanvas,
          size: size,
          speed: (i % 2 === 0 ? 1 : -1) * (0.0002 + (numRings - i) * 0.00005)
        });
      }

      rimSize = (r_pupil + 10) * 2;
      rimCanvas = document.createElement("canvas");
      const rimCtx = rimCanvas.getContext("2d", { alpha: true });
      rimCanvas.width = rimSize * dpr;
      rimCanvas.height = rimSize * dpr;
      rimCtx.scale(dpr, dpr);
      rimCtx.translate(rimSize / 2, rimSize / 2);
      rimCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
      rimCtx.font = isMobile ? "4px monospace" : "6px monospace";
      rimCtx.textBaseline = "middle";
      rimCtx.textAlign = "center";

      const rimTexts = isMobile
        ? ["0xA4F1", "SYS:OK", "SCAN:77B", "BIO:9C3F", "LINK:UP", "V:2.4"]
        : ["0xA4F1", "SCAN_ID:77B", "RET:0.97", "BIO:9C3F", "SYS:OK", "0x00FF", "V:2.4", "LINK:UP", "NET:SECURE"];
      const rimAngleStep = (Math.PI * 2) / rimTexts.length;
      rimTexts.forEach((text, i) => {
        rimCtx.save();
        rimCtx.rotate(i * rimAngleStep);
        rimCtx.translate(0, -(r_pupil - 4));
        rimCtx.fillText(text, 0, 0);
        rimCtx.restore();
      });

      offscreenCtx.fillStyle = "#000000";
      offscreenCtx.fillRect(0, 0, width, height);

      if (isMobile) {
        const halo = offscreenCtx.createRadialGradient(cx, cy, r_iris * 0.9, cx, cy, r_iris * 1.6);
        halo.addColorStop(0, "rgba(0, 180, 255, 0.05)");
        halo.addColorStop(1, "rgba(0, 180, 255, 0)");
        offscreenCtx.fillStyle = halo;
        offscreenCtx.fillRect(0, 0, width, height);

        const ellipseW = R * 1.6;
        const ellipseH = R * 0.85;
        offscreenCtx.save();
        offscreenCtx.translate(cx, cy);

        for (let i = 0; i < 7000; i++) {
          const x = (Math.random() * 2 - 1) * ellipseW;
          const y = (Math.random() * 2 - 1) * ellipseH;
          const maxY = (1 - Math.pow(x / ellipseW, 2)) * ellipseH;
          if (Math.abs(y) > maxY) continue;
          const distFromCenter = Math.sqrt(x * x + y * y);
          if (distFromCenter < r_iris) continue;
          const edgeDist = distFromCenter - r_iris;
          const maxDist = ellipseW - r_iris;
          const normalizedDist = Math.max(0, Math.min(1, edgeDist / maxDist));
          const keepProb = 0.6 - (0.45 * normalizedDist);
          if (Math.random() > keepProb) continue;
          const isDot = Math.random() > 0.35;
          const size = isDot ? Math.max(0.5, 3.5 * (1 - normalizedDist)) : (5 + Math.random());
          const opacity = 0.2 + 0.35 * (1 - normalizedDist);
          const scleraColors = ["#00C8D8", "#00AABB", "#0090A0", "#007080", "#006070"];
          offscreenCtx.globalAlpha = opacity;
          offscreenCtx.fillStyle = scleraColors[Math.floor(Math.random() * scleraColors.length)];
          if (isDot) {
            offscreenCtx.beginPath();
            offscreenCtx.arc(x, y, size, 0, Math.PI * 2);
            offscreenCtx.fill();
          } else {
            offscreenCtx.font = `${size}px monospace`;
            offscreenCtx.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
          }
        }
        offscreenCtx.restore();

      } else {
        const outerHalo = offscreenCtx.createRadialGradient(cx, cy, r_iris * 0.7, cx, cy, r_iris * 2.2);
        outerHalo.addColorStop(0, "rgba(0, 200, 255, 0.12)");
        outerHalo.addColorStop(0.4, "rgba(0, 180, 255, 0.07)");
        outerHalo.addColorStop(1, "rgba(0, 180, 255, 0)");
        offscreenCtx.fillStyle = outerHalo;
        offscreenCtx.fillRect(0, 0, width, height);

        const innerHalo = offscreenCtx.createRadialGradient(cx, cy, r_iris * 0.85, cx, cy, r_iris * 1.2);
        innerHalo.addColorStop(0, "rgba(0, 245, 255, 0.18)");
        innerHalo.addColorStop(1, "rgba(0, 245, 255, 0)");
        offscreenCtx.fillStyle = innerHalo;
        offscreenCtx.fillRect(0, 0, width, height);

        const ellipseW = R * 1.6;
        const ellipseH = R * 0.85;
        const numParticles = 18000;

        offscreenCtx.save();
        offscreenCtx.translate(cx, cy);

        for (let i = 0; i < numParticles; i++) {
          const x = (Math.random() * 2 - 1) * ellipseW;
          const y = (Math.random() * 2 - 1) * ellipseH;
          const maxY = (1 - Math.pow(x / ellipseW, 2)) * ellipseH;
          if (Math.abs(y) > maxY) continue;
          const distFromCenter = Math.sqrt(x * x + y * y);
          if (distFromCenter < r_iris) continue;
          const edgeDist = distFromCenter - r_iris;
          const maxDist = ellipseW - r_iris;
          const normalizedDist = Math.max(0, Math.min(1, edgeDist / maxDist));
          const keepProb = 0.82 - (0.5 * normalizedDist);
          if (Math.random() > keepProb) continue;
          const isDot = Math.random() > 0.25;
          const size = isDot ? Math.max(0.8, 5.5 * (1 - normalizedDist * 0.7)) : (5 + Math.random() * 2);
          const opacity = 0.35 + 0.55 * (1 - normalizedDist);
          const scleraColors = ["#00F5FF", "#00E8FF", "#00C8D8", "#00AABB", "#00D5E8", "#0090A0", "#007080"];
          const color = scleraColors[Math.floor(Math.random() * scleraColors.length)];
          offscreenCtx.globalAlpha = opacity;
          offscreenCtx.fillStyle = color;
          if (isDot) {
            if (size > 2.5) {
              offscreenCtx.shadowBlur = size * 3;
              offscreenCtx.shadowColor = "#00F5FF";
            } else {
              offscreenCtx.shadowBlur = 0;
            }
            offscreenCtx.beginPath();
            offscreenCtx.arc(x, y, size, 0, Math.PI * 2);
            offscreenCtx.fill();
            offscreenCtx.shadowBlur = 0;
          } else {
            offscreenCtx.font = `${size}px monospace`;
            offscreenCtx.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
          }
        }

        offscreenCtx.globalAlpha = 1;
        offscreenCtx.restore();
      }
    };

    const render = (time) => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      ctx.save();
      ctx.resetTransform();
      ctx.drawImage(offscreenCanvas, 0, 0);
      ctx.restore();

      const isMobile = width < 768;
      const glowIntensity = isMobile ? 0.06 : 0.14;
      const innerGlow = ctx.createRadialGradient(
        cx + currentX, cy + currentY, r_pupil,
        cx, cy, r_pupil + (r_iris - r_pupil) * 0.4
      );
      innerGlow.addColorStop(0, `rgba(0, 200, 255, ${glowIntensity})`);
      innerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = innerGlow;
      ctx.fillRect(0, 0, width, height);

      if (!isMobile) {
        const pulse = 0.04 + Math.sin(time * 0.001) * 0.02;
        const outerGlow = ctx.createRadialGradient(cx, cy, r_iris * 0.9, cx, cy, r_iris * 1.5);
        outerGlow.addColorStop(0, `rgba(0, 245, 255, ${pulse})`);
        outerGlow.addColorStop(1, "transparent");
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.translate(cx, cy);

      irisRings.forEach((ring, index) => {
        ctx.save();
        const parallaxFactor = 0.9 - (index / irisRings.length) * 0.7;
        ctx.translate(currentX * parallaxFactor, currentY * parallaxFactor);
        ctx.rotate(time * ring.speed);
        ctx.drawImage(ring.canvas, -ring.size / 2, -ring.size / 2, ring.size, ring.size);
        ctx.restore();
      });

      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.beginPath();
      ctx.arc(0, 0, r_pupil, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.rotate(time * 0.00015);
      ctx.drawImage(rimCanvas, -rimSize / 2, -rimSize / 2, rimSize, rimSize);
      ctx.restore();

      ctx.restore();

      // Blink
      const cycleDuration = 2000;
      const currentCycle = time % cycleDuration;
      let blinkOpenness = 1.0;
      if (currentCycle < 120) {
        blinkOpenness = 1.0 - Math.sin((currentCycle / 120) * (Math.PI / 2));
      } else if (currentCycle < 300) {
        blinkOpenness = 1.0 - Math.cos(((currentCycle - 120) / 180) * (Math.PI / 2));
      }

      if (blinkOpenness < 1.0) {
        ctx.save();
        ctx.fillStyle = "#000000";
        const maxGap = (height / 2) + R * 1.5;
        const gap = maxGap * blinkOpenness;
        const controlOffset = R * 1.5 * blinkOpenness;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, cy - gap);
        ctx.quadraticCurveTo(cx, cy - gap + controlOffset, 0, cy - gap);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, cy + gap);
        ctx.quadraticCurveTo(cx, cy + gap - controlOffset, 0, cy + gap);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Matrix Rain
      if (isBootingRef.current && !matrixActive) {
        matrixActive = true;
        bootStartTime = time;
        const fontSize = 16;
        const columnsCount = Math.floor(width / fontSize);
        matrixColumns = [];
        for (let i = 0; i < columnsCount; i++) {
          matrixColumns.push({
            x: i * fontSize + (fontSize / 2),
            y: Math.random() * -height * 1.5,
            speed: 15 + Math.random() * 25
          });
        }
      }

      if (matrixActive) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        matrixColumns.forEach(col => {
          col.y += col.speed;
          if (col.y > height + 500) col.y = Math.random() * -200;
          const tail = 35;
          for (let i = 0; i < tail; i++) {
            const drawY = col.y - (i * 16);
            if (drawY > height + 20 || drawY < -20) continue;
            const char = Math.random() > 0.5 ? "1" : "0";
            const opacity = 1 - (i / tail);
            if (i === 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.shadowBlur = 15;
              ctx.shadowColor = "#00FFFF";
            } else {
              ctx.fillStyle = `rgba(0, 245, 255, ${opacity * 0.8})`;
              ctx.shadowBlur = 0;
            }
            ctx.fillText(char, col.x, drawY);
          }
        });
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    init();
    animationFrameId = requestAnimationFrame(render);

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { init(); }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}