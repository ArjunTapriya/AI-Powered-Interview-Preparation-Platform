import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import { useApp, type EvaluationMetrics } from "../../../store/AppContext";
import { useQuery } from "@tanstack/react-query";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  ChevronRight,
  BookOpen,
  Mic,
  CheckCircle2,
  Award,
  Target
} from "lucide-react";

import { QuestionSeriesList } from "./QuestionSeriesList";

// Premium Custom SVG Radar Chart component to avoid Recharts package layout glitches in React 19
const RadarChart: React.FC<{ metrics: EvaluationMetrics }> = ({ metrics }) => {
  const points = [
    { label: "Correctness", val: metrics.correctness, x: 150, y: 30 },
    { label: "Architecture", val: metrics.architecture, x: 270, y: 150 },
    { label: "Communication", val: metrics.communication, x: 150, y: 270 },
    { label: "Speed", val: metrics.speed, x: 30, y: 150 },
  ];

  // Calculate polygon coordinates based on value (0 to 100)
  const polygonPoints = points.map((p, idx) => {
    const center = 150;
    const maxLen = 120;
    const ratio = p.val / 100;

    let px = center;
    let py = center;

    if (idx === 0) py = center - maxLen * ratio; // Up
    if (idx === 1) px = center + maxLen * ratio; // Right
    if (idx === 2) py = center + maxLen * ratio; // Down
    if (idx === 3) px = center - maxLen * ratio; // Left

    return `${px},${py}`;
  }).join(" ");

  return (
    <div className="relative w-full max-w-[280px] mx-auto flex items-center justify-center">
      <svg width="300" height="300" className="overflow-visible">
        {/* Background grids */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => {
          const size = 120 * scale;
          const center = 150;
          return (
            <polygon
              key={i}
              points={`${center},${center - size} ${center + size},${center} ${center},${center + size} ${center - size},${center}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        <line x1="150" y1="30" x2="150" y2="270" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
        <line x1="30" y1="150" x2="270" y2="150" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />

        {/* Data polygon with neon cyan gradient fill */}
        <defs>
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points={polygonPoints}
          fill="url(#radar-gradient)"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          className="filter drop-shadow-[0_0_6px_var(--accent-glow)] animate-pulse"
        />

        {/* Value nodes */}
        {points.map((p, idx) => {
          const center = 150;
          const maxLen = 120;
          const ratio = p.val / 100;
          let px = center;
          let py = center;

          if (idx === 0) py = center - maxLen * ratio;
          if (idx === 1) px = center + maxLen * ratio;
          if (idx === 2) py = center + maxLen * ratio;
          if (idx === 3) px = center - maxLen * ratio;

          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r="4"
              fill="var(--accent-primary)"
              className="filter drop-shadow-[0_0_4px_var(--accent-primary)]"
            />
          );
        })}

        {/* Outer Labels */}
        <text x="150" y="18" textAnchor="middle" fill="#9ca3af" className="text-[10px] uppercase font-bold tracking-widest">Correctness</text>
        <text x="282" y="154" textAnchor="start" fill="#9ca3af" className="text-[10px] uppercase font-bold tracking-widest">Architecture</text>
        <text x="150" y="292" textAnchor="middle" fill="#9ca3af" className="text-[10px] uppercase font-bold tracking-widest">Communication</text>
        <text x="18" y="154" textAnchor="end" fill="#9ca3af" className="text-[10px] uppercase font-bold tracking-widest">Speed</text>
      </svg>
    </div>
  );
};

const getCurrentWeekDates = () => {
  const dates = [];
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, streak, history, accessToken, recommendation, fetchRecommendations, pingStreak, prepGuidesCache, setCurrentEvaluationId } = useApp() as any;

  const insight = useMemo(() => {
    const latestSession = history && history.length > 0 ? history[0] : null;
    if (latestSession) {
      const typeStr = latestSession.type;
      const score = latestSession.overallScore;
      const notes = latestSession.feedbackNotes || [];
      const primaryAdvice = notes.length > 0 
        ? notes[0] 
        : `Refine your ${typeStr} problem-solving approach and speed.`;
      
      return {
        status: `Latest Mock Interview (${typeStr}) scored ${score}%.`,
        nextStep: `Next step: ${primaryAdvice}`,
        focus: typeStr === "DSA" ? "DSA Practice" : typeStr === "System Design" ? "System Design" : "Behavioral Prep"
      };
    }

    return {
      status: `Preparing for ${user.roleDepth || 'Mid-level'} role at ${user.targetCompany || 'Google'}.`,
      nextStep: "Next step: Start a Mock Interview practice session to establish your performance metrics.",
      focus: "Mock Interviews"
    };
  }, [history, user]);

  const averages = useMemo<EvaluationMetrics>(() => {
    if (history && history.length > 0) {
      let c = 0, s = 0, a = 0, comm = 0;
      history.forEach((session: any) => {
        const metrics = session.metrics || {};
        c += metrics.correctness !== undefined ? metrics.correctness : 0;
        s += metrics.speed !== undefined ? metrics.speed : 0;
        a += metrics.architecture !== undefined ? metrics.architecture : 0;
        comm += metrics.communication !== undefined ? metrics.communication : 0;
      });
      const len = history.length;
      return {
        correctness: Math.round(c / len),
        speed: Math.round(s / len),
        architecture: Math.round(a / len),
        communication: Math.round(comm / len),
      };
    }

    const uRadar = user?.radarScores;
    if (uRadar && (uRadar.correctness > 0 || uRadar.speed > 0 || uRadar.architecture > 0 || uRadar.communication > 0)) {
      return uRadar;
    }

    return {
      correctness: 75,
      speed: 65,
      architecture: 70,
      communication: 60,
    };
  }, [history, user]);

  const [lowestMetricName, setLowestMetricName] = useState<string>("correctness");
  const [activityLog, setActivityLog] = useState<number[]>([]);

  const currentWeekDates = useMemo(() => getCurrentWeekDates(), []);

  const { data: weeklyActivityData } = useQuery({
    queryKey: ["analytics", "weeklyActivity", currentWeekDates],
    queryFn: async () => {
      if (!accessToken) return null;
      const res = await apiFetch(`/analytics/activity/weekly?dates=${currentWeekDates.join(",")}`);
      return res.json();
    },
    enabled: !!accessToken,
    refetchInterval: 30000,
  });

  const weeklyDurations = useMemo(() => {
    const list = [0, 0, 0, 0, 0, 0, 0];
    if (weeklyActivityData?.success && weeklyActivityData.data?.activity) {
      const activityList = weeklyActivityData.data.activity;
      currentWeekDates.forEach((date, index) => {
        const match = activityList.find((a: any) => a.date === date);
        if (match) {
          list[index] = match.durationMinutes;
        }
      });
    }
    return list;
  }, [weeklyActivityData, currentWeekDates]);

  const chartConfig = useMemo(() => {
    const maxVal = Math.max(...weeklyDurations);
    let limit = 60;
    let topLabel = "1h";
    let midLabel = "30m";

    if (maxVal <= 60) {
      limit = 60;
      topLabel = "1h";
      midLabel = "30m";
    } else if (maxVal <= 120) {
      limit = 120;
      topLabel = "2h";
      midLabel = "1h";
    } else {
      const hours = Math.ceil(maxVal / 60);
      limit = hours * 60;
      topLabel = `${hours}h`;
      if (hours % 2 === 0) {
        midLabel = `${hours / 2}h`;
      } else {
        midLabel = `${(hours / 2).toFixed(1)}h`;
      }
    }

    return { limit, topLabel, midLabel };
  }, [weeklyDurations]);

  const { data: skillsData } = useQuery({
    queryKey: ["analytics", "skills", history],
    queryFn: async () => {
      if (!accessToken) return null;
      const res = await apiFetch("/analytics/skills");
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["analytics", "dashboard", history],
    queryFn: async () => {
      if (!accessToken) return null;
      const res = await apiFetch("/analytics/dashboard");
      return res.json();
    },
    enabled: !!accessToken,
  });

  const { data: trendsData } = useQuery({
    queryKey: ["analytics", "trends", history],
    queryFn: async () => {
      if (!accessToken) return null;
      const res = await apiFetch("/analytics/trends?period=daily");
      return res.json();
    },
    enabled: !!accessToken,
  });



  useEffect(() => {
    if (dashboardData?.success && dashboardData.data?.summary) {
      const weakest = dashboardData.data.summary.weakestSkill?.toLowerCase();
      if (weakest && weakest !== "n/a") {
        setLowestMetricName(weakest);
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    if (trendsData?.success && trendsData.data?.trends) {
      const days = [];
      const trendsMap = new Map(trendsData.data.trends.map((t: any) => [t.date, t.score]));
      
      const today = new Date();
      for (let i = 97; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const score = trendsMap.get(dateStr) as number | undefined | null;
        
        let intensity = 0;
        if (score !== undefined && score !== null) {
          if (score > 80) intensity = 3;
          else if (score > 60) intensity = 2;
          else intensity = 1;
        }
        days.push(intensity);
      }
      setActivityLog(days);
    }
  }, [trendsData]);

  useEffect(() => {
    if (fetchRecommendations && accessToken) {
      fetchRecommendations();
    }
    if (pingStreak && accessToken) {
      pingStreak();
    }
  }, [accessToken, history]);

  // Fallback local recommendations if the backend API isn't populated/running yet
  const localRecommendation = useMemo(() => {
    const key = lowestMetricName;
    if (key === "correctness" || key === "speed") {
      return {
        title: "Merge k Sorted Lists (DSA)",
        desc: "Practice heap sorting time bounds under stress configurations.",
        type: "DSA" as const,
        challenge: {
          id: "dsa-merge-k",
          title: "Merge k Sorted Lists",
          type: "DSA",
          difficulty: "Hard",
          timeLimit: 40,
          description: "Merge k sorted linked lists and return it as one sorted list.",
          codeTemplate: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Write optimal O(N log k) solution\n    return null;\n}",
          optimalCode: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Using a Min-Heap is standard.\n    // Time Complexity: O(N log k), Space: O(k) for heap storage.\n    return null;\n}",
          transcript: [
            { speaker: "Interviewer", text: "We have multiple log streams that are pre-sorted by timestamp. How would you aggregate them into a single sorted stream?" },
            { speaker: "Candidate", text: "We can use a Min-Heap containing the head elements. At each step, we pop the smallest and insert its successor.", isFiller: false },
            { speaker: "Interviewer", text: "What's the space complexity of that?", isFiller: false },
            { speaker: "Candidate", text: "Like, it would be, uh, O(k) space where k is the number of lists.", isFiller: true }
          ]
        }
      };
    } else if (key === "architecture") {
      return {
        title: "Design a Distributed Cache (System Design)",
        desc: "Construct visual topologies, database cache invalidation models, and edge clusters.",
        type: "System Design" as const,
        challenge: {
          id: "sys-design-cache",
          title: "Distributed Cache",
          type: "System Design",
          difficulty: "Medium",
          timeLimit: 45,
          description: "Design a high-throughput cache cluster with eviction policies and consistency.",
          codeTemplate: "// Define cache nodes and replication structure\nclass DistributedCache {\n    get(key: string): string | null {}\n    put(key: string, value: string): void {}\n}",
          optimalCode: "// Distributed cache uses consistent hashing to assign cache keys to nodes.\n// Eviction policies include LRU/LFU. Write-through vs Write-around is detailed.\n",
          transcript: [
            { speaker: "Interviewer", text: "How do you handle hot spots if a single cache key receives massive traffic?" },
            { speaker: "Candidate", text: "We can deploy read replicas for hot keys or use local cache caching inside clients.", isFiller: false },
            { speaker: "Interviewer", text: "Excellent, how does cache invalidation fit in?", isFiller: false },
            { speaker: "Candidate", text: "Actually, we should use, you know, write-through caches or CDC from databases.", isFiller: true }
          ]
        }
      };
    } else {
      return {
        title: "Tell me about a time you resolved a conflict (Behavioral)",
        desc: "Structure stories using the STAR method (Situation, Task, Action, Result) for leadership evaluation.",
        type: "Behavioral" as const,
        challenge: {
          id: "beh-conflict",
          title: "Resolving Team Conflicts",
          type: "Behavioral",
          difficulty: "Easy",
          timeLimit: 30,
          description: "Explain a situation where you had a strong technical disagreement with a peer.",
          codeTemplate: "# STAR Story Outline\n- Situation:\n- Task:\n- Action:\n- Result:",
          optimalCode: "- Situation: Conflict on React SSR implementation.\n- Task: Deliver system under latency bounds.\n- Action: Set up A/B validation tests to gather empirical logs.\n- Result: Improved latency by 30% and unified team direction.",
          transcript: [
            { speaker: "Interviewer", text: "Can you tell me about a time you disagreed with a colleague on architectural patterns?" },
            { speaker: "Candidate", text: "Yes, we were building SSR. I wanted caching, they didn't. I built a benchmark to show metrics.", isFiller: false },
            { speaker: "Interviewer", text: "How did they react to the data?", isFiller: false },
            { speaker: "Candidate", text: "Uhm, basically they agreed since the numbers were, like, very clear.", isFiller: true }
          ]
        }
      };
    }
  }, [lowestMetricName]);


  const { data: seriesData } = useQuery({
    queryKey: ["questions", "sets"],
    queryFn: async () => {
      const res = await apiFetch("/questions/sets");
      const data = await res.json();
      if (res.ok && data.success) return data.data.sets;
      return null;
    },
  });

  const getDsaProgress = () => {
    if (!seriesData) return 0;
    const total = seriesData.set1.length + seriesData.set2.length + seriesData.set3.length;
    if (total === 0) return 0;
    
    const completed = [...seriesData.set1, ...seriesData.set2, ...seriesData.set3].filter((q: any) => 
      history.some((h: any) => h.id === q.id) || user?.manualCompletedQuestions?.includes(q.id)
    ).length;
    
    return Math.round((completed / total) * 100);
  };

  const getRoadmapProgress = () => {
    const completedTech = prepGuidesCache?.Technical?.completedIndices?.length || 0;
    const completedHr = prepGuidesCache?.Behavioral?.completedIndices?.length || 0;
    const totalCompleted = completedTech + completedHr;
    
    // As per requirement, 1 step completed = 10% progress
    return Math.min(100, totalCompleted * 10);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto py-2">
      
      {/* Top Row: Streak and AI Coach Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Prep Streak */}
        <div className="new-card p-6 flex flex-row items-center justify-between gap-6 lg:col-span-1 relative overflow-hidden">
          <div className="flex flex-col text-left z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[var(--accent-orange)]/10 rounded-xl text-[var(--accent-orange)] shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Zap size={24} className="fill-[var(--accent-orange)]" />
              </div>
              <h4 className="text-[17px] font-bold text-white">Daily Prep Streak</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary-new)] leading-relaxed">Keep practicing daily to build solid cognitive habits under timing bounds.</p>
          </div>
          <div className="relative flex items-center justify-center shrink-0 w-16 h-16 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--accent-orange)" strokeWidth="6" strokeDasharray="175" strokeDashoffset="140" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white leading-none">{streak}</span>
              <span className="text-[7px] font-bold text-[var(--accent-orange)] uppercase tracking-wider mt-0.5 leading-none text-center">DAYS<br/>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* AI Coach Insight */}
        <div className="new-card lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0B2E] via-[#1A1C29] to-[#1A1C29] z-0" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Brain size={22} className="text-[#8B5CF6]" />
              </div>
              <h3 className="text-[17px] font-bold text-white">AI Coach Insight</h3>
            </div>
            
            <div className="flex justify-between items-end mt-auto w-full">
              <div className="max-w-[60%]">
                <p className="text-[13px] text-gray-300 mb-4 leading-relaxed">
                  <span className="font-bold text-white block mb-1">{insight.status}</span>
                  {insight.nextStep}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary-new)] font-medium">Suggested Focus:</span>
                  <div className="px-3 py-1 rounded-full border border-[#8B5CF6]/40 text-[#8B5CF6] text-[11px] font-semibold bg-[#8B5CF6]/10">
                    {insight.focus}
                  </div>
                </div>
              </div>
              
              {/* Decorative Chart Area */}
              <div className="flex-1 max-w-[40%] flex justify-end items-end pb-2 opacity-80">
                 <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path d="M0,50 Q10,30 20,40 T40,20 T60,45 T80,10 T100,30 T120,5 T140,25 T160,15 T180,40 T200,30" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="80" cy="10" r="3" fill="#8B5CF6" className="animate-pulse" />
                 </svg>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Middle Row: Radar Chart and Question Series */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Core Skill Diagnostics */}
        <div className="new-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent-purple)]" /> Core Skill Diagnostics
            </h3>
            <button className="text-[10px] text-[var(--text-secondary-new)] hover:text-white flex items-center gap-1 transition-colors">
              View Details <ChevronRight size={12} />
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary-new)] mb-2">Calculated across your practice and diagnostic logs.</p>
          
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <RadarChart metrics={averages} />
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-left mt-2">
            <div className="flex flex-col bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] rounded-lg p-2.5">
              <span className="text-[10px] text-[var(--text-secondary-new)] mb-1">Correctness</span>
              <span className="text-[15px] font-bold text-white mb-1">{averages.correctness}%</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded w-fit">Strong</span>
            </div>
            <div className="flex flex-col bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] rounded-lg p-2.5">
              <span className="text-[10px] text-[var(--text-secondary-new)] mb-1">Speed</span>
              <span className="text-[15px] font-bold text-white mb-1">{averages.speed}%</span>
              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded w-fit">Good</span>
            </div>
            <div className="flex flex-col bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] rounded-lg p-2.5">
              <span className="text-[10px] text-[var(--text-secondary-new)] mb-1 truncate">Architecture</span>
              <span className="text-[15px] font-bold text-white mb-1">{averages.architecture}%</span>
              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded w-fit">Good</span>
            </div>
            <div className="flex flex-col bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] rounded-lg p-2.5">
              <span className="text-[10px] text-[var(--text-secondary-new)] mb-1 truncate">Communication</span>
              <span className="text-[15px] font-bold text-white mb-1">{averages.communication}%</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded w-fit">Strong</span>
            </div>
          </div>
        </div>

        {/* Question Series */}
        <div className="new-card p-6 lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold text-white">Question Series For You</h3>
            <button className="text-[10px] text-[var(--text-secondary-new)] hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full border border-[var(--surface-border-new)] bg-[rgba(255,255,255,0.02)]">
              View All Series <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar-new pr-2">
            <QuestionSeriesList />
          </div>
        </div>
        
      </div>

      {/* Bottom Row: Milestones, Activity, Achievements, Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Syllabus Node Milestones */}
        <div className="new-card p-5 flex flex-col justify-between">
          <h3 className="text-[14px] font-bold text-white flex items-center gap-2 mb-6">
            <BookOpen size={16} className="text-[var(--accent-purple)]" /> Syllabus Node Milestones
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary-new)]">
                <span>Algorithms & Data Structures</span>
                <span className="text-[var(--accent-orange)] font-bold">{getDsaProgress()}%</span>
              </div>
              <ProgressBar value={getDsaProgress()} size="sm" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary-new)]">
                <span>Roadmap Completion</span>
                <span className="text-[var(--accent-orange)] font-bold">{getRoadmapProgress()}%</span>
              </div>
              <ProgressBar value={getRoadmapProgress()} size="sm" />
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="new-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--accent-purple)]" /> Weekly Activity
            </h3>
            <select className="bg-[rgba(255,255,255,0.05)] border border-[var(--surface-border-new)] text-[10px] text-gray-300 rounded px-2 py-0.5 outline-none cursor-pointer">
              <option>This Week</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-1 mt-2 relative z-10 pl-5 pb-4">
            <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[9px] text-[var(--text-secondary-new)]">
              <span>{chartConfig.topLabel}</span>
              <span>{chartConfig.midLabel}</span>
              <span>0</span>
            </div>
            {/* Dynamic weekly activity bar chart */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const duration = weeklyDurations[i];
              const heightPercent = Math.min(100, Math.round((duration / chartConfig.limit) * 100)) + "%";
              const hours = Math.floor(duration / 60);
              const mins = duration % 60;
              const tooltip = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-1 group" title={tooltip}>
                  <div className="w-full max-w-[12px] h-[100px] flex items-end relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 border border-white/10 text-[8px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      {tooltip}
                    </div>
                    <div className="w-full bg-gradient-to-t from-[var(--accent-purple)] to-[#A78BFA] rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: heightPercent }} />
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary-new)]">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements mapped from History */}
        <div className="new-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <Award size={16} className="text-[var(--accent-orange)]" /> Recent Achievements
            </h3>
            <button
              onClick={() => {
                if (setCurrentEvaluationId) setCurrentEvaluationId(null);
                navigate("/evaluation");
              }}
              className="text-[10px] text-[var(--text-secondary-new)] hover:text-white flex items-center gap-1 transition-colors"
            >
              All Reports <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar-new">
            {history && history.length > 0 ? history.slice(0, 3).map((session: any, i: number) => {
              const score = session.overallScore !== undefined ? session.overallScore : (session.score !== undefined ? session.score : 0);
              const duration = session.durationMin !== undefined ? session.durationMin : (session.duration !== undefined ? session.duration : 0);
              const dateObj = new Date(session.createdAt || session.date);

              return (
                <div 
                  key={session.id || i} 
                  className="flex items-center gap-3 group cursor-pointer" 
                  onClick={() => {
                    if (setCurrentEvaluationId) setCurrentEvaluationId(session.id);
                    navigate("/evaluation");
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-orange)]/10 transition-colors">
                    <CheckCircle2 size={14} className="text-gray-400 group-hover:text-[var(--accent-orange)]" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="text-[11px] font-bold text-white truncate">
                      {session.company || "Uploaded Resume Practice"} {session.interviewType || session.role || ""}
                    </h5>
                    <p className="text-[10px] text-[var(--text-secondary-new)] truncate">Score: {score}% • {duration} min</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary-new)] shrink-0">
                    {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            }) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(249,115,22,0.1)] border border-[var(--accent-orange)]/20 flex items-center justify-center shrink-0">
                    <Mic size={14} className="text-[var(--accent-orange)]" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[11px] font-bold text-white">First Steps</h5>
                    <p className="text-[10px] text-[var(--text-secondary-new)]">Completed your first series</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary-new)]">2d ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.1)] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[11px] font-bold text-white">Consistent Learner</h5>
                    <p className="text-[10px] text-[var(--text-secondary-new)]">7 day streak achieved!</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary-new)]">1d ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(236,72,153,0.1)] border border-pink-500/20 flex items-center justify-center shrink-0">
                    <Brain size={14} className="text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[11px] font-bold text-white">Problem Solver</h5>
                    <p className="text-[10px] text-[var(--text-secondary-new)]">Solved 50 problems</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary-new)]">5h ago</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Goals */}
        <div className="new-card p-5 flex flex-col">
          <h3 className="text-[14px] font-bold text-white flex items-center gap-2 mb-5">
            <Target size={16} className="text-cyan-400" /> Upcoming Goals
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1 border-b border-[var(--surface-border-new)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--accent-orange)]" />
                <span className="text-[11px] text-gray-300">Complete Series 1</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary-new)] font-mono">2 / 101</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--surface-border-new)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--text-secondary-new)]" />
                <span className="text-[11px] text-gray-300">Mock Interview</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary-new)]">Schedule</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--surface-border-new)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--text-secondary-new)]" />
                <span className="text-[11px] text-gray-300">Update Resume</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary-new)]">Pending</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
