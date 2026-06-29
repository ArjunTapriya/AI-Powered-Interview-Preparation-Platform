import React from 'react';
import type { Recommendation } from '../types';
import { Target, AlertTriangle, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  recommendations: Recommendation[];
}

export const RecommendationsPanel: React.FC<Props> = ({ recommendations }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Next': return <Target className="text-blue-400" size={20} />;
      case 'Weakness': return <AlertTriangle className="text-orange-400" size={20} />;
      case 'Interview': return <Briefcase className="text-[var(--accent-purple)]" size={20} />;
      default: return <Target className="text-gray-400" size={20} />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'Next': return 'from-blue-500/10 to-transparent border-blue-500/20';
      case 'Weakness': return 'from-orange-500/10 to-transparent border-orange-500/20';
      case 'Interview': return 'from-[var(--accent-purple)]/10 to-transparent border-[var(--accent-purple)]/20';
      default: return 'from-gray-500/10 to-transparent border-gray-500/20';
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" /> 
        Recommended For You
      </h2>
      
      <div className="flex gap-4 overflow-x-auto custom-scrollbar-new pb-4 snap-x">
        {recommendations.map((rec, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (idx * 0.1) }}
            key={rec.id}
            className={`min-w-[280px] sm:min-w-[320px] bg-gradient-to-br ${getGradient(rec.type)} bg-[#0D1020]/80 border rounded-2xl p-5 shrink-0 snap-start relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 shadow-sm">
                {getIcon(rec.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {rec.type === 'Next' ? 'Recommended Next' : rec.type === 'Weakness' ? 'Weak Area Detected' : 'Upcoming Interview'}
                </span>
                <span className="text-sm font-bold text-white">{rec.title}</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Because:</span> {rec.reason}
              </p>
              {rec.confidenceScore && (
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Confidence Score:</span>
                  <span className="text-emerald-400 font-bold">{rec.confidenceScore}%</span>
                </div>
              )}
              {rec.companyMatch && (
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Company Match:</span>
                  <span className="text-[var(--accent-purple)] font-bold">{rec.companyMatch}</span>
                </div>
              )}
            </div>

            <button className="flex items-center justify-between w-full text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
              {rec.actionText || "View Resources"}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
