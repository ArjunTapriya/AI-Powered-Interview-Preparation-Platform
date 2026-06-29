import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SmartSearch: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative w-full mb-8 group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-purple)]/20 to-transparent rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative flex items-center w-full bg-[#16161A]/80 border border-surface-border rounded-2xl px-4 py-3 shadow-lg focus-within:border-[var(--accent-primary)]/50 focus-within:bg-[#1A1A24] transition-all backdrop-blur-md">
        <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
        
        <input 
          type="text" 
          placeholder="Search topics, concepts, interview questions, companies, system design..." 
          className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm md:text-base font-medium min-w-0"
        />
        
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-surface-border shrink-0 hidden sm:flex">
          <Sparkles className="text-[var(--accent-purple)] w-4 h-4" />
          <span className="text-xs font-mono text-gray-400">SEMANTIC</span>
        </div>
      </div>
    </motion.div>
  );
};
