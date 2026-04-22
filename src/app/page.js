"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Portfolio from "@/components/Portfolio";

const DigitalEye = dynamic(() => import("@/components/DigitalEye"), { ssr: false });

export default function Home() {
  const [bootPhase, setBootPhase] = useState("idle");

  useEffect(() => {
    if (bootPhase === "booting") {
      const timer = setTimeout(() => setBootPhase("complete"), 2000);
      return () => clearTimeout(timer);
    } else if (bootPhase === "complete") {
      const timer = setTimeout(() => setBootPhase("finished"), 1500);
      return () => clearTimeout(timer);
    }
  }, [bootPhase]);

  const isBooting = bootPhase !== "idle";

  if (bootPhase === "finished") {
    return <Portfolio onReset={() => setBootPhase("idle")} />;
  }

  return (
    <>
      {/* Mobile-only overrides — desktop pixel-perfect unchanged */}
      <style>{`
        @media (max-width: 767px) {
          .eye-wrap { height: 52vh !important; }
          .hero-text-block { bottom: 8% !important; }
          .hero-btn-wrap { bottom: 2% !important; }
          .hero-h1 {
            font-size: clamp(1.5rem, 8vw, 2.5rem) !important;
            margin-bottom: 0.5rem !important;
          }
          .hero-sub {
            font-size: 10px !important;
            letter-spacing: 0.2em !important;
            margin-bottom: 1.8rem !important;
          }
        }
      `}</style>

      <main style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#000000",
        overflow: "hidden",
      }}>

        {/* Eye wrapper — desktop: full 100vh, mobile: capped to 52vh via CSS */}
        <div className="eye-wrap" style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}>
          <DigitalEye isBooting={isBooting} />
        </div>

        {/* Boot complete popup — completely unchanged */}
        {bootPhase === "complete" && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
            background: "rgba(0, 15, 20, 0.85)",
            border: "1px solid #00F5FF",
            padding: "2.5rem 4rem",
            borderRadius: "4px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 40px rgba(0, 245, 255, 0.15), inset 0 0 20px rgba(0, 245, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            animation: "fadeIn 0.5s ease-out forwards",
          }}>
            <h2 style={{
              fontFamily: "var(--font-jetbrains)",
              color: "#00F5FF",
              fontSize: "clamp(18px, 3vw, 24px)",
              letterSpacing: "0.15em",
              margin: 0,
              textShadow: "0 0 15px rgba(0, 245, 255, 0.6)",
              textAlign: "center",
            }}>
              SYSTEM INITIALIZATION COMPLETE
            </h2>
            <div style={{
              width: "80%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #00F5FF, transparent)",
              marginTop: "8px",
              opacity: 0.7,
            }} />
          </div>
        )}

        {/* Title block — desktop: bottom 12%, mobile: bottom 8% via CSS */}
        <div
          className="hero-text-block"
          style={{
            position: "absolute",
            bottom: "12%",
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            pointerEvents: "none",
            opacity: isBooting ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          <h1
            className="hero-h1"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 200,
              fontSize: "clamp(2.5rem, 6vw, 64px)",
              color: "#ffffff",
              letterSpacing: "0.05em",
              margin: "0 0 1rem 0",
              textShadow: "0 0 20px rgba(0,0,0,0.8)",
              textAlign: "center",
              paddingInline: "1rem",
            }}
          >
            SEE BEYOND THE DATA
          </h1>
          <p
            className="hero-sub"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "rgba(0, 245, 255, 0.6)",
              fontSize: "clamp(12px, 2vw, 16px)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              margin: "0 0 2.5rem 0",
              textShadow: "0 0 10px rgba(0,0,0,0.8)",
              textAlign: "center",
            }}
          >
            Muhammad Hurrera // Systems Architect
          </p>
        </div>

        {/* Button — desktop: bottom 6%, mobile: bottom 2% via CSS */}
        {bootPhase !== "complete" && (
          <div
            className="hero-btn-wrap"
            style={{
              position: "absolute",
              bottom: "6%",
              left: 0,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              zIndex: 11,
            }}
          >
            <button
              style={{
                pointerEvents: bootPhase === "booting" ? "none" : "auto",
                background: "transparent",
                border: "1px solid #00F5FF",
                color: "#00F5FF",
                padding: "12px 32px",
                borderRadius: "2px",
                fontFamily: "var(--font-jetbrains)",
                fontSize: "14px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: bootPhase === "booting" ? "default" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "inset 0 0 10px rgba(0, 245, 255, 0.1), 0 0 10px rgba(0, 245, 255, 0.1)",
              }}
              onClick={() => setBootPhase("booting")}
              onMouseEnter={(e) => {
                if (bootPhase === "idle") {
                  e.currentTarget.style.backgroundColor = "rgba(0, 245, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0, 245, 255, 0.2), 0 0 20px rgba(0, 245, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (bootPhase === "idle") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(0, 245, 255, 0.1), 0 0 10px rgba(0, 245, 255, 0.1)";
                }
              }}
            >
              {bootPhase === "booting" ? "SYSTEM BOOTING..." : "INITIALIZE SYSTEM"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}