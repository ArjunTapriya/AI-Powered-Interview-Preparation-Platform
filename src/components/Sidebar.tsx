import React, { useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext";
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  FileText,
  Users,
  ClipboardList,
  Target,
  BrainCircuit,
  User,
  Zap,
} from "lucide-react";

/* ── Cursor-reactive nav item ─────────────────────────────── */
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.setProperty("--mouse-x", "50%");
      ref.current.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`
        group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold w-full text-left
        transition-all duration-300 cursor-glow-card overflow-hidden
        ${active
          ? "sidebar-active-glow text-[var(--accent-primary)] bg-[rgba(249,115,22,0.06)]"
          : "text-[var(--text-secondary-new)] hover:text-white hover:bg-white/[0.03]"
        }
      `}
      style={{ "--accent-rgb": "249, 115, 22" } as React.CSSProperties}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[var(--accent-primary)] rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.6),2px_0_16px_rgba(249,115,22,0.3)]" />
      )}

      {/* Icon with float effect on hover */}
      <span
        className={`shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${
          active ? "text-[var(--accent-primary)] drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" : ""
        }`}
      >
        {icon}
      </span>

      {/* Label */}
      <span className="flex-1">{label}</span>

      {/* Subtle right arrow on hover */}
      {!active && (
        <span className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-primary)]">
          →
        </span>
      )}
    </button>
  );
};

/* ── Main Sidebar ─────────────────────────────────────────── */
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePersona, setActivePersona } = useApp();

  const hiddenRoutes = ["/", "/auth", "/onboarding"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { path: "/dashboard",          icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { path: "/roadmap",            icon: <BookOpen size={17} />,        label: "Roadmap" },
    { path: "/interview-practice", icon: <Mic size={17} />,            label: "Mock Interviews" },
    { path: "/ai-feedback",        icon: <Target size={17} />,         label: "AI Feedback" },
    { path: "/resume",             icon: <FileText size={17} />,        label: "Resume Intelligence" },
    { path: "/notes",              icon: <ClipboardList size={17} />,  label: "Notes & Resources" },
  ];

  return (
    <aside className="w-[260px] h-screen shrink-0 flex flex-col pt-6 pb-4 px-3 sticky top-0 z-40 relative overflow-hidden"
      style={{
        background: "rgba(8, 8, 10, 0.95)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Ambient orb inside sidebar */}
      <div className="absolute -top-20 -left-10 w-40 h-40 rounded-full pointer-events-none float-slow"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div className="absolute bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none float-gentle"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          filter: "blur(25px)",
          animationDelay: "-2s",
        }}
      />

      {/* ── Brand Logo ── */}
      <button
        className="group flex items-center gap-3 cursor-pointer select-none mb-8 pl-2 w-full text-left"
        onClick={() => navigate("/dashboard")}
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#F59E0B] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(249,115,22,0.4)] transition-all duration-300 group-hover:shadow-[0_6px_24px_rgba(249,115,22,0.6)] group-hover:scale-105">
            <BrainCircuit size={18} />
          </div>
          {/* Floating ring around logo */}
          <div className="absolute inset-0 rounded-xl border border-[rgba(249,115,22,0.3)] scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-white tracking-widest text-[12px] leading-tight">
            INTERVIEW
          </span>
          <span className="font-bold text-gray-500 tracking-widest text-[10px] leading-tight">
            PREPARATION AI
          </span>
        </div>
      </button>

      {/* ── Section label ── */}
      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-600 px-4 mb-2">
        Navigation
      </p>

      {/* ── Nav Items ── */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ path, icon, label }) => (
          <NavItem
            key={path}
            icon={icon}
            label={label}
            active={isActive(path)}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="premium-divider my-4" />

      {/* ── Bottom Section ── */}
      <div className="flex flex-col gap-3">
        {/* Motivation banner */}
        <div className="relative overflow-hidden rounded-xl p-4 glass-ultra">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.05), rgba(139,92,246,0.05))",
            }}
          />
          {/* Floating emoji */}
          <div className="float-gentle text-2xl mb-1 relative z-10">🚀</div>
          <h5 className="text-white text-xs font-bold mb-0.5 relative z-10">Keep going! 💪</h5>
          <p className="text-gray-500 text-[10px] leading-tight relative z-10">
            Consistency is your superpower.
          </p>
        </div>

        {/* Persona Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-[var(--accent-primary)] tracking-[0.18em] px-1">
            Interviewer Persona
          </span>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-ultra cursor-pointer hover:border-[rgba(249,115,22,0.3)] transition-all duration-300 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[rgba(249,115,22,0.2)] to-[rgba(139,92,246,0.2)] flex items-center justify-center border border-white/10 shrink-0">
              <User size={13} className="text-gray-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <select
                value={activePersona}
                onChange={(e) => setActivePersona(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-white w-full outline-none cursor-pointer appearance-none"
              >
                <option value="Coach" className="bg-[#0A0A0A]">Coach (Supportive)</option>
                <option value="Nitpicker" className="bg-[#0A0A0A]">Nitpicker (Detail)</option>
                <option value="Interrupter" className="bg-[#0A0A0A]">Interrupter (Pivots)</option>
                <option value="Silent" className="bg-[#0A0A0A]">Silent (Evaluator)</option>
              </select>
              <p className="text-[9px] text-gray-600">Bot Behavior Mode</p>
            </div>
            <Users size={12} className="text-gray-600 group-hover:text-[var(--accent-primary)] transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
};
