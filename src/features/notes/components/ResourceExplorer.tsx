import React, { useState } from 'react';
import type { Resource } from '../types';
import { ResourceCard } from './ResourceCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
  resources: Resource[];
}

export const ResourceExplorer: React.FC<Props> = ({ resources }) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const tabs = ['All', 'Articles', 'Practice', 'Videos', 'Courses', 'Cheatsheets', 'Books', 'Roadmaps'];

  const filteredResources = resources.filter(res => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Articles') return res.type === 'Article';
    if (activeTab === 'Practice') return res.type === 'Practice' || res.type === 'Repository';
    if (activeTab === 'Videos') return res.type === 'Video';
    if (activeTab === 'Courses') return res.type === 'Course';
    if (activeTab === 'Cheatsheets') return res.type === 'Cheatsheet';
    if (activeTab === 'Books') return res.type === 'Book';
    if (activeTab === 'Roadmaps') return res.type === 'Roadmap';
    return true;
  });

  const displayedResources = filteredResources.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar-new pb-2 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setVisibleCount(10); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 ml-4 shrink-0">
          <span>Sort by:</span>
          <button className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-surface-border text-white transition-colors">
            Most Relevant <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {displayedResources.map((res, index) => (
            <ResourceCard key={res.id} resource={res} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {visibleCount < filteredResources.length && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white bg-[#16161A] hover:bg-[#1A1A24] border border-surface-border px-6 py-2.5 rounded-xl transition-colors"
          >
            Show More Resources <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
