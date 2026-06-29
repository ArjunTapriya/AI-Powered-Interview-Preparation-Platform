import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { Button } from "../../../components/ui/Button";
import { CheckCircle2, Play, BookOpen, Sparkles, Network } from "lucide-react";

interface SyllabusNode {
  id: string;
  title: string;
  category: "DSA" | "System Design" | "Behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  prerequisites: string[];
  challenge: {
    id: string;
    title: string;
    type: "DSA" | "System Design" | "Behavioral";
    difficulty: "Easy" | "Medium" | "Hard";
    timeLimit: number;
    description: string;
    codeTemplate: string;
    optimalCode: string;
    transcript?: any[];
  };
}

const fallbackSyllabusNodes: SyllabusNode[] = [
  {
    id: "dsa-basics",
    title: "Recursion & Backtracking Fundamentals",
    category: "DSA",
    difficulty: "Easy",
    description: "Master call stacks, depth trees, and recursion constraints.",
    prerequisites: [],
    challenge: {
      id: "dsa-recurse",
      title: "Fibonacci Sequence Call Stack",
      type: "DSA",
      difficulty: "Easy",
      timeLimit: 20,
      description: "Implement Fibonacci sequence calculator recursively with memoization optimization.",
      codeTemplate: "function fib(n: number, memo: Record<number, number> = {}): number {\n    // Write base case & memo lookup\n    return 0;\n}",
      optimalCode: "function fib(n: number, memo: Record<number, number> = {}): number {\n    if (n <= 1) return n;\n    if (memo[n]) return memo[n];\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n    return memo[n];\n}"
    }
  },
  {
    id: "sys-design-basics",
    title: "Network Fundamentals & Latency API",
    category: "System Design",
    difficulty: "Easy",
    description: "Understand TCP vs UDP, DNS loops, and REST constraints.",
    prerequisites: [],
    challenge: {
      id: "sys-net",
      title: "Designing REST endpoints",
      type: "System Design",
      difficulty: "Easy",
      timeLimit: 25,
      description: "Draft structural routes for a scalable messaging system configuration.",
      codeTemplate: "# API REST Endpoints Spec\n- POST /messages\n- GET /messages/:id\n- DELETE /messages/:id",
      optimalCode: "POST /messages - Create message body\nGET /messages/:id - Fetch message by uuid\nPUT /messages/:id - Update edit notes"
    }
  },
  {
    id: "dsa-intermediate",
    title: "Sliding Window & Hash Indexes",
    category: "DSA",
    difficulty: "Medium",
    description: "Optimize quadratic sub-arrays checks to linear checks.",
    prerequisites: ["dsa-basics"],
    challenge: {
      id: "dsa-sliding",
      title: "Longest Substring Without Repeating Characters",
      type: "DSA",
      difficulty: "Medium",
      timeLimit: 30,
      description: "Find the length of the longest substring without repeating characters.",
      codeTemplate: "function lengthOfLongestSubstring(s: string): number {\n    let maxLen = 0;\n    \n    return maxLen;\n}",
      optimalCode: "function lengthOfLongestSubstring(s: string): number {\n    const map = new Map<string, number>();\n    let left = 0, max = 0;\n    for (let r = 0; r < s.length; r++) {\n        if (map.has(s[r])) {\n            left = Math.max(map.get(s[r])! + 1, left);\n        }\n        map.set(s[r], r);\n        max = Math.max(max, r - left + 1);\n    }\n    return max;\n}"
    }
  },
  {
    id: "sys-design-intermediate",
    title: "Consistent Hashing & Cache Invalidation",
    category: "System Design",
    difficulty: "Medium",
    description: "Scale database read replicas dynamically with minimal cache misses.",
    prerequisites: ["sys-design-basics"],
    challenge: {
      id: "sys-cache",
      title: "Consistent Hashing Ring",
      type: "System Design",
      difficulty: "Medium",
      timeLimit: 40,
      description: "Map partition keys onto hashing ring nodes with virtual points.",
      codeTemplate: "class ConsistentHashingRing {\n    addNode(node: string): void {}\n    getNode(key: string): string {}\n}",
      optimalCode: "class ConsistentHashingRing {\n    // Consistent hashing ring stores hash points mapping keys to servers.\n}"
    }
  },
  {
    id: "dsa-advanced",
    title: "Heaps & Merge Sort Algorithms",
    category: "DSA",
    difficulty: "Hard",
    description: "Merge k sorted lists using Priority Queues.",
    prerequisites: ["dsa-intermediate"],
    challenge: {
      id: "dsa-merge-k",
      title: "Merge k Sorted Lists",
      type: "DSA",
      difficulty: "Hard",
      timeLimit: 45,
      description: "Merge k sorted linked lists and return it as one sorted list.",
      codeTemplate: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    return null;\n}",
      optimalCode: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Complete min-heap insertion implementation\n}"
    }
  },
  {
    id: "sys-design-advanced",
    title: "Rate Limiter & Load Balancer Topologies",
    category: "System Design",
    difficulty: "Hard",
    description: "Protect client-facing APIs from spikes and DDoS loops.",
    prerequisites: ["sys-design-intermediate"],
    challenge: {
      id: "sys-rate-limiter",
      title: "Token Bucket Rate Limiter",
      type: "System Design",
      difficulty: "Hard",
      timeLimit: 40,
      description: "Implement a thread-safe token bucket rate limiting middleware logic.",
      codeTemplate: "class TokenBucketLimiter {\n    allowRequest(clientId: string): boolean {}\n}",
      optimalCode: "class TokenBucketLimiter {\n    // Token bucket tracks token count refreshed over timestamps.\n}"
    }
  },
  {
    id: "star-behavioral",
    title: "STAR Communication: Conflict Leadership",
    category: "Behavioral",
    difficulty: "Medium",
    description: "Explain disagreements using Situation, Task, Action, and Result outlines.",
    prerequisites: [],
    challenge: {
      id: "star-conflict",
      title: "Describe a Conflict Story",
      type: "Behavioral",
      difficulty: "Medium",
      timeLimit: 30,
      description: "Write out a structured story answering: 'Tell me about a time you had a major technical dispute with a lead.'",
      codeTemplate: "# STAR Breakdown:\n- Situation:\n- Task:\n- Action:\n- Result:",
      optimalCode: "- Situation: Dispute on migration to AWS cloud microservices.\n- Task: Align tech requirements before release deadline.\n- Action: Set up code benchmark logs.\n- Result: Completed project on time, improving response latency by 20%."
    }
  }
];

export const RoadmapTree: React.FC = () => {
  const navigate = useNavigate();
  const { history, prepGuidesCache, isGeneratingGuide, updatePrepGuideProgress } = useApp() as any;
  
  const hasHRHistory = history?.some((h: any) => h.type === "Behavioral");
  const hasTechHistory = history?.some((h: any) => h.type === "Technical");

  const hrSteps = prepGuidesCache?.Behavioral?.steps || [];
  const techSteps = prepGuidesCache?.Technical?.steps || [];
  
  const loadingHr = isGeneratingGuide?.Behavioral || false;
  const loadingTech = isGeneratingGuide?.Technical || false;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4 py-6 text-left">
      <div className="border-b border-surface-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white leading-tight font-sans tracking-tight m-0">
            Make the Roadmap
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Review your 10-Step AI preparation guides tailored specifically to your past interview performances.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-mono flex items-center gap-1.5 transition-colors border border-[rgba(var(--accent-rgb),0.2)] bg-[rgba(var(--accent-rgb),0.05)] px-3.5 py-1.5 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* HR Round Column */}
        <div className="new-card w-full p-6 bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] shadow-xl h-full flex flex-col">
          <div className="flex flex-col mb-6 gap-2 border-b border-surface-border pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                <Network size={20} className="text-[var(--accent-primary)]" /> HR / Behavioral Round
              </h3>
              {hrSteps.length > 0 && (
                <span className="text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-1 rounded">
                  {Math.round(((prepGuidesCache?.Behavioral?.completedIndices?.length || 0) / hrSteps.length) * 100)}% Completed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">10-Step Preparation Guide</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-center">
            {!hasHRHistory ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                  <BookOpen className="text-gray-500" size={28} />
                </div>
                <p className="text-gray-400 text-sm font-mono">No Behavioral interviews found.</p>
                <p className="text-gray-500 text-xs">Complete an HR round to unlock your personalized 10-step AI guide.</p>
                <Button onClick={() => navigate("/practice")} variant="primary" className="mt-4 px-6 text-xs uppercase tracking-widest font-bold">
                  Go To Interviews <Play size={12} className="ml-2 inline" />
                </Button>
              </div>
            ) : loadingHr ? (
              <div className="text-center text-gray-500 text-sm py-12 animate-pulse">Generating your personalized HR prep guide...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {hrSteps.map((step: any, idx: number) => {
                  const isCompleted = prepGuidesCache?.Behavioral?.completedIndices?.includes(idx);
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div 
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 cursor-pointer border transition-colors ${isCompleted ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'bg-transparent border-gray-500 text-transparent hover:border-[var(--accent-primary)]'}`}
                        onClick={() => {
                          const current = prepGuidesCache?.Behavioral?.completedIndices || [];
                          const next = isCompleted ? current.filter((i: number) => i !== idx) : [...current, idx];
                          updatePrepGuideProgress("Behavioral", next);
                        }}
                      >
                        <CheckCircle2 size={14} className={isCompleted ? "opacity-100" : "opacity-0"} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}>Step {idx + 1}</h4>
                        <p className={`text-[11px] leading-relaxed mt-0.5 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-400'}`}>{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tech Round Column */}
        <div className="new-card w-full p-6 bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] shadow-xl h-full flex flex-col">
          <div className="flex flex-col mb-6 gap-2 border-b border-surface-border pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-400" /> Technical Round
              </h3>
              {techSteps.length > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  {Math.round(((prepGuidesCache?.Technical?.completedIndices?.length || 0) / techSteps.length) * 100)}% Completed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">10-Step Preparation Guide</p>
          </div>
          
          <div className="flex-grow flex flex-col justify-center">
            {!hasTechHistory ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                  <BookOpen className="text-gray-500" size={28} />
                </div>
                <p className="text-gray-400 text-sm font-mono">No Technical interviews found.</p>
                <p className="text-gray-500 text-xs">Complete a Tech round to unlock your personalized 10-step AI guide.</p>
                <Button onClick={() => navigate("/practice")} variant="primary" className="mt-4 px-6 text-xs uppercase tracking-widest font-bold">
                  Go To Interviews <Play size={12} className="ml-2 inline" />
                </Button>
              </div>
            ) : loadingTech ? (
              <div className="text-center text-gray-500 text-sm py-12 animate-pulse">Generating your personalized Technical prep guide...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {techSteps.map((step: any, idx: number) => {
                  const isCompleted = prepGuidesCache?.Technical?.completedIndices?.includes(idx);
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div 
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 cursor-pointer border transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-gray-500 text-transparent hover:border-emerald-500'}`}
                        onClick={() => {
                          const current = prepGuidesCache?.Technical?.completedIndices || [];
                          const next = isCompleted ? current.filter((i: number) => i !== idx) : [...current, idx];
                          updatePrepGuideProgress("Technical", next);
                        }}
                      >
                        <CheckCircle2 size={14} className={isCompleted ? "opacity-100" : "opacity-0"} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}>Step {idx + 1}</h4>
                        <p className={`text-[11px] leading-relaxed mt-0.5 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-400'}`}>{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
