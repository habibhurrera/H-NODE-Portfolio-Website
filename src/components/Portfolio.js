import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CyberCore = dynamic(() => import("@/components/CyberCore"), { ssr: false });

// Helper component for robotic/AI scramble effect
const ScrambleText = ({ text, delay = 0, duration = 1.5 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let iteration = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              if (char === " ") return " ";
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += text.length / (duration * 30);
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, duration]);

  return <>{displayedText}</>;
};// Helper component for proof/metrics cards
const MetricCard = ({ label, value, sub }) => (
  <div className="p-6 border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 group">
    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest mb-4 group-hover:text-cyan-400/60 transition-colors">
      {label}
    </p>
    <h4 className="text-4xl font-bold text-white mb-1 tracking-tighter">
      {value}
    </h4>
    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-cyan-400/60 uppercase tracking-widest">
      {sub}
    </p>
  </div>
);

// Helper component for project cards
const ProjectCard = ({ id, title, client, tech, description, status }) => (
  <div className="group relative border border-white/5 bg-white/[0.01] p-8 hover:bg-cyan-500/[0.02] hover:border-cyan-500/20 transition-all duration-700 h-full flex flex-col will-change-transform">
    <div className="flex justify-between items-start mb-10">
      <div className="flex flex-col text-left">
         <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-cyan-400/60 uppercase tracking-[0.4em] mb-2">{id}</span>
         <h4 className="text-2xl font-light text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{title}</h4>
         <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-600 uppercase tracking-widest mt-1">{client}</span>
      </div>
      <div className={`px-3 py-1 border ${status === "DEPLOYED" ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" : "border-gray-500/30 text-gray-400"} text-[9px] font-[family-name:var(--font-jetbrains)] uppercase tracking-widest`}>
        {status}
      </div>
    </div>

    <div className="mb-10 text-left">
      <p className="text-gray-400 leading-relaxed text-sm font-light">
        {description}
      </p>
    </div>

    <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/5">
      {tech.map((t, i) => (
        <span key={i} className="text-[9px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest px-2 py-1 border border-white/5">
          {t}
        </span>
      ))}
    </div>

    {/* Background Glow */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/0 group-hover:bg-cyan-500/[0.03] blur-3xl transition-all duration-700 -z-10" />
  </div>
);

// Helper component for service cards
const ServiceCard = ({ title, desc, skills }) => (
  <div className="p-10 border border-white/5 bg-white/[0.01] hover:bg-cyan-500/[0.02] hover:border-cyan-500/20 transition-all duration-500 group text-left">
    <h4 className="text-2xl font-light text-white mb-4 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light">
      {desc}
    </p>
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
          <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-400 uppercase tracking-widest">{skill}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Portfolio({ onReset }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Entrance animation for the portfolio after transition
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    tl.fromTo(".hero-reveal-delayed", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" },
      "+=1.8" // Wait for all scramble sequences to finish
    );
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#000000] text-white selection:bg-cyan-500/30 overflow-x-hidden scroll-smooth">
      {/* Navigation - Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-black/40">
        <div className="flex items-center">
          <button 
            onClick={onReset}
            className="group flex items-center justify-center p-2 rounded-full border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300"
            title="Reset System"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-cyan-400 transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="font-[family-name:var(--font-jetbrains)] font-bold text-xl tracking-tighter text-cyan-400 ml-12 uppercase">
            H-NODE
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[13px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.3em] text-gray-400">
          <a href="#about" className="hover:text-cyan-400 transition-colors cursor-pointer">About</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors cursor-pointer">Projects</a>
          <a href="#services" className="hover:text-cyan-400 transition-colors cursor-pointer">Services</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors cursor-pointer">Contact</a>
        </div>

        <a href="#contact" className="px-8 py-3 border border-cyan-500/30 text-cyan-400 text-[13px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500 transition-all duration-300">
          Work With Me
        </a>
      </nav>

      {/* Main Container */}
      <main className="relative z-10">
        {/* Hero Section - Step 2 */}
        <section className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
          {/* 3D Cyber Core Background */}
          <CyberCore />
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="z-10 flex flex-col items-center">
            {/* Status Indicator */}
            <div className="hero-reveal-delayed opacity-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-[family-name:var(--font-jetbrains)] uppercase tracking-widest text-cyan-400/80">
                Muhammad Hurrera // Systems Architect
              </span>
            </div>

            {/* Headline with Segmented AI Scramble Effect */}
            <h1 className="font-[family-name:var(--font-jetbrains)] text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] max-w-5xl text-white uppercase">
              <ScrambleText text="I build" delay={0.4} duration={0.4} />{" "}
              <span className="text-cyan-400">
                <ScrambleText text="intelligent systems" delay={0.8} duration={0.6} />
              </span>{" "}
              <ScrambleText text="that bridge" delay={1.4} duration={0.4} />{" "}
              <span className="text-cyan-400">
                <ScrambleText text="hardware" delay={1.8} duration={0.4} />
              </span>{" "}
              <ScrambleText text="and" delay={2.2} duration={0.2} />{" "}
              <span className="text-cyan-400">
                <ScrambleText text="AI" delay={2.4} duration={0.4} />
              </span>
            </h1>

            {/* Divider */}
            <div className="hero-reveal-delayed opacity-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-10" />

            {/* Subtext */}
            <p className="hero-reveal-delayed opacity-0 max-w-2xl text-gray-400 font-[family-name:var(--font-inter)] leading-relaxed text-lg md:text-xl mb-12 font-bold">
              Engineering production-grade IoT pipelines, autonomous robotics, and edge AI deployments. 
              Transforming complex technical challenges into scalable commercial products.
            </p>

            {/* CTAs */}
            <div className="hero-reveal-delayed opacity-0 flex flex-col sm:flex-row gap-6">
              <a href="#projects" className="px-12 py-5 bg-cyan-500 text-black font-[family-name:var(--font-jetbrains)] text-[14px] uppercase tracking-[0.2em] font-bold hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                View My Work
              </a>
              <a href="#contact" className="px-12 py-5 border border-white/10 text-white font-[family-name:var(--font-jetbrains)] text-[14px] uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/30 transition-all duration-300 font-bold text-center">
                Work With Me
              </a>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 hero-reveal-delayed">
            <span className="text-[10px] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.4em] text-gray-500">Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse" />
          </div>
        </section>

        {/* About Section - Step 4 */}
        <section id="about" className="py-40 px-8 max-w-7xl mx-auto relative overflow-hidden">
          {/* Background Ambient Text */}
          <div className="absolute top-0 right-0 text-[15rem] font-bold text-white/[0.02] select-none pointer-events-none transform translate-x-1/4 -translate-y-1/4 uppercase">
            Architect
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            
            {/* Left Side: Bio/Identity */}
            <div className="text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.5em]">
                  [ Identity Protocol ]
                </h2>
              </div>
              
              <h3 className="text-5xl md:text-6xl font-light mb-10 leading-[1.1] tracking-tight">
                Not just code. <br/> 
                <span className="text-gray-500 italic">Engineered Systems.</span>
              </h3>
              
              <div className="space-y-6 text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                <p>
                  I specialize in building the <span className="text-white font-medium">nervous system</span> of modern technology. 
                  From custom PCB design to edge AI model deployment, I bridge the gap between 
                  physical hardware and intelligent software.
                </p>
                <p>
                  My work focuses on <span className="text-cyan-400 font-bold underline underline-offset-8 decoration-cyan-500/30">scalability and reliability.</span> 
                  I don't just solve coding problems; I architect solutions for complex industrial 
                  and commercial ecosystems that require 24/7 uptime.
                </p>
              </div>
              
              <div className="mt-12 p-6 border-l-2 border-cyan-500/50 bg-cyan-500/[0.02]">
                <p className="text-sm font-[family-name:var(--font-jetbrains)] text-gray-500 leading-relaxed italic">
                  "The difference between a developer and an architect is the ability to see the system as a single organism, from the silicon to the cloud."
                </p>
              </div>
            </div>

            {/* Right Side: Metrics/Proof (Bento Control Panel Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 lg:pt-0">
               <MetricCard label="IoT Deployments" value="10+" sub="Industrial Grade" />
               <MetricCard label="Daily Telemetry" value="500K+" sub="Data Points Processed" />
               <MetricCard label="PCB Architecture" value="15+" sub="Custom HW Designs" />
               <MetricCard label="System Reliability" value="99.9%" sub="Uptime Benchmark" />
               
               <div className="sm:col-span-2 p-6 border border-cyan-500/10 bg-cyan-500/[0.03] flex items-center justify-between group cursor-help">
                  <div>
                    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-cyan-400/60 uppercase tracking-[0.3em] mb-1">Current Status</p>
                    <p className="text-white font-[family-name:var(--font-jetbrains)] text-sm">System Architect @ H-NODE</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]" />
               </div>
            </div>

          </div>
        </section>

        {/* Projects Section - Step 5 */}
        <section id="projects" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.5em]">
                  [ Systems Archive ]
                </h2>
              </div>
              <h3 className="text-5xl md:text-6xl font-light tracking-tight uppercase">
                Deployed <br/> <span className="text-gray-500">Architecture</span>
              </h3>
            </div>
            <p className="max-w-xs text-gray-500 text-sm text-left leading-relaxed font-[family-name:var(--font-jetbrains)] uppercase tracking-widest">
              Selected works spanning industrial IoT, embedded firmware, and autonomous robotics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard 
              id="PROJ_001"
              title="PEMS Ecosystem"
              client="Bigfoot Ventures LLC // USA"
              tech={["ESP32", "SIM7000G", "LVGL v9", "RFID"]}
              description="A commercial dual-controller prepaid energy billing platform with zero inter-controller message collisions and cryptographic RFID authentication."
              status="DEPLOYED"
            />
            <ProjectCard 
              id="PROJ_002"
              title="Sovereign IoT Pipeline"
              client="Industrial Telemetry"
              tech={["Docker", "n8n", "Supabase", "Grafana"]}
              description="Self-hosted, vendor-independent industrial telemetry infrastructure with real-time anomaly alerting via Twilio and WhatsApp API."
              status="DEPLOYED"
            />
            <ProjectCard 
              id="PROJ_003"
              title="Bionic Prosthetic Hand"
              client="National Grant // MUET"
              tech={["Arduino", "ML", "EMG Sensors", "PID"]}
              description="Research-grade prosthetic utilizing EMG muscle signals and ML classification for five distinct gesture patterns in real-time."
              status="RESEARCH"
            />
            <ProjectCard 
              id="PROJ_004"
              title="Relay Timer Controller"
              client="Commercial Embedded"
              tech={["ESP32-S3", "LovyanGFX", "DS1302 RTC"]}
              description="Production-ready standalone scheduling device with high-voltage manual override and full-color LVGL v9 HMI interface."
              status="DEPLOYED"
            />
          </div>
        </section>

        {/* Services Section - Step 6 */}
        <section id="services" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 text-[12rem] font-bold text-white/[0.01] select-none pointer-events-none transform -translate-x-1/4 -translate-y-1/4 uppercase">
              Capabilities
           </div>

           <div className="text-left mb-20 relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.5em]">
                  [ System Capabilities ]
                </h2>
              </div>
              <h3 className="text-5xl md:text-6xl font-light tracking-tight uppercase">
                Technical <br/> <span className="text-gray-500">Infrastructure</span>
              </h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <ServiceCard 
                title="Embedded Firmware"
                desc="Bare-metal and RTOS-based firmware for safety-critical and commercial applications, optimized for power and performance."
                skills={["ESP32 / STM32", "FreeRTOS Architecture", "ISR & Driver Design", "OTA Update Systems"]}
              />
              <ServiceCard 
                title="Hardware & PCB Design"
                desc="End-to-end hardware development from schematic capture to DFM-ready 2-layer PCB layouts and bring-up."
                skills={["KiCAD / EasyEDA", "Schematic Capture", "2-Layer PCB Layout", "DFM Review Process"]}
              />
              <ServiceCard 
                title="IoT & Cloud Architecture"
                desc="Sovereign telemetry pipelines and industrial communication protocol integration for vendor-independent data flow."
                skills={["MQTT / Modbus / LoRa", "n8n Automation", "Supabase (PostgreSQL)", "Grafana Analytics"]}
              />
              <ServiceCard 
                title="HMI & Interaction"
                desc="Modern, high-performance touch interfaces for embedded systems and industrial displays using the latest UI frameworks."
                skills={["LVGL v8/v9", "LovyanGFX", "TFT_eSPI Driver Porting", "HMI State Machines"]}
              />
           </div>
        </section>

        {/* Contact Section - Step 7 */}
        <section id="contact" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
           <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-[1px] bg-cyan-500" />
                <h2 className="text-cyan-400 font-[family-name:var(--font-jetbrains)] text-[11px] uppercase tracking-[0.5em]">
                  [ System Uplink ]
                </h2>
                <div className="w-12 h-[1px] bg-cyan-500" />
              </div>

              <h3 className="text-5xl md:text-7xl font-light mb-16 tracking-tight uppercase max-w-4xl leading-tight">
                Ready to <span className="text-cyan-400 italic">architect</span> <br/> your next system?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 w-full max-w-5xl">
                 <div className="text-left md:text-center">
                    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest mb-4">Direct Channel</p>
                    <a href="mailto:habibhurrera@gmail.com" className="text-xl md:text-2xl font-light hover:text-cyan-400 transition-colors tracking-tight">habibhurrera@gmail.com</a>
                 </div>
                 <div className="text-left md:text-center">
                    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest mb-4">Professional Grid</p>
                    <a href="https://linkedin.com/in/muhammad-hurrera-671400250" target="_blank" className="text-xl md:text-2xl font-light hover:text-cyan-400 transition-colors tracking-tight">LinkedIn Profile</a>
                 </div>
                 <div className="text-left md:text-center">
                    <p className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase tracking-widest mb-4">Code Archive</p>
                    <a href="https://github.com/habibhurrera" target="_blank" className="text-xl md:text-2xl font-light hover:text-cyan-400 transition-colors tracking-tight">GitHub Source</a>
                 </div>
              </div>

              <a href="mailto:habibhurrera@gmail.com" className="px-16 py-6 bg-cyan-500 text-black font-[family-name:var(--font-jetbrains)] text-[14px] uppercase tracking-[0.3em] font-bold hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                Establish Partnership
              </a>
           </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 border-t border-white/5 bg-black/50">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                 <div className="text-cyan-400 font-bold tracking-tighter uppercase font-[family-name:var(--font-jetbrains)]">H-NODE // ARCHITECT</div>
                 <div className="w-[1px] h-4 bg-white/10 hidden md:block" />
                 <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-600 uppercase tracking-widest">© 2026 MUHAMMAD HURRERA</div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-400 uppercase tracking-widest">System Online</span>
                 </div>
                 <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                    Back to Top ↑
                 </button>
              </div>
           </div>
        </footer>
      </main>

      {/* Background Static Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
