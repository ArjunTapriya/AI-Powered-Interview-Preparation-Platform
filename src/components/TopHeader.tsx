import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { Zap, Moon, Sun, Bell, Settings, Sparkles } from "lucide-react";

export const TopHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, streak, themeAccent, setThemeAccent, themeMode, setThemeMode } = useApp();

  const hiddenRoutes = ["/", "/auth", "/onboarding"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const getTitle = () => {
    if (location.pathname.startsWith("/dashboard")) return "Dashboard ✨";
    if (location.pathname.startsWith("/roadmap")) return "Roadmap Planner";
    if (location.pathname.startsWith("/interview-practice")) return "Mock Interviews";
    if (location.pathname.startsWith("/resume")) return "Resume Intelligence";
    if (location.pathname.startsWith("/admin")) return "Admin Panel";
    if (location.pathname.startsWith("/series")) return "Question Series";
    if (location.pathname.startsWith("/ai-feedback")) return "AI Feedback";
    if (location.pathname.startsWith("/notes")) return "Notes and Resources";
    if (location.pathname.startsWith("/evaluation")) return "Evaluation History";
    return "Dashboard";
  };

  return (
    <header className="flex items-start justify-between px-8 py-6 w-full">
      <div className="flex flex-col">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-1 flex items-center gap-2">
          {getTitle()}
          {location.pathname.startsWith("/notes") && (
            <Sparkles className="text-[var(--accent-purple)] w-6 h-6 animate-pulse" />
          )}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--accent-orange)] text-[var(--accent-orange)] font-bold text-xs uppercase tracking-wider bg-[rgba(249,115,22,0.05)] cursor-default shadow-[0_0_10px_rgba(249,115,22,0.15)]">
          <Zap size={14} className="fill-current" />
          {streak} DAY STREAK
        </div>

        {/* Subscription Pill */}
        <button
          onClick={() => navigate("/pricing")}
          className="px-4 py-1.5 rounded-full border border-[#8B5CF6]/40 text-[#8B5CF6] font-bold text-xs uppercase tracking-wider bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/10 transition-colors"
        >
          {user?.subscriptionTier || "FREE"}
        </button>

        {/* Theme Dropdown & Light Mode */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--surface-border-new)] bg-[rgba(255,255,255,0.02)] transition-colors">
          <button 
            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
            className="text-[var(--text-secondary-new)] hover:text-[var(--accent-primary)] transition-colors"
            title="Toggle Light/Dark Mode"
          >
            {themeMode === "light" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <select
            value={themeAccent}
            onChange={(e) => setThemeAccent(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-[var(--text-secondary-new)] outline-none cursor-pointer appearance-none"
          >
            <option value="orange" className="bg-surface-solid">Theme</option>
            <option value="orange" className="bg-surface-solid">Orange (Vibrant)</option>
            <option value="coral" className="bg-surface-solid">Coral (TakeUForward)</option>
            <option value="amber" className="bg-surface-solid">Amber (Golden)</option>
            <option value="rust" className="bg-surface-solid">Rust (Deep)</option>
            <option value="sunset" className="bg-surface-solid">Sunset (Red-Orange)</option>
          </select>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 ml-2 border-l border-[var(--surface-border-new)] pl-6">
          <button className="text-[var(--text-secondary-new)] hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent-orange)] rounded-full"></span>
          </button>
          <button className="text-[var(--text-secondary-new)] hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
