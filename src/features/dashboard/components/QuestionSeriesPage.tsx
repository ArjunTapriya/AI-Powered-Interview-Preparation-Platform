import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/apiFetch";
import { useApp } from "../../../store/AppContext";
import { CheckCircle2, ChevronLeft, Play } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export const QuestionSeriesPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const { user, history, setActiveChallenge, toggleManualQuestion } = useApp() as any;

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
      <div className="p-8 text-center text-gray-500 text-sm h-full flex items-center justify-center">
        Loading question series...
      </div>
    );
  }

  const getSeriesInfo = () => {
    switch (seriesId) {
      case "1":
        return { title: "Series 1", label: "Beginner", desc: "Fundamentals & Array Pointers", data: seriesData.set1 };
      case "2":
        return { title: "Series 2", label: "Moderate", desc: "Intermediate Structures & Design", data: seriesData.set2 };
      case "3":
        return { title: "Series 3", label: "Pro", desc: "Advanced Algorithms & Architecture", data: seriesData.set3 };
      default:
        return { title: "Unknown Series", label: "", desc: "", data: [] };
    }
  };

  const info = getSeriesInfo();
  const questions = info.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate("/dashboard")}
        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-xl text-left">
        <h1 className="text-3xl font-extrabold text-white mb-2">Question Series For You</h1>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-200">{info.title}</h2>
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            info.label === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
            info.label === "Moderate" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {info.label}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{info.desc}</p>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {questions.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-[#1e1e1e] rounded-xl border border-gray-800">
            No questions found in this series yet.
          </div>
        )}
        {questions.map((q: any, idx: number) => {
          const completed = history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id);
          return (
            <div
              key={q.id}
              onClick={() => {
                setActiveChallenge(q);
                navigate("/workspace");
              }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between bg-[#19191c] rounded-xl border ${
                completed 
                  ? 'border-emerald-500/25 bg-emerald-950/5 hover:border-emerald-500/40' 
                  : 'border-gray-800/80 hover:border-gray-700 hover:bg-[#1f1f23]'
              } px-6 py-4 transition-all duration-200 cursor-pointer group shadow-md gap-4`}
            >
              {/* Left section: status check, title and short description */}
              <div className="flex items-start sm:items-center gap-4 flex-grow min-w-0 text-left">
                {/* Completion Checkbox Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent navigating when toggling completed
                    toggleManualQuestion(q.id, !completed);
                  }}
                  className={`p-2 rounded-lg transition-all border shrink-0 ${
                    completed 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "bg-white/5 text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/10"
                  }`}
                  title={completed ? "Mark as Incomplete" : "Mark as Completed"}
                >
                  <CheckCircle2 size={18} className={completed ? "fill-emerald-500/10" : ""} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-sm font-mono text-gray-500 font-semibold">{idx + 1}.</span>
                    <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                      {q.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      q.difficulty === "Hard"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : q.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  {/* Clean shortened description */}
                  <p className="text-xs text-gray-400 line-clamp-1 truncate max-w-3xl">
                    {q.description ? q.description.replace(/&[a-z0-9#]+;/gi, ' ').replace(/\s+/g, ' ').substring(0, 150) : "No description provided."}
                  </p>
                </div>
              </div>

              {/* Right section: solve button and actions */}
              <div className="flex items-center gap-3 shrink-0 justify-end">
                {completed && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Completed
                  </span>
                )}
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChallenge(q);
                    navigate("/workspace");
                  }}
                  variant="secondary"
                  size="sm"
                  className="px-4 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 group-hover:bg-[var(--accent-primary)] group-hover:text-white group-hover:border-[var(--accent-primary)] transition-all duration-200 flex items-center gap-1.5"
                >
                  <Play size={12} className="fill-current" /> Solve
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
