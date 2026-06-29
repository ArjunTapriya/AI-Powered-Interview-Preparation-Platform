import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Database, Activity, LayoutDashboard, Settings } from "lucide-react";
import { QuestionGenerationJobs } from "./QuestionGenerationJobs";
import { PlatformStats } from "./PlatformStats";

export const AdminLayout: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0F] border-r border-surface-border flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/admin/generation" className={navLinkClass}>
              <Database size={18} />
              AI Generation
            </NavLink>
            <NavLink to="/admin/stats" className={navLinkClass}>
              <Activity size={18} />
              Platform Stats
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClass}>
              <Settings size={18} />
              Settings
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PlatformStats />} />
          <Route path="generation" element={<QuestionGenerationJobs />} />
          <Route path="stats" element={<PlatformStats />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};
