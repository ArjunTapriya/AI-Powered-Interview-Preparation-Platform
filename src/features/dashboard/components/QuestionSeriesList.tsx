import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { apiFetch } from "../../../utils/apiFetch";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Series 1 */}
      <div 
        onClick={() => navigate("/series/1")}
        className="w-full bg-[#1e1e1e] rounded-xl border border-gray-800 p-5 cursor-pointer hover:border-gray-600 transition-colors shadow-lg flex justify-between items-center group"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-gray-200 font-bold text-lg">Series 1</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Beginner</span>
          </div>
          <p className="text-sm text-gray-500">Fundamentals & Array Pointers</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-xs font-mono text-gray-400">
            {seriesData.set1.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length} / {seriesData.set1.length} Completed
          </div>
          <div className="w-24 bg-gray-900 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${seriesData.set1.length === 0 ? 0 : (seriesData.set1.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length / seriesData.set1.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Series 2 */}
      <div 
        onClick={() => navigate("/series/2")}
        className="w-full bg-[#1e1e1e] rounded-xl border border-gray-800 p-5 cursor-pointer hover:border-gray-600 transition-colors shadow-lg flex justify-between items-center group"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-gray-200 font-bold text-lg">Series 2</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">Moderate</span>
          </div>
          <p className="text-sm text-gray-500">Intermediate Structures & Design</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-xs font-mono text-gray-400">
            {seriesData.set2.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length} / {seriesData.set2.length} Completed
          </div>
          <div className="w-24 bg-gray-900 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${seriesData.set2.length === 0 ? 0 : (seriesData.set2.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length / seriesData.set2.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Series 3 */}
      <div 
        onClick={() => navigate("/series/3")}
        className="w-full bg-[#1e1e1e] rounded-xl border border-gray-800 p-5 cursor-pointer hover:border-gray-600 transition-colors shadow-lg flex justify-between items-center group"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-gray-200 font-bold text-lg">Series 3</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Pro</span>
          </div>
          <p className="text-sm text-gray-500">Advanced Algorithms & Architecture</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-xs font-mono text-gray-400">
            {seriesData.set3.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length} / {seriesData.set3.length} Completed
          </div>
          <div className="w-24 bg-gray-900 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${seriesData.set3.length === 0 ? 0 : (seriesData.set3.filter((q: any) => history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)).length / seriesData.set3.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
