import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { apiFetch } from "../../../utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

export const QuestionSeriesList: React.FC = () => {
  const navigate = useNavigate();
  const { user, history } = useApp() as any;

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ["questions", "sets"],
    queryFn: async () => {
      const res = await apiFetch("/questions/sets");
      const data = await res.json();
      if (res.ok && data.success) return data.data.sets;
      return null;
    },
  });

  if (isLoading || !seriesData) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm bg-[#1e1e1e] rounded-lg border border-gray-800">
        Loading question series...
      </div>
    );
  }

  const seriesList = [
    {
      id: "1",
      title: "Series 1",
      level: "Beginner",
      desc: "Fundamentals & Array Pointers",
      data: seriesData?.set1 || [],
      colorClass: "emerald",
    },
    {
      id: "2",
      title: "Series 2",
      level: "Moderate",
      desc: "Intermediate Structures & Design",
      data: seriesData?.set2 || [],
      colorClass: "amber",
    },
    {
      id: "3",
      title: "Series 3",
      level: "Pro",
      desc: "Advanced Algorithms & Architecture",
      data: seriesData?.set3 || [],
      colorClass: "rose",
    },
  ];

  return (
    <div className="flex flex-col w-full justify-center gap-6 h-full">
      {seriesList.map((series) => {
        const total = series.data.length;
        const completed = total === 0 ? 0 : series.data.filter((q: any) =>
          (history || []).some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)
        ).length;
        const progressPercent = total === 0 ? 0 : (completed / total) * 100;

        // Dynamic color mappings based on the series color class
        const bgColors = {
          emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        };
        const barColors = {
          emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
          amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
          rose: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]",
        };

        const badgeClass = bgColors[series.colorClass as keyof typeof bgColors];
        const barClass = barColors[series.colorClass as keyof typeof barColors];

        return (
          <div
            key={series.id}
            onClick={() => navigate(`/series/${series.id}`)}
            className="relative overflow-hidden w-full bg-[rgba(255,255,255,0.02)] rounded-xl border border-[var(--surface-border-new)] px-5 py-5 cursor-pointer hover:border-[var(--accent-primary)]/40 hover:bg-[rgba(var(--accent-rgb),0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(var(--accent-rgb),0.25)] flex justify-between items-center group z-10"
          >
            {/* Floating glowing element in the background on hover */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none group-hover:animate-pulse" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-gray-200 font-bold text-lg group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                  {series.title}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border ${badgeClass}`}
                >
                  {series.level}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                {series.desc}
              </p>
            </div>
            
            <div className="relative z-10 text-right flex items-center gap-6">
              <div className="flex flex-col items-end gap-2.5">
                <div className="text-xs font-mono text-gray-400">
                  <span className="text-white font-semibold">{completed}</span> / {total} Completed
                </div>
                <div className="w-28 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${barClass}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              {/* Chevron icon that slides in smoothly on hover */}
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border border-white/5 group-hover:bg-[var(--accent-primary)]/10 group-hover:border-[var(--accent-primary)]/20">
                <ChevronRight size={16} className="text-[var(--accent-primary)]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
