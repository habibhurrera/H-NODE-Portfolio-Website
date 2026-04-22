import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";

const CyberCore = dynamic(() => import("@/components/CyberCore"), { ssr: false });

// Scramble effect (unchanged — it's good)
const ScrambleText = ({ text, delay = 0, duration = 1.5 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let iteration = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(
          text.split("").map((char, index) => {
            if (index < iteration) return text[index];
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
        );
        if (iteration >= text.length) clearInterval(interval);
        iteration += text.length / (duration * 30);
      }, 30);
    }, delay * 1000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, delay, duration]);

  return <>{displayedText}</>;
};

const MetricCard = ({ label, value, sub }) => (
  <div className="p-4 sm:p-6 border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 group">
    <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mb-3 sm:mb-4 group-hover:text-cyan-400 transition-colors font-semibold">{label}</p>
    <h4 className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tighter">{value}</h4>
    <p className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-widest font-semibold">{sub}</p>
  </div>
);

const ProjectCard = ({ id, title, client, tech, problem, solution, result, status, link }) => (
  <div className="group relative border border-white/10 bg-white/[0.02] p-5 sm:p-8 hover:bg-cyan-500/[0.04] hover:border-cyan-500/30 transition-all duration-700 h-full flex flex-col will-change-transform">
    <div className="flex justify-between items-start mb-6 sm:mb-8 gap-3">
      <div className="flex flex-col text-left min-w-0">
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-[0.4em] mb-2 font-semibold">{id}</span>
        <h4 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{title}</h4>
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mt-1 font-medium">{client}</span>
      </div>
      <div className={`px-2 sm:px-3 py-1 border ${status === "DEPLOYED" ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" : status === "LIVE" ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-gray-400/30 text-gray-300"} text-[9px] sm:text-[10px] font-[family-name:var(--font-jetbrains)] uppercase tracking-widest shrink-0 font-bold`}>
        {status}
      </div>
    </div>

    {/* Problem / Solution / Result */}
    <div className="space-y-4 mb-6 sm:mb-8 text-left flex-1">
      <div className="flex gap-2 sm:gap-3">
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-400 uppercase tracking-widest pt-0.5 shrink-0 w-14 sm:w-16 font-bold">Problem</span>
        <p className="text-gray-200 text-sm font-normal leading-relaxed">{problem}</p>
      </div>
      <div className="w-full h-[1px] bg-white/10" />
      <div className="flex gap-2 sm:gap-3">
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-widest pt-0.5 shrink-0 w-14 sm:w-16 font-bold">Solution</span>
        <p className="text-gray-100 text-sm font-normal leading-relaxed">{solution}</p>
      </div>
      <div className="w-full h-[1px] bg-white/10" />
      <div className="flex gap-2 sm:gap-3">
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-widest pt-0.5 shrink-0 w-14 sm:w-16 font-bold">Result</span>
        <p className="text-white text-sm font-semibold leading-relaxed">{result}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mt-auto pt-4 sm:pt-6 border-t border-white/10 items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {tech.map((t, i) => (
          <span key={i} className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest px-2 py-1 border border-white/15 font-semibold">{t}</span>
        ))}
      </div>
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-widest hover:text-white transition-colors border border-cyan-500/30 px-3 py-1 hover:border-cyan-500 font-bold">
          View →
        </a>
      )}
    </div>

    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/0 group-hover:bg-cyan-500/[0.05] blur-3xl transition-all duration-700 -z-10" />
  </div>
);

const ServiceCard = ({ title, desc, skills, cta }) => (
  <div className="p-6 sm:p-10 border border-white/10 bg-white/[0.02] hover:bg-cyan-500/[0.04] hover:border-cyan-500/30 transition-all duration-500 group text-left flex flex-col">
    <h4 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight mb-4">{title}</h4>
    <p className="text-gray-200 text-base leading-relaxed mb-6 sm:mb-8 font-normal flex-1">{desc}</p>
    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 mb-6 sm:mb-8">
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest font-semibold">{skill}</span>
        </div>
      ))}
    </div>
    {cta && (
      <a href="#contact" className="text-xs font-[family-name:var(--font-jetbrains)] text-black bg-cyan-500 hover:bg-cyan-400 transition-colors uppercase tracking-widest px-6 py-3 self-start font-bold">
        {cta} →
      </a>
    )}
  </div>
);

export default function Portfolio({ onReset }) {
  const containerRef = useRef(null);
  const [formState, setFormState] = useState({ name: "", email: "", message: "", budget: "" });
  const [formStatus, setFormStatus] = useState("idle"); // idle | sending | sent | error
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });
    tl.fromTo(".hero-reveal-delayed",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" },
      "+=1.8"
    );
  }, []);

  // Close mobile menu on route change / scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("sending");
    const subject = encodeURIComponent(`Project Inquiry from ${formState.name}`);
    const body = encodeURIComponent(`Name: ${formState.name}\nEmail: ${formState.email}\nBudget: ${formState.budget}\n\n${formState.message}`);
    window.open(`mailto:habibhurrera@gmail.com?subject=${subject}&body=${body}`);
    setFormStatus("sent");
  };

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#000000] text-white selection:bg-cyan-500/30 overflow-x-hidden scroll-smooth">

      {/* —— NAVBAR —— */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-black/40">
        <div className="flex items-center">
          <button onClick={onReset} className="group flex items-center justify-center p-2 rounded-full border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300" title="Reset System">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-cyan-400 transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="font-[family-name:var(--font-jetbrains)] font-bold text-xl tracking-tighter text-cyan-400 ml-4 sm:ml-12 uppercase">H-NODE</div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-10 text-[13px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.3em] text-gray-400">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="hover:text-cyan-400 transition-colors">{l.label}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="#contact" className="hidden sm:block px-5 sm:px-8 py-2 sm:py-3 border border-cyan-500/30 text-cyan-400 text-[13px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500 transition-all duration-300">
            Work With Me
          </a>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-[5px] p-2 border border-white/10 hover:border-cyan-500/40 transition-colors"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1.5px] bg-gray-300 transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-gray-300 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-gray-300 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.4em] text-gray-300 hover:text-cyan-400 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 px-10 py-4 border border-cyan-500/40 text-cyan-400 text-sm font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.3em] hover:bg-cyan-500/10 transition-all"
          >
            Work With Me
          </a>
        </div>
      )}

      <main className="relative z-10">

        {/* —— HERO —— */}
        <section className="h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 relative overflow-hidden">
          <CyberCore />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="z-10 flex flex-col items-center w-full">
            <div className="hero-reveal-delayed opacity-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6 sm:mb-8 max-w-[90vw]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-[family-name:var(--font-jetbrains)] uppercase tracking-widest text-cyan-400/80 text-center">
                Available for Remote & Hybrid Roles — Worldwide
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-jetbrains)] text-xl sm:text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-[1.1] max-w-5xl text-white uppercase px-2">
              <ScrambleText text="I build" delay={0.4} duration={0.4} />{" "}
              <span className="text-cyan-400"><ScrambleText text="intelligent systems" delay={0.8} duration={0.6} /></span>{" "}
              <ScrambleText text="that bridge" delay={1.4} duration={0.4} />{" "}
              <span className="text-cyan-400"><ScrambleText text="hardware" delay={1.8} duration={0.4} /></span>{" "}
              <ScrambleText text="and" delay={2.2} duration={0.2} />{" "}
              <span className="text-cyan-400"><ScrambleText text="AI" delay={2.4} duration={0.4} /></span>
            </h1>

            <div className="hero-reveal-delayed opacity-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-7 sm:mb-10" />

            <p className="hero-reveal-delayed opacity-0 max-w-2xl text-gray-200 font-[family-name:var(--font-inter)] leading-relaxed text-base sm:text-lg md:text-xl mb-4 font-normal px-2">
              Embedded firmware engineer and AI-assisted builder. I ship production IoT systems, LVGL HMIs, and web products — from hardware to cloud.
            </p>
            <p className="hero-reveal-delayed opacity-0 max-w-xl text-gray-400 font-[family-name:var(--font-jetbrains)] text-[10px] sm:text-[11px] uppercase tracking-widest mb-8 sm:mb-12 px-4 text-center font-semibold">
              ESP32 · STM32 · FreeRTOS · MQTT · Next.js · n8n · KiCAD · LVGL
            </p>

            <div className="hero-reveal-delayed opacity-0 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <a href="#projects" className="px-8 sm:px-12 py-4 sm:py-5 bg-cyan-500 text-black font-[family-name:var(--font-jetbrains)] text-[13px] sm:text-[14px] uppercase tracking-[0.2em] font-bold hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] text-center">
                View My Work
              </a>
              <a href="#contact" className="px-8 sm:px-12 py-4 sm:py-5 border border-cyan-500/30 text-cyan-400 font-[family-name:var(--font-jetbrains)] text-[13px] sm:text-[14px] uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500 transition-all duration-300 font-bold text-center">
                Work With Me
              </a>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 hero-reveal-delayed">
            <span className="text-[10px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.4em] text-gray-500">Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse" />
          </div>
        </section>

        {/* —— ABOUT —— */}
        <section id="about" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden">
          <div className="hidden lg:block absolute top-0 right-0 text-[15rem] font-bold text-white/[0.02] select-none pointer-events-none transform translate-x-1/4 -translate-y-1/4 uppercase">Architect</div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-start">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.5em] font-bold">[ Identity Protocol ]</h2>
              </div>

              <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-8 sm:mb-10 leading-[1.1] tracking-tight">
                Not just code. <br />
                <span className="text-gray-400 italic">Engineered Systems.</span>
              </h3>

              <div className="space-y-6 text-gray-100 text-base sm:text-lg font-normal leading-relaxed max-w-xl">
                <p>
                  B.E. Mechatronics, Mehran University. National grant recipient <span className="text-white font-semibold">(NGIRI-2024-28079)</span> for a bionic prosthetic hand with ML gesture classification. Currently contracted with a <span className="text-white font-semibold">US-based client (Bigfoot Ventures LLC)</span> shipping a commercial prepaid energy management system.
                </p>
                <p>
                  I use <span className="text-cyan-400 font-semibold">Claude, ChatGPT-4, and Gemini</span> as daily engineering collaborators — not autocomplete. Every AI-generated output passes hardware validation or staging stress-tests before it touches production.
                </p>
                <p>
                  I've delivered 20+ technical workshops on embedded systems and industrial IoT, and built a sovereign telemetry pipeline eliminating SaaS cloud dependency entirely.
                </p>
              </div>

              <div className="mt-10 sm:mt-12 p-5 sm:p-6 border-l-2 border-cyan-500/50 bg-cyan-500/[0.04]">
                <p className="text-sm font-[family-name:var(--font-jetbrains)] text-gray-200 leading-relaxed italic font-medium">
                  "The difference between a developer and an architect is the ability to see the system as a single organism — from silicon to cloud."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 lg:pt-12">
              <MetricCard label="Commercial Deployments" value="5+" sub="Zero hardware revisions" />
              <MetricCard label="Firmware Response Time" value="<100ms" sub="Production benchmark" />
              <MetricCard label="Hardware Designs" value="15+" sub="DFM-ready, zero DRVs" />
              <MetricCard label="Workshops Delivered" value="20+" sub="Industry & university" />

              <div className="col-span-2 p-4 sm:p-6 border border-cyan-500/20 bg-cyan-500/[0.05] flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-cyan-400 uppercase tracking-[0.3em] mb-1 font-bold">Current Status</p>
                  <p className="text-white font-[family-name:var(--font-jetbrains)] text-sm font-semibold">Open to Remote / Hybrid — Worldwide</p>
                  <p className="text-gray-300 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest mt-1 font-medium">Embedded · IoT · AI-Assisted Engineering</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4] shrink-0" />
              </div>
            </div>
          </div>
        </section>

        {/* —— PROJECTS —— */}
        <section id="projects" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.5em] font-bold">[ Systems Archive ]</h2>
              </div>
              <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight uppercase">
                Deployed <br /> <span className="text-gray-500">Architecture</span>
              </h3>
            </div>
            <p className="max-w-xs text-gray-200 text-sm text-left leading-relaxed font-[family-name:var(--font-jetbrains)] uppercase tracking-widest font-semibold">
              Each project is a production system — not a demo. Problem, solution, and measurable result.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <ProjectCard
              id="PROJ_001"
              title="PEMS Ecosystem"
              client="Bigfoot Ventures LLC // USA"
              tech={["ESP32", "SIM7000G", "LVGL v9", "RFID", "KiCAD"]}
              problem="Client needed an offline, card-based prepaid energy billing platform to replace postpaid meters — no cloud round-trips allowed."
              solution="Dual-controller architecture: ESP32 HMI + LilyGO T-SIM7000G linked via custom UART protocol at 115,200 baud with cryptographic RFID authentication."
              result="Shipped to production in a single release cycle with zero inter-controller message collisions and zero hardware revision."
              status="DEPLOYED"
            />
            <ProjectCard
              id="PROJ_002"
              title="Sovereign IoT Pipeline"
              client="Industrial Telemetry // Self-Hosted"
              tech={["Docker", "n8n", "Supabase", "Grafana", "Twilio"]}
              problem="Client required real-time industrial telemetry with anomaly alerting but zero SaaS cloud vendor dependency or recurring cost."
              solution="Full self-hosted stack on Docker Compose: ESP32-S3 → Mosquitto → n8n → Supabase PostgreSQL (BRIN-indexed) → Grafana with conditional WhatsApp alerting."
              result="Zero cloud-vendor dependency achieved. Sub-second sync latency sustained. Foundation for ongoing AI agent development via n8n + Claude API."
              status="DEPLOYED"
            />
            <ProjectCard
              id="PROJ_004"
              title="Bionic Prosthetic Hand"
              client="National Grant // NGIRI-2024-28079"
              tech={["Arduino", "EMG Sensors", "ML Classification", "PID", "3D Print"]}
              problem="Develop an affordable, research-grade prosthetic that reads EMG muscle signals and classifies real-time gestures for actuation."
              solution="Arduino-controlled 3D-printed (PLA/TPU) hand with EMG array for gesture intent detection and ML model trained on 5 distinct grip classes."
              result="Secured competitive national research funding. Closed-loop PID servo actuation achieving repeatable grip motion across all trained gesture classes."
              status="RESEARCH"
            />
            <ProjectCard
              id="PROJ_005"
              title="Relay Timer Controller"
              client="Commercial Embedded"
              tech={["ESP32-S3", "LovyanGFX", "LVGL v9", "DS1302 RTC", "ST7789"]}
              problem="Required a standalone high-voltage scheduling device with RTC-driven relay control, touchscreen UI, and manual override capability."
              solution="Production-grade LovyanGFX + LVGL v9 UI on ST7789 172×320 display with DS1302 RTC scheduling, three-button input, and relay override logic."
              result="Zero display artifacts on final build. Resolved LVGL v8→v9 API migration and TFT_eSPI→LovyanGFX driver port with no rework cycle."
              status="DEPLOYED"
            />
          </div>
        </section>

        {/* —— SERVICES —— */}
        <section id="services" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden">
          <div className="hidden lg:block absolute top-0 left-0 text-[12rem] font-bold text-white/[0.01] select-none pointer-events-none transform -translate-x-1/4 -translate-y-1/4 uppercase">Capabilities</div>

          <div className="text-left mb-12 sm:mb-20 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-cyan-500" />
              <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.5em] font-bold">[ What I Build For You ]</h2>
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight uppercase">
              Services & <br /> <span className="text-gray-400">Capabilities</span>
            </h3>
            <p className="text-gray-200 text-sm font-[family-name:var(--font-jetbrains)] uppercase tracking-widest mt-6 max-w-md font-semibold">
              Fixed-scope engagements. Clear deliverables. No scope creep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <ServiceCard
              title="Embedded Firmware"
              desc="Bare-metal and RTOS-based firmware for safety-critical and commercial applications. I own the full cycle: architecture, drivers, ISR design, OTA, and bring-up."
              skills={["ESP32 / STM32", "FreeRTOS Architecture", "ISR & Driver Design", "OTA Update Systems", "UART / I2C / SPI / CAN"]}
              cta="Discuss a firmware project"
            />
            <ServiceCard
              title="IoT System & Cloud Pipeline"
              desc="Self-hosted, vendor-independent telemetry stacks with real-time dashboards and alerting. No recurring SaaS fees. Full sovereignty over your data."
              skills={["MQTT / Modbus / LoRa", "n8n Automation", "Supabase PostgreSQL", "Grafana Analytics", "Docker / Twilio"]}
              cta="Get a pipeline built"
            />
            <ServiceCard
              title="Web & AI-Assisted Products"
              desc="Production Next.js websites and AI-augmented tools built fast using Claude as a pair-programming collaborator. Clinics, agencies, and SaaS — shipped and deployed."
              skills={["Next.js 14 / TypeScript", "Tailwind + Framer Motion", "Vercel Deployment", "Google Sheets API", "AI Agent Integration"]}
              cta="Build a web product"
            />
          </div>
        </section>

        {/* —— CONTACT —— */}
        <section id="contact" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-start">

            {/* Left: Heading + channels */}
            <div className="text-left">
              <div className="flex items-center gap-4 mb-8 sm:mb-10">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.5em] font-bold">[ System Uplink ]</h2>
              </div>
              <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 sm:mb-8 tracking-tight uppercase leading-tight">
                Ready to <span className="text-cyan-400 italic">architect</span> your next system?
              </h3>
              <p className="text-gray-100 text-base font-normal leading-relaxed mb-10 sm:mb-12 max-w-md">
                Whether you need embedded firmware, a self-hosted IoT pipeline, hardware design, or a production website — let's talk scope and timeline.
              </p>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mb-2 font-bold">Email</p>
                  <a href="mailto:habibhurrera@gmail.com" className="text-base sm:text-xl font-normal hover:text-cyan-400 transition-colors tracking-tight break-all">habibhurrera@gmail.com</a>
                </div>
                <div>
                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mb-2 font-bold">WhatsApp (fastest response)</p>
                  <a href="https://wa.me/923333934738" target="_blank" rel="noopener noreferrer" className="text-base sm:text-xl font-normal hover:text-green-400 transition-colors tracking-tight">+92 333 3934738</a>
                </div>
                <div>
                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mb-2 font-bold">LinkedIn</p>
                  <a href="https://linkedin.com/in/muhammad-hurrera-671400250" target="_blank" rel="noopener noreferrer" className="text-base sm:text-xl font-normal hover:text-cyan-400 transition-colors tracking-tight break-all">muhammad-hurrera</a>
                </div>
                <div>
                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest mb-2 font-bold">GitHub</p>
                  <a href="https://github.com/habibhurrera" target="_blank" rel="noopener noreferrer" className="text-base sm:text-xl font-normal hover:text-cyan-400 transition-colors tracking-tight">habibhurrera</a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="p-6 sm:p-10 border border-white/5 bg-white/[0.01]">
              <h4 className="text-xl font-semibold text-white mb-8 uppercase tracking-tight font-[family-name:var(--font-jetbrains)]">Send a Brief</h4>

              {formStatus === "sent" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <p className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-sm uppercase tracking-widest">Message Routed</p>
                  <p className="text-gray-500 text-sm">Your email client opened with the brief pre-filled. Hit send and I'll respond within 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest mb-2 block font-bold">Name</label>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                        className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan-500/70 transition-colors placeholder:text-gray-500 font-[family-name:var(--font-jetbrains)]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest mb-2 block font-bold">Email</label>
                      <input
                        type="email"
                        value={formState.email}
                        onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                        className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan-500/70 transition-colors placeholder:text-gray-500 font-[family-name:var(--font-jetbrains)]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest mb-2 block font-bold">Project Type / Budget</label>
                    <select
                      value={formState.budget}
                      onChange={e => setFormState(s => ({ ...s, budget: e.target.value }))}
                      className="w-full bg-black border border-white/20 text-gray-100 text-sm px-4 py-3 focus:outline-none focus:border-cyan-500/70 transition-colors font-[family-name:var(--font-jetbrains)]"
                    >
                      <option value="">Select a service...</option>
                      <option value="Embedded Firmware">Embedded Firmware</option>
                      <option value="IoT Pipeline">IoT Pipeline</option>
                      <option value="Hardware Design">Hardware Design</option>
                      <option value="Web / AI Product">Web / AI Product</option>
                      <option value="Custom scope">Custom scope</option>
                      <option value="Job opportunity / Remote role">Job opportunity / Remote role</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest mb-2 block font-bold">Project Brief</label>
                    <textarea
                      rows={5}
                      value={formState.message}
                      onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                      className="w-full bg-transparent border border-white/20 text-white text-sm px-4 py-3 focus:outline-none focus:border-cyan-500/70 transition-colors placeholder:text-gray-500 font-[family-name:var(--font-jetbrains)] resize-none"
                      placeholder="Describe your system, timeline, and goals..."
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={formStatus === "sending" || !formState.name || !formState.email || !formState.message}
                    className="w-full px-8 py-4 sm:py-5 bg-cyan-500 text-black font-[family-name:var(--font-jetbrains)] text-[13px] uppercase tracking-[0.2em] font-bold hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {formStatus === "sending" ? "Routing..." : "Send Brief →"}
                  </button>

                  <p className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest text-center font-semibold">
                    Or reach me directly on WhatsApp for fastest response
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* —— FOOTER —— */}
        <footer className="py-8 sm:py-12 px-4 sm:px-8 border-t border-white/5 bg-black/50">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <div className="text-cyan-400 font-bold tracking-tighter uppercase font-[family-name:var(--font-jetbrains)]">H-NODE // ARCHITECT</div>
              <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />
              <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-300 uppercase tracking-widest">© 2026 Muhammad Hurrera</div>
            </div>

            <div className="flex flex-wrap items-center gap-5 sm:gap-8">
              <a href="https://wa.me/923333934738" target="_blank" rel="noopener noreferrer" className="text-[10px] font-[family-name:var(--font-jetbrains)] text-green-500 uppercase tracking-widest hover:text-green-400 transition-colors">
                WhatsApp
              </a>
              <a href="https://github.com/habibhurrera" target="_blank" rel="noopener noreferrer" className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-300 hover:text-white uppercase tracking-widest transition-colors font-semibold">
                GitHub
              </a>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-200 uppercase tracking-widest font-semibold">System Online</span>
              </div>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-300 hover:text-white uppercase tracking-widest transition-colors font-semibold">
                Top ↑
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Background Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}