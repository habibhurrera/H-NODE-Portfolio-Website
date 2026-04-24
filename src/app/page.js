"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Portfolio from "@/components/Portfolio";
import EyeReveal from "@/components/EyeReveal";

const DigitalEye = dynamic(() => import("@/components/DigitalEye"), { ssr: false });

export default function Home() {
  const [bootPhase, setBootPhase] = useState("idle");
  const [introPhase, setIntroPhase] = useState("revealing");

  useEffect(() => {
    if (bootPhase === "booting") {
      const t = setTimeout(() => setBootPhase("complete"), 2000);
      return () => clearTimeout(t);
    } else if (bootPhase === "complete") {
      const t = setTimeout(() => setBootPhase("finished"), 1500);
      return () => clearTimeout(t);
    }
  }, [bootPhase]);

  const isBooting = bootPhase !== "idle";

  if (bootPhase === "finished") {
    return <Portfolio onReset={() => {
      setIntroPhase("revealing");
      setBootPhase("idle");
    }} />;
  }

  return (
    <main style={{
      position: "relative", width: "100%", height: "100dvh",
      backgroundColor: "#000000", overflow: "hidden",
    }}>
      {/* Eye — full screen, always visible */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <DigitalEye isBooting={isBooting} />
      </div>

      {/* Reveal animation */}
      {introPhase === "revealing" && (
        <EyeReveal onComplete={() => setIntroPhase("done")} />
      )}

      {/* Boot complete popup */}
      {bootPhase === "complete" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 50,
          background: "rgba(0,15,20,0.85)", border: "1px solid #00F5FF",
          padding: "clamp(1.2rem,4vw,2.5rem) clamp(1.5rem,6vw,4rem)",
          borderRadius: "4px", backdropFilter: "blur(12px)",
          boxShadow: "0 0 40px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,245,255,0.1)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
          animation: "fadeIn 0.5s ease-out forwards",
          width: "min(420px, 90vw)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-jetbrains)", color: "#00F5FF",
            fontSize: "clamp(11px, 2.5vw, 24px)", letterSpacing: "0.15em", margin: 0,
            textShadow: "0 0 15px rgba(0,245,255,0.6)", textAlign: "center",
          }}>SYSTEM INITIALIZATION COMPLETE</h2>
          <div style={{
            width: "80%", height: "1px",
            background: "linear-gradient(90deg, transparent, #00F5FF, transparent)",
            marginTop: "4px", opacity: 0.7,
          }} />
        </div>
      )}

      {/* Title + subtitle */}
      <div style={{
        position: "absolute",
        bottom: "clamp(80px, 14%, 120px)",
        left: 0, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 10, pointerEvents: "none",
        opacity: introPhase === "done" && !isBooting ? 1 : 0,
        transition: "opacity 0.8s ease",
        paddingInline: "1rem",
      }}>
        <h1 style={{
          fontFamily: "var(--font-inter)", fontWeight: 200,
          fontSize: "clamp(1.6rem, 6vw, 64px)", color: "#ffffff",
          letterSpacing: "0.05em", margin: "0 0 1rem 0",
          textShadow: "0 0 20px rgba(0,0,0,0.8)", textAlign: "center",
        }}>SEE BEYOND THE DATA</h1>
        <p style={{
          fontFamily: "var(--font-jetbrains)", color: "rgba(0,245,255,0.6)",
          fontSize: "clamp(8px, 2vw, 16px)", letterSpacing: "0.3em",
          textTransform: "uppercase", margin: 0,
          textShadow: "0 0 10px rgba(0,0,0,0.8)", textAlign: "center",
        }}>Muhammad Hurrera // Systems Architect</p>
      </div>

      {/* Initialize button */}
      {bootPhase !== "complete" && (
        <div style={{
          position: "absolute",
          bottom: "clamp(20px, 5%, 40px)",
          left: 0, width: "100%",
          display: "flex", justifyContent: "center", zIndex: 11,
          opacity: introPhase === "done" && !isBooting ? 1 : 0,
          transition: "opacity 0.8s ease",
          pointerEvents: introPhase === "done" && !isBooting ? "auto" : "none",
        }}>
          <button
            style={{
              background: "transparent", border: "1px solid #00F5FF", color: "#00F5FF",
              padding: "clamp(10px,2vw,12px) clamp(20px,5vw,32px)",
              borderRadius: "2px", fontFamily: "var(--font-jetbrains)",
              fontSize: "clamp(11px,2vw,14px)", letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: bootPhase === "booting" ? "default" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "inset 0 0 10px rgba(0,245,255,0.1), 0 0 10px rgba(0,245,255,0.1)",
              whiteSpace: "nowrap",
            }}
            onClick={() => setBootPhase("booting")}
            onMouseEnter={(e) => {
              if (bootPhase === "idle") {
                e.currentTarget.style.backgroundColor = "rgba(0,245,255,0.1)";
                e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2), 0 0 20px rgba(0,245,255,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (bootPhase === "idle") {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(0,245,255,0.1), 0 0 10px rgba(0,245,255,0.1)";
              }
            }}
          >
            {bootPhase === "booting" ? "SYSTEM BOOTING..." : "INITIALIZE SYSTEM"}
          </button>
        </div>
      )}
    </main>
  );
}