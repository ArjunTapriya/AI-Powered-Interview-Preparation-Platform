import React from 'react';
import type { DSANote } from '../types';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  notes: DSANote[];
}

export const DSANotesSection: React.FC<Props> = ({ notes }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <BookOpen size={16} className="text-[var(--accent-primary)]" />
          Curated DSA Notes
        </h2>
        <button className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          View All Notes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (idx * 0.05) }}
            key={note.id}
            className="bg-[#16161A]/80 border border-surface-border hover:border-[var(--accent-primary)]/50 rounded-xl p-4 group transition-colors"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-sm font-bold text-gray-100 leading-tight group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                {note.topic}
              </h3>
              <a 
                href={note.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors shrink-0 p-1"
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <p className="text-xs text-gray-400 font-medium mb-3">
              By <span className="text-gray-200">{note.author}</span>
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                {note.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                <Calendar size={10} />
                {note.lastUpdated}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
