import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, Library, Clock, BookMarked } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [stats, setStats] = useState({
    resources: 0,
    notes: 0,
    hours: 0,
    streak: 0
  });

  useEffect(() => {
    // Animate stats counting up
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Use easeOut cubic easing for a smoother finish
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setStats({
        resources: Math.floor(easeProgress * 543),
        notes: Math.floor(easeProgress * 128),
        hours: Math.floor(easeProgress * 42),
        streak: Math.floor(easeProgress * 14)
      });

      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 mb-8 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-[20%] w-[300px] h-[300px] bg-[var(--accent-purple)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-[10%] w-[200px] h-[200px] bg-[var(--accent-orange)]/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-1">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-medium text-[var(--accent-primary)]">AI Research Engine Active</span>
            </motion.div>
            <span className="text-xs text-gray-500 font-mono tracking-wider hidden sm:inline-block">MONITORING 500+ TRUSTED SOURCES</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
            Notes & Resources
            <Sparkles className="text-[var(--accent-purple)] w-6 h-6 animate-pulse" />
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Curated notes, personalized articles, cheat sheets, and practice recommendations 
            generated specifically for your interview journey by your AI Assistant.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D1020]/50 border border-surface-border p-3 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Library className="text-[var(--accent-primary)] w-4 h-4 mb-1" />
            <span className="text-xl font-bold text-white font-mono">{stats.resources}+</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Resources</span>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0D1020]/50 border border-surface-border p-3 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookMarked className="text-blue-400 w-4 h-4 mb-1" />
            <span className="text-xl font-bold text-white font-mono">{stats.notes}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Notes</span>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0D1020]/50 border border-surface-border p-3 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm relative overflow-hidden group hidden sm:flex"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Clock className="text-emerald-400 w-4 h-4 mb-1" />
            <span className="text-xl font-bold text-white font-mono">{stats.hours}h</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Learning</span>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0D1020]/50 border border-surface-border p-3 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm relative overflow-hidden group hidden sm:flex"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Activity className="text-orange-400 w-4 h-4 mb-1" />
            <span className="text-xl font-bold text-white font-mono">{stats.streak}d</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Streak</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
