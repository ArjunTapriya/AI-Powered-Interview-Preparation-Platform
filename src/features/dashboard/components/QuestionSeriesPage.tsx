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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {questions.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12 bg-[#1e1e1e] rounded-xl border border-gray-800">
            No questions found in this series yet.
          </div>
        )}
        {questions.map((q: any, idx: number) => {
          const completed = history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id);
          return (
            <div
              key={q.id}
              className={`flex flex-col bg-[#1e1e1e] rounded-xl border ${completed ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-gray-800'} overflow-hidden shadow-lg transition-all hover:border-gray-600 group`}
            >
              <div className="p-5 flex-1 flex flex-col text-left">
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      q.difficulty === "Hard"
                        ? "bg-rose-500/10 text-rose-400"
                        : q.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {q.difficulty}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleManualQuestion(q.id, !completed);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${completed ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"}`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mb-2 leading-tight">
                  {idx + 1}. {q.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                  {q.description || "No description provided."}
                </p>
                <Button
                  onClick={() => {
                    setActiveChallenge(q);
                    navigate("/workspace");
                  }}
                  variant="secondary"
                  className="w-full mt-auto group-hover:bg-[var(--accent-primary)] group-hover:text-white group-hover:border-[var(--accent-primary)] transition-colors"
                >
                  <Play size={14} className="mr-2" /> Solve Challenge
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
