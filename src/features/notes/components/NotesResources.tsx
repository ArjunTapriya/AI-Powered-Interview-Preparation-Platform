import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { SmartSearch } from './SmartSearch';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ResourceExplorer } from './ResourceExplorer';
import { DSANotesSection } from './DSANotesSection';
import { AIInsightsSidebar } from './AIInsightsSidebar';

// Import Mock Data
import { mockResources, mockRecommendations, mockDSANotes, mockInsights } from '../data/mockData';

export const NotesResources: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1600px] mx-auto min-h-screen pb-20"
    >
      <HeroSection />
      
      <div className="grid grid-cols-1 gap-8">
        
        {/* Main Content Column */}
        <div className="flex flex-col min-w-0">
          
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Explore Resources
            </h2>
            <ResourceExplorer resources={mockResources} />
          </div>

          <DSANotesSection notes={mockDSANotes} />
        </div>

      </div>
    </motion.div>
  );
};
