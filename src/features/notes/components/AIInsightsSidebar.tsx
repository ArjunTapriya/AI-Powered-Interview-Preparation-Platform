import React from 'react';
import type { Insight } from '../types';
import { Lightbulb, TrendingUp, Compass, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  insights: Insight[];
}

export const AIInsightsSidebar: React.FC<Props> = ({ insights }) => {
  const learningInsights = insights.filter(i => i.type === 'learning');
  const suggestions = insights.filter(i => i.type === 'suggestion');

  return (
    <div className="flex flex-col gap-6">
      
      {/* AI Coach Suggestions */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-b from-[var(--accent-purple)]/5 to-transparent border border-[var(--accent-purple)]/20 rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-purple)]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Compass className="text-[var(--accent-purple)]" size={18} />
          <h3 className="text-sm font-bold text-gray-200">AI Coach Suggestions</h3>
        </div>
        
        <ul className="flex flex-col gap-2 relative z-10">
          {suggestions.map(suggestion => (
            <li key={suggestion.id} className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)]" />
              {suggestion.message}
            </li>
          ))}
        </ul>
      </motion.div>

    </div>
  );
};
