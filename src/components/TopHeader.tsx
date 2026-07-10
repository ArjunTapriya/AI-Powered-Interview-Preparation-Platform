import React, { useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { Zap, Moon, Sun, Bell, Settings, Sparkles, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

/* ── Cursor-reactive pill ─────────────────────────────────── */
const GlowPill: React.FC<{
  children: React.ReactNode;
  color?: string;
  className?: string;
  onClick?: () => void;
}> = ({ children, color = "249, 115, 22", className = "", onClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const Tag: any = onClick ? "button" : "div";

  return (
    <Tag
      ref={ref as any}
      onMouseMove={onMouseMove}
      onClick={onClick}
      className={`cursor-glow-card ${className}`}
      style={{ "--accent-rgb": color, "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
};

export const TopHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, streak, themeAccent, setThemeAccent, themeMode, setThemeMode, activeChallenge } =
    useApp() as any;

  const hiddenRoutes = ["/", "/auth", "/onboarding"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const { data: seriesData } = useQuery({
    queryKey: ["questions", "sets"],
    queryFn: async () => {
      const res = await apiFetch("/questions/sets");
      const data = await res.json();
      if (res.ok && data.success) return data.data.sets;
      return null;
    },
  });

  const getSeriesId = () => {
    const isWorkspace = location.pathname.startsWith("/workspace");
    if (!isWorkspace || !seriesData || !activeChallenge) return null;
    const challengeId = activeChallenge.id;
    if (seriesData.set1?.some((q: any) => q.id === challengeId)) return "1";
    if (seriesData.set2?.some((q: any) => q.id === challengeId)) return "2";
    if (seriesData.set3?.some((q: any) => q.id === challengeId)) return "3";
    return null;
  };

  const seriesId = getSeriesId();

  const getTitle = () => {
    if (location.pathname.startsWith("/dashboard"))         return "Dashboard";
    if (location.pathname.startsWith("/roadmap"))           return "Roadmap Planner";
    if (location.pathname.startsWith("/interview-practice")) return "Mock Interviews";
    if (location.pathname.startsWith("/resume"))             return "Resume Intelligence";
    if (location.pathname.startsWith("/admin"))              return "Admin Panel";
    if (location.pathname.startsWith("/series"))             return "Question Series";
    if (location.pathname.startsWith("/ai-feedback"))        return "AI Feedback";
    if (location.pathname.startsWith("/notes"))              return "Notes and Resources";
    if (location.pathname.startsWith("/evaluation"))         return "Evaluation History";
    return "Dashboard";
  };

  const getEmoji = () => {
    if (location.pathname.startsWith("/dashboard"))          return "✨";
    if (location.pathname.startsWith("/notes"))              return "📚";
    if (location.pathname.startsWith("/interview-practice")) return "🎙️";
    if (location.pathname.startsWith("/resume"))             return "📄";
    if (location.pathname.startsWith("/ai-feedback"))        return "🤖";
    if (location.pathname.startsWith("/roadmap"))            return "🗺️";
    return "";
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 w-full"
      style={{
        background: "rgba(5,5,7,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.02), 0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* ── Left: Title ── */}
      <div className="flex flex-col">
        {seriesId ? (
          <button
            onClick={() => navigate(`/series/${seriesId}`)}
            className="group flex items-center gap-1.5 text-[24px] font-bold text-white hover:text-[var(--accent-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-[var(--accent-primary)] group-hover:-translate-x-0.5 transition-all duration-200" />
            Question Series
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-white tracking-tight">
              {getTitle()}
            </h1>
            {getEmoji() && (
              <span className="float-gentle text-xl">{getEmoji()}</span>
            )}
            {location.pathname.startsWith("/notes") && (
              <Sparkles className="text-[var(--accent-purple)] w-5 h-5 animate-pulse" />
            )}
          </div>
        )}
        {/* Animated underline */}
        <div
          className="h-[2px] mt-1 rounded-full transition-all duration-500"
          style={{
            width: "100%",
            background: "linear-gradient(90deg, rgba(249,115,22,0.7), rgba(139,92,246,0.5), transparent)",
            animation: "gradient-shift 4s ease infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center gap-3">

        {/* Streak Pill */}
        <GlowPill
          color="249, 115, 22"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300"
          style={{
            borderColor: "rgba(249,115,22,0.35)",
            color: "#F97316",
            background: "rgba(249,115,22,0.06)",
            boxShadow: "0 0 12px rgba(249,115,22,0.15)",
          } as any}
        >
          <Zap size={13} className="fill-current" />
          {streak} Day Streak
        </GlowPill>

        {/* Subscription Pill */}
        <GlowPill
          color="139, 92, 246"
          onClick={() => navigate("/pricing")}
          className="px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
          style={{
            borderColor: "rgba(139,92,246,0.35)",
            color: "#8B5CF6",
            background: "rgba(139,92,246,0.06)",
          } as any}
        >
          {user?.subscriptionTier || "FREE"}
        </GlowPill>

        {/* Theme Controls */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-glow-card"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            "--accent-rgb": "249, 115, 22",
            "--mouse-x": "50%",
            "--mouse-y": "50%",
          } as React.CSSProperties}
        >
          <button
            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
            className="text-gray-500 hover:text-[var(--accent-primary)] transition-colors hover:scale-110 transition-transform duration-200"
            title="Toggle Light/Dark Mode"
          >
            {themeMode === "light" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <div className="w-px h-3 bg-white/10" />
          <select
            value={themeAccent}
            onChange={(e) => setThemeAccent(e.target.value as any)}
            className="bg-transparent text-[11px] font-semibold text-gray-500 outline-none cursor-pointer appearance-none hover:text-white transition-colors"
          >
            <option value="orange" className="bg-[#0A0A0A]">Orange</option>
            <option value="coral"  className="bg-[#0A0A0A]">Coral</option>
            <option value="amber"  className="bg-[#0A0A0A]">Amber</option>
            <option value="rust"   className="bg-[#0A0A0A]">Rust</option>
            <option value="sunset" className="bg-[#0A0A0A]">Sunset</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/[0.06]" />

        {/* Icon buttons */}
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group"
          title="Notifications"
        >
          <Bell size={16} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F97316] rounded-full shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group"
          title="Settings"
        >
          <Settings
            size={16}
            className="group-hover:rotate-45 group-hover:scale-110 transition-all duration-300"
          />
        </button>
      </div>
    </header>
  );
};
