import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { Zap, BookOpen, LayoutDashboard, LogOut, Mic, FileText, BrainCircuit } from "lucide-react";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    streak,
    activePersona,
    setActivePersona,
    themeAccent,
    setThemeAccent,
    themeMode,
    setThemeMode,
    resetProgress,
    user,
  } = useApp();

  // Hide navbar on public pages
  const hiddenRoutes = ["/", "/auth", "/onboarding"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    resetProgress();
    navigate("/");
  };

  return (
    <header className="border-b border-surface-border bg-[#0D0D11]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-md">
      {/* Brand logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent-primary)] to-amber-500 flex items-center justify-center text-white shadow-[0_4px_12px_var(--accent-glow)]">
          <BrainCircuit size={18} />
        </div>
        <span className="font-sans font-bold text-white tracking-wider text-base">
          INTERVIEW <span className="text-[var(--accent-primary)]">PREPARATION</span>
        </span>
      </div>

      {/* Center Nav routes */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-400">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${isActive("/dashboard") ? "text-[var(--accent-primary)] font-semibold" : ""}`}
        >
          <LayoutDashboard size={16} /> Dashboard
        </button>
        <button
          onClick={() => navigate("/roadmap")}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${isActive("/roadmap") ? "text-[var(--accent-primary)] font-semibold" : ""}`}
        >
          <BookOpen size={16} /> Make the Roadmap
        </button>
        <button
          onClick={() => navigate("/interview-practice")}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${isActive("/interview-practice") ? "text-[var(--accent-primary)] font-semibold" : ""}`}
        >
          <Mic size={16} /> Interview Test
        </button>
        <button
          onClick={() => navigate("/resume")}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${isActive("/resume") ? "text-[var(--accent-primary)] font-semibold" : ""}`}
        >
          <FileText size={16} /> Resume Intelligence
        </button>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className={`flex items-center gap-1.5 transition-colors hover:text-white ${location.pathname.startsWith("/admin") ? "text-[var(--accent-primary)] font-semibold" : ""}`}
        >
          <LayoutDashboard size={16} /> Admin
        </button>
      </nav>

      {/* Right widgets config */}
      <div className="flex items-center gap-4">
        {/* Streak indicator */}
        <div className="flex items-center gap-1 bg-[var(--accent-glow)] px-3 py-1 rounded-full border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold font-mono">
          <Zap size={14} className="fill-[var(--accent-primary)]" />
          <span>{streak} DAYS</span>
        </div>

        {/* Plan badge */}
        <button
          onClick={() => navigate("/pricing")}
          className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 px-2 py-1 rounded-full hover:bg-[var(--accent-glow)] transition-colors"
        >
          {user?.subscriptionTier || "FREE"}
        </button>

        {/* Theme Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-mono hidden sm:inline">Theme:</span>
          <select
            value={themeAccent}
            onChange={(e) => setThemeAccent(e.target.value as any)}
            className="bg-[#16161A] border border-surface-border text-gray-200 rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--accent-primary)] cursor-pointer font-mono font-medium"
          >
            <option value="cyan" className="bg-[#16161A]">Orange (Vibrant)</option>
            <option value="blue" className="bg-[#16161A]">Coral (TakeUForward)</option>
            <option value="purple" className="bg-[#16161A]">Amber (Golden)</option>
            <option value="emerald" className="bg-[#16161A]">Rust (Deep)</option>
            <option value="rose" className="bg-[#16161A]">Sunset (Red-Orange)</option>
          </select>
        </div>

        {/* Mode Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-mono hidden sm:inline">Mode:</span>
          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as any)}
            className="bg-[#16161A] border border-surface-border text-gray-200 rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--accent-primary)] cursor-pointer font-mono font-medium"
          >
            <option value="dark" className="bg-[#16161A]">Dark</option>
            <option value="light" className="bg-[#16161A]">Light</option>
          </select>
        </div>

        {/* Persona Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-mono hidden sm:inline">Interviewer:</span>
          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as any)}
            className="bg-[#16161A] border border-surface-border text-gray-200 rounded-lg py-1.5 px-2.5 outline-none focus:border-[var(--accent-primary)] cursor-pointer font-mono font-medium"
          >
            <option value="Coach" className="bg-[#16161A]">Coach (Supportive)</option>
            <option value="Nitpicker" className="bg-[#16161A]">Nitpicker (Detail)</option>
            <option value="Interrupter" className="bg-[#16161A]">Interrupter (Pivots)</option>
            <option value="Silent" className="bg-[#16161A]">Silent (Evaluator)</option>
          </select>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

