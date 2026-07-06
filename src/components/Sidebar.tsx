import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext";
import { LayoutDashboard, BookOpen, Mic, FileText, Settings, User, Users, ClipboardList, Target, Award } from "lucide-react";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePersona, setActivePersona } = useApp();

  const hiddenRoutes = ["/", "/auth", "/onboarding"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="w-[280px] h-screen shrink-0 new-sidebar flex flex-col pt-6 pb-4 px-4 sticky top-0 z-40">
      {/* Brand Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none mb-10 pl-2"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-orange)] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-extrabold text-white tracking-widest text-[13px] leading-tight">
            INTERVIEW
          </span>
          <span className="font-sans font-extrabold text-[var(--text-secondary-new)] tracking-widest text-[11px] leading-tight">
            PREPARATION
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/dashboard") ? "active" : ""}`}
        >
          <LayoutDashboard size={18} className={isActive("/dashboard") ? "text-[var(--accent-orange)]" : ""} /> Command Center
        </button>
        <button
          onClick={() => navigate("/roadmap")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/roadmap") ? "active" : ""}`}
        >
          <BookOpen size={18} className={isActive("/roadmap") ? "text-[var(--accent-orange)]" : ""} /> Roadmap
        </button>
        <button
          onClick={() => navigate("/interview-practice")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/interview-practice") ? "active" : ""}`}
        >
          <Mic size={18} className={isActive("/interview-practice") ? "text-[var(--accent-orange)]" : ""} /> Mock Interviews
        </button>
        <button
          onClick={() => navigate("/ai-feedback")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/ai-feedback") ? "active" : ""}`}
        >
          <Target size={18} className={isActive("/ai-feedback") ? "text-[var(--accent-orange)]" : ""} /> AI Feedback
        </button>
        <button
          onClick={() => navigate("/resume")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/resume") ? "active" : ""}`}
        >
          <FileText size={18} className={isActive("/resume") ? "text-[var(--accent-orange)]" : ""} /> Resume Intelligence
        </button>
        <button
          onClick={() => navigate("/notes")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold new-sidebar-item ${isActive("/notes") ? "active" : ""}`}
        >
          <ClipboardList size={18} className={isActive("/notes") ? "text-[var(--accent-orange)]" : ""} /> Notes & Resources
        </button>

      </nav>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col gap-4">
        {/* Keep going banner */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] p-4 rounded-xl flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--accent-purple)]/10 rounded-bl-full blur-xl" />
          <div className="p-2 bg-[var(--surface-hover-new)] rounded-lg text-xl z-10 shrink-0 border border-white/5">
            🚀
          </div>
          <div className="z-10">
            <h5 className="text-white text-sm font-bold mb-0.5">Keep going! 💪</h5>
            <p className="text-[var(--text-secondary-new)] text-xs leading-tight">Consistency is your superpower.</p>
          </div>
        </div>

        {/* Persona Dropdown matching bottom left of image */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer relative group">
          <div className="w-8 h-8 rounded-full bg-[var(--surface-hover-new)] flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <select
              value={activePersona}
              onChange={(e) => setActivePersona(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-white w-full outline-none cursor-pointer appearance-none"
            >
              <option value="Coach" className="bg-[#1A1C29]">Coach (Supportive)</option>
              <option value="Nitpicker" className="bg-[#1A1C29]">Nitpicker (Detail)</option>
              <option value="Interrupter" className="bg-[#1A1C29]">Interrupter (Pivots)</option>
              <option value="Silent" className="bg-[#1A1C29]">Silent (Evaluator)</option>
            </select>
            <p className="text-[10px] text-[var(--text-secondary-new)]">Interviewer</p>
          </div>
          <Users size={14} className="text-[var(--text-secondary-new)]" />
        </div>
      </div>
    </aside>
  );
};
