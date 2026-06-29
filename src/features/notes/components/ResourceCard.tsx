import React from 'react';
import type { Resource } from '../types';
import { Bookmark, ExternalLink, Clock, Brain, Globe, Video, FileText, Code2, BookOpen, Map, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  resource: Resource;
  index: number;
}

export const ResourceCard: React.FC<Props> = ({ resource, index }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Article': return <FileText size={16} />;
      case 'Video': return <Video size={16} />;
      case 'Practice': return <Code2 size={16} />;
      case 'Book': return <BookOpen size={16} />;
      case 'Roadmap': return <Map size={16} />;
      case 'Repository': return <GitBranch size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'Beginner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Intermediate': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Advanced': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-[#0D1020]/50 border border-surface-border rounded-2xl p-5 hover:bg-[#16161A] transition-colors overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-purple)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-border flex items-center justify-center text-gray-400">
            {getIcon(resource.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{resource.sourceName}</span>
              <span className="w-1 h-1 rounded-full bg-surface-border" />
              <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                <Clock size={10} /> {resource.estimatedTime}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-100 leading-tight mt-0.5 group-hover:text-white transition-colors">{resource.title}</h3>
          </div>
        </div>

        <button className="text-gray-500 hover:text-[var(--accent-primary)] transition-colors">
          <Bookmark size={18} className={resource.isBookmarked ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]" : ""} />
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {resource.description}
      </p>

      {/* AI Preview Section */}
      <div className="bg-[#1A1A24]/60 rounded-xl p-3 mb-4 border border-[var(--accent-purple)]/10 relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain size={12} className="text-[var(--accent-purple)]" />
          <span className="text-[10px] font-mono text-[var(--accent-purple)] font-semibold tracking-wider">AI PREVIEW</span>
        </div>
        <p className="text-xs text-gray-300 italic leading-relaxed">
          "{resource.aiPreview}"
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getDifficultyColor(resource.difficulty)}`}>
            {resource.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md border border-surface-border bg-black/20 text-gray-400 font-semibold">
            {resource.type}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 font-mono">AI MATCH</span>
            <span className={`text-xs font-bold font-mono ${resource.aiScore >= 95 ? 'text-emerald-400' : 'text-[var(--accent-primary)]'}`}>
              {resource.aiScore}/100
            </span>
          </div>
          
          <a 
            href={resource.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
          >
            Open <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
