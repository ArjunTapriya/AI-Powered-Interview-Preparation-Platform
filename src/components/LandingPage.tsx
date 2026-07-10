import React, { useRef, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import {
  Sparkles,
  Volume2,
  Activity,
  Flame,
  Play,
  ArrowRight,
  Brain,
  Code2,
  Mic2,
  Cpu,
  ChevronRight,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Cursor-Reactive Feature Card
   ─────────────────────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  floatClass?: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon, title, description, accentColor, floatClass = "float-gentle", delay = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
    // Subtle tilt
    const tx = (e.clientX - rect.left) / rect.width - 0.5;
    const ty = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-ty * 10}deg) rotateY(${tx * 10}deg) translateY(-6px) scale(1.02)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mouse-x", "50%");
    el.style.setProperty("--mouse-y", "50%");
    el.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`cursor-glow-card shimmer-card glass-ultra rounded-2xl p-6 space-y-4 text-left tilt-card transition-all duration-300 ${floatClass} ${delay}`}
      style={{ "--accent-rgb": accentColor } as React.CSSProperties}
    >
      {/* Icon box with floating effect */}
      <div
        className="feature-icon p-3 rounded-xl border w-fit"
        style={{
          background: `rgba(${accentColor}, 0.1)`,
          borderColor: `rgba(${accentColor}, 0.25)`,
          color: `rgb(${accentColor})`,
          boxShadow: `0 4px 16px rgba(${accentColor}, 0.2)`,
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      {/* Hover arrow reveal */}
      <div className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: `rgb(${accentColor})` }}>
        Explore <ChevronRight size={12} />
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   Animated Stat Badge
   ─────────────────────────────────────────────────────────── */
const StatBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-6 py-3 glass-ultra rounded-xl">
    <span className="text-2xl font-black text-white tracking-tight">{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{label}</span>
  </div>
);

/* ────────────────────────────────────────────────────────────
   Floating Particle
   ─────────────────────────────────────────────────────────── */
const Particle: React.FC<{
  x: number; y: number; size: number; color: string; delay: number; duration: number;
}> = ({ x, y, size, color, delay, duration }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: color,
      animation: `float-slow ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.6,
      filter: `blur(${size / 3}px)`,
    }}
  />
);

/* ────────────────────────────────────────────────────────────
   Main Landing Page
   ─────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Global cursor glow on page bg
  const onPageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const particles = [
    { x: 8,  y: 15, size: 6,  color: "rgba(249,115,22,0.7)",   delay: 0,    duration: 6 },
    { x: 92, y: 10, size: 8,  color: "rgba(139,92,246,0.6)",    delay: -2,   duration: 8 },
    { x: 15, y: 70, size: 5,  color: "rgba(6,182,212,0.7)",     delay: -3.5, duration: 5 },
    { x: 85, y: 75, size: 7,  color: "rgba(236,72,153,0.5)",    delay: -1,   duration: 7 },
    { x: 45, y: 5,  size: 4,  color: "rgba(249,115,22,0.5)",    delay: -4,   duration: 9 },
    { x: 60, y: 90, size: 6,  color: "rgba(139,92,246,0.5)",    delay: -2.5, duration: 6 },
    { x: 25, y: 40, size: 3,  color: "rgba(255,255,255,0.15)",  delay: -1.5, duration: 10},
    { x: 75, y: 35, size: 4,  color: "rgba(6,182,212,0.4)",     delay: -5,   duration: 7 },
  ];

  const features: FeatureCardProps[] = [
    {
      icon: <Volume2 size={22} />,
      title: "Talk While Coding",
      description:
        "Toggle browser microphone hooks to capture details. Flags filler word frequencies and matches transcript sentences with lines of code.",
      accentColor: "249, 115, 22",
      floatClass: "float-gentle",
      delay: "float-delay-1",
    },
    {
      icon: <Activity size={22} />,
      title: "Interactive Canvas Whiteboard",
      description:
        "Draw network topologies, database servers, and message queue lines right next to instructions during architecture sessions.",
      accentColor: "139, 92, 246",
      floatClass: "float-medium",
      delay: "float-delay-2",
    },
    {
      icon: <Flame size={22} />,
      title: "Cognitive Stress Simulator",
      description:
        "Configurable interviewer personas trigger live timing alerts and requirement updates mid-session to build psychological resilience.",
      accentColor: "236, 72, 153",
      floatClass: "float-gentle",
      delay: "float-delay-3",
    },
  ];

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between py-12 px-6 overflow-hidden gradient-mesh-bg dot-grid-bg"
      onMouseMove={onPageMouseMove}
    >
      {/* ── Global cursor radial glow on bg ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, rgba(249,115,22,0.05) 0%, transparent 60%)`,
        }}
      />

      {/* ── Ambient Orbs ── */}
      <div className="ambient-orb ambient-orb-lg orb-orange float-gentle"
        style={{ top: "-80px", left: "-100px", opacity: 0.6, animationDelay: "0s" }} />
      <div className="ambient-orb ambient-orb-lg orb-purple float-medium"
        style={{ bottom: "-120px", right: "-80px", opacity: 0.5, animationDelay: "-3s" }} />
      <div className="ambient-orb ambient-orb-md orb-cyan float-slow"
        style={{ top: "40%", right: "10%", opacity: 0.4, animationDelay: "-1.5s" }} />
      <div className="ambient-orb ambient-orb-sm orb-pink float-gentle"
        style={{ top: "20%", left: "5%", opacity: 0.5, animationDelay: "-2s" }} />

      {/* ── Floating Particles ── */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Scan line overlay on entire page ── */}
      <div className="absolute inset-0 pointer-events-none scan-line-overlay z-10" />

      {/* ── Hero Content ── */}
      <div className="relative z-20 max-w-5xl mx-auto text-center space-y-8 my-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.25)] rounded-full text-[#F97316] text-xs font-bold tracking-widest font-mono uppercase badge-breathe">
          <Sparkles size={12} className="animate-pulse" />
          UX-Led Mock Simulation Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
          <span className="line-reveal line-reveal-delay-1 block">Practice Speaking.</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#8B5CF6] to-[#06b6d4] line-reveal line-reveal-delay-2 block">
            Master the Code Loop.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-gray-400 text-base md:text-lg leading-relaxed fade-slide-up">
          Stop grinding silent coding problems. Our platform combines high-fidelity split editors,
          system design whiteboard canvases, and real-time verbal transcript diagnostics to prepare
          you for actual FAANG interviews.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => navigate("/auth")}
            className="magnetic-btn relative overflow-hidden group px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white"
            style={{
              background: "linear-gradient(135deg, #F97316, #8B5CF6)",
              boxShadow: "0 0 30px rgba(249,115,22,0.35), 0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Preparing <Play size={14} className="fill-current" />
            </span>
            {/* Shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)" }} />
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="magnetic-btn px-8 py-4 rounded-xl font-bold text-sm text-white border border-white/15 hover:border-[rgba(249,115,22,0.5)] transition-all duration-300"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
          >
            Sign In
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 pt-6 stagger-children">
          {[
            { value: "10K+", label: "Practice Sessions" },
            { value: "4 AI", label: "Personas" },
            { value: "3x", label: "Faster Prep" },
            { value: "FAANG", label: "Ready" },
          ].map((s, i) => (
            <StatBadge key={i} {...s} />
          ))}
        </div>
      </div>

      {/* ── Platform icons row ── */}
      <div className="relative z-20 max-w-3xl mx-auto flex justify-center items-center gap-8 py-8">
        {[
          { icon: <Code2 size={16} />, label: "Code Editor" },
          { icon: <Mic2 size={16} />, label: "Voice Analysis" },
          { icon: <Brain size={16} />, label: "AI Mentor" },
          { icon: <Cpu size={16} />, label: "System Design" },
        ].map(({ icon, label }, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors cursor-default group">
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] group-hover:border-[rgba(249,115,22,0.3)] group-hover:bg-[rgba(249,115,22,0.04)] transition-all duration-300 group-hover:shadow-[0_4px_20px_rgba(249,115,22,0.15)]">
              {icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Feature Cards ── */}
      <div className="relative z-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 stagger-children">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="relative z-20 text-center pt-12">
        <button
          onClick={() => navigate("/auth")}
          className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#F97316] transition-colors duration-300"
        >
          See all features
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
