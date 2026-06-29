import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";

export interface EvaluationMetrics {
  correctness: number;
  speed: number;
  architecture: number;
  communication: number;
}

export interface InterviewSession {
  id: string;
  company: string;
  date: string;
  type: "DSA" | "System Design" | "Behavioral";
  overallScore: number;
  metrics: EvaluationMetrics;
  durationMin: number;
  codeSnippet?: string;
  transcript?: { speaker: "Interviewer" | "Candidate"; text: string; timestamp: string; isFiller?: boolean }[];
  feedbackNotes?: string[];
  optimalCode?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
  targetCompany: string;
  roleDepth: "Junior" | "Mid-level" | "Senior" | "Staff/Principal";
  prepWeeks: number;
  diagnosticCompleted: boolean;
  radarScores: EvaluationMetrics;
  streakCount?: number;
  manualCompletedQuestions?: string[];
  subscriptionTier?: "FREE" | "PRO" | "PREMIUM";
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  history: InterviewSession[];
  setHistory: React.Dispatch<React.SetStateAction<InterviewSession[]>>;
  activeChallenge: any;
  setActiveChallenge: (challenge: any) => void;
  currentEvaluation: InterviewSession | null;
  setCurrentEvaluation: (session: InterviewSession | null) => void;
  currentEvaluationId: string | null;
  setCurrentEvaluationId: (id: string | null) => void;
  activePersona: "Nitpicker" | "Coach" | "Silent" | "Interrupter";
  setActivePersona: (persona: "Nitpicker" | "Coach" | "Silent" | "Interrupter") => void;
  stressActive: boolean;
  setStressActive: (active: boolean) => void;
  roadmapCompletedNodes: string[];
  setRoadmapCompletedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  themeAccent: "cyan" | "blue" | "purple" | "emerald" | "rose";
  setThemeAccent: (accent: "cyan" | "blue" | "purple" | "emerald" | "rose") => void;
  themeMode: "dark" | "light";
  setThemeMode: (mode: "dark" | "light") => void;
  resetProgress: () => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  fetchHistory: () => Promise<void>;
  fetchRoadmapProgress: () => Promise<void>;
  updateRoadmapProgress: (nodeId: string, completed: boolean) => Promise<void>;
  recommendation: any;
  fetchRecommendations: () => Promise<void>;
  fetchRandomChallenge: (category?: string, navigateTo?: (path: string) => void) => Promise<void>;
  prepGuidesCache: {
    Behavioral: { steps: string[]; count: number; completedIndices: number[] } | null;
    Technical: { steps: string[]; count: number; completedIndices: number[] } | null;
  };
  isGeneratingGuide: { Behavioral: boolean; Technical: boolean };
  updatePrepGuideProgress: (category: "Behavioral" | "Technical", completedIndices: number[]) => Promise<void>;
  pingStreak: () => Promise<void>;
  toggleManualQuestion: (questionId: string, completed: boolean) => Promise<void>;
}

const defaultUser: UserProfile = {
  name: "Guest",
  email: "",
  isLoggedIn: false,
  targetCompany: "Google",
  roleDepth: "Mid-level",
  prepWeeks: 4,
  diagnosticCompleted: false,
  radarScores: {
    correctness: 0,
    speed: 0,
    architecture: 0,
    communication: 0,
  },
};

const initialHistory: InterviewSession[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    return localStorage.getItem("antigravity_token");
  });

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem("antigravity_token", token);
    } else {
      localStorage.removeItem("antigravity_token");
    }
  };

  const [user, setUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem("antigravity_user");
    return stored ? JSON.parse(stored) : defaultUser;
  });

  const [streak, setStreak] = useState<number>(() => {
    const stored = localStorage.getItem("antigravity_streak");
    return stored ? parseInt(stored, 10) : 14;
  });

  const [history, setHistory] = useState<InterviewSession[]>(() => {
    const stored = localStorage.getItem("antigravity_history");
    return stored ? JSON.parse(stored) : initialHistory;
  });

  const fetchHistory = async () => {
    if (!accessToken) return;
    try {
      const res = await apiFetch("/interviews?limit=50");
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch interview history from API, falling back to local state.", err);
    }
  };

  const [recommendation, setRecommendation] = useState<any>(null);

  const fetchRoadmapProgress = async () => {
    if (!accessToken) return;
    try {
      const res = await apiFetch("/roadmap/progress");
      const data = await res.json();
      if (res.ok && data.success && data.data?.completedNodes) {
        setRoadmapCompletedNodes(data.data.completedNodes);
      }
    } catch (err) {
      console.error("Failed to fetch roadmap progress:", err);
    }
  };

  const updateRoadmapProgress = async (nodeId: string, completed: boolean) => {
    if (!accessToken) {
      setRoadmapCompletedNodes((prev) => {
        const next = completed
          ? [...prev.filter((id) => id !== nodeId), nodeId]
          : prev.filter((id) => id !== nodeId);
        return next;
      });
      return;
    }
    try {
      const res = await apiFetch("/roadmap/progress", {
        method: "POST",
        body: JSON.stringify({ nodeId, completed }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.completedNodes) {
        setRoadmapCompletedNodes(data.data.completedNodes);
      }
    } catch (err) {
      console.error("Failed to update roadmap progress:", err);
      setRoadmapCompletedNodes((prev) => {
        const next = completed
          ? [...prev.filter((id) => id !== nodeId), nodeId]
          : prev.filter((id) => id !== nodeId);
        return next;
      });
    }
  };

  const pingStreak = async () => {
    if (!accessToken) return;
    try {
      const res = await apiFetch("/users/me/streak", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user);
        setStreak(data.data.user.streakCount);
      }
    } catch (err) {
      console.error("Failed to ping streak:", err);
    }
  };

  const toggleManualQuestion = async (questionId: string, completed: boolean) => {
    if (!accessToken) return;
    try {
      const res = await apiFetch("/users/me/manual-questions", {
        method: "POST",
        body: JSON.stringify({ questionId, completed }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user);
      }
    } catch (err) {
      console.error("Failed to toggle manual question:", err);
    }
  };

  const fetchRecommendations = async () => {
    if (!accessToken) return;
    try {
      const res = await apiFetch("/questions/recommended");
      const data = await res.json();
      if (res.ok && data.success && data.data?.question) {
        const q = data.data.question;
        let timeLimit = 30;
        if (q.difficulty === "Easy") timeLimit = 20;
        if (q.difficulty === "Medium") timeLimit = 30;
        if (q.difficulty === "Hard") timeLimit = 45;

        const mapped = {
          title: q.title,
          desc: q.description,
          type: q.category === "System_Design" ? "System Design" : q.category,
          challenge: {
            id: q.id,
            title: q.title,
            type: q.category === "System_Design" ? "System Design" : q.category,
            difficulty: q.difficulty,
            timeLimit,
            description: q.description,
            codeTemplate: q.starterCode || "",
            optimalCode: q.expectedApproach || "",
            examples: q.examples || [],
            constraints: q.constraints || []
          }
        };
        setRecommendation(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch roadmap recommendations:", err);
    }
  };

  const fetchRandomChallenge = async (category?: string, navigateTo?: (path: string) => void) => {
    try {
      const url = category
        ? `/questions/random?category=${category}`
        : "/questions/random";
      const res = await apiFetch(url);
      const data = await res.json();
      if (res.ok && data.success && data.data?.question) {
        const q = data.data.question;
        let timeLimit = 30;
        if (q.difficulty === "Easy") timeLimit = 20;
        if (q.difficulty === "Medium") timeLimit = 30;
        if (q.difficulty === "Hard") timeLimit = 45;

        const mappedChallenge = {
          id: q.id,
          title: q.title,
          type: q.category === "System_Design" ? "System Design" : q.category,
          difficulty: q.difficulty,
          timeLimit,
          description: q.description,
          codeTemplate: q.starterCode || "",
          optimalCode: q.expectedApproach || "",
          examples: q.examples || [],
          constraints: q.constraints || []
        };

        setActiveChallenge(mappedChallenge);
        if (navigateTo) navigateTo("/workspace");
      }
    } catch (err) {
      console.error("Failed to fetch random challenge:", err);
    }
  };

  const [prepGuidesCache, setPrepGuidesCache] = useState<{
    Behavioral: { steps: string[]; count: number; completedIndices: number[] } | null;
    Technical: { steps: string[]; count: number; completedIndices: number[] } | null;
  }>(() => {
    return { Behavioral: null, Technical: null };
  });

  const [isGeneratingGuide, setIsGeneratingGuide] = useState({ Behavioral: false, Technical: false });

  const updatePrepGuideProgress = async (category: "Behavioral" | "Technical", completedIndices: number[]) => {
    setPrepGuidesCache(prev => {
      if (!prev[category]) return prev;
      return { ...prev, [category]: { ...prev[category]!, completedIndices } };
    });
    try {
      await apiFetch(`/ai/prep-guide/${category}/progress`, {
        method: "PUT",
        body: JSON.stringify({ completedIndices })
      });
    } catch (err) {
      console.error(`Failed to update ${category} progress`, err);
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn || !accessToken) return;
    
    const hrCount = history.filter(h => h.type === "Behavioral").length;
    const techCount = history.filter(h => h.type === "DSA" || h.type === "System Design").length;

    const syncPrepGuide = async (category: "Behavioral" | "Technical", currentCount: number) => {
      setIsGeneratingGuide(prev => ({ ...prev, [category]: true }));
      try {
        // First try to fetch from DB
        const getRes = await apiFetch(`/ai/prep-guide/${category}`);
        const getData = await getRes.json();
        
        let dbHistoryCount = -1;
        if (getRes.ok && getData.success && getData.data?.prepSteps) {
          const { prepSteps, completedIndices, historyCount } = getData.data;
          dbHistoryCount = historyCount;
          
          // Always set the cache with what we have from DB so it doesn't disappear on refresh
          setPrepGuidesCache(prev => ({
            ...prev,
            [category]: { steps: prepSteps, count: historyCount, completedIndices: completedIndices || [] }
          }));
          
          if (historyCount >= currentCount) {
            return; // Up to date!
          }
        }
        
        // If no guide found or out of date, generate a new one
        if (currentCount > 0 && currentCount > dbHistoryCount) {
          const res = await apiFetch("/ai/prep-guide", {
            method: "POST",
            body: JSON.stringify({ history, category })
          });
          const data = await res.json();
          if (res.ok && data.success && data.data?.prepSteps) {
            setPrepGuidesCache(prev => ({
              ...prev,
              [category]: { steps: data.data.prepSteps, count: currentCount, completedIndices: [] } // Generate resets completion or we could keep it, backend handles it
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to sync ${category} prep guide:`, err);
      } finally {
        setIsGeneratingGuide(prev => ({ ...prev, [category]: false }));
      }
    };

    if (hrCount > 0 && (!prepGuidesCache.Behavioral || prepGuidesCache.Behavioral.count !== hrCount)) {
      syncPrepGuide("Behavioral", hrCount);
    } else if (!prepGuidesCache.Behavioral) {
      syncPrepGuide("Behavioral", hrCount);
    }

    if (techCount > 0 && (!prepGuidesCache.Technical || prepGuidesCache.Technical.count !== techCount)) {
      syncPrepGuide("Technical", techCount);
    } else if (!prepGuidesCache.Technical) {
      syncPrepGuide("Technical", techCount);
    }
  }, [history, user.isLoggedIn, accessToken]);

  useEffect(() => {
    if (user.isLoggedIn) {
      fetchHistory();
      fetchRoadmapProgress();
      fetchRecommendations();
    }
  }, [user.isLoggedIn, accessToken]);

  const [activeChallenge, setActiveChallengeState] = useState<any>(() => {
    const stored = localStorage.getItem("antigravity_active_challenge");
    return stored ? JSON.parse(stored) : null;
  });

  const setActiveChallenge = (challenge: any) => {
    setActiveChallengeState(challenge);
    if (challenge) {
      localStorage.setItem("antigravity_active_challenge", JSON.stringify(challenge));
    } else {
      localStorage.removeItem("antigravity_active_challenge");
    }
  };

  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewSession | null>(null);
  const [currentEvaluationId, setCurrentEvaluationIdState] = useState<string | null>(() => {
    return localStorage.getItem("antigravity_eval_id");
  });

  const setCurrentEvaluationId = (id: string | null) => {
    setCurrentEvaluationIdState(id);
    if (id) {
      localStorage.setItem("antigravity_eval_id", id);
    } else {
      localStorage.removeItem("antigravity_eval_id");
    }
  };
  const [activePersona, setActivePersona] = useState<"Nitpicker" | "Coach" | "Silent" | "Interrupter">("Coach");
  const [stressActive, setStressActive] = useState<boolean>(false);
  const [roadmapCompletedNodes, setRoadmapCompletedNodes] = useState<string[]>(() => {
    const stored = localStorage.getItem("antigravity_roadmap_nodes");
    return stored ? JSON.parse(stored) : ["dsa-basics", "sys-design-basics"];
  });

  const [themeAccent, setThemeAccentState] = useState<"cyan" | "blue" | "purple" | "emerald" | "rose">(
    () => (localStorage.getItem("antigravity_theme") as any) || "cyan"
  );

  const [themeMode, setThemeModeState] = useState<"dark" | "light">(
    () => (localStorage.getItem("antigravity_mode") as any) || "dark"
  );

  const setThemeAccent = (accent: "cyan" | "blue" | "purple" | "emerald" | "rose") => {
    setThemeAccentState(accent);
    localStorage.setItem("antigravity_theme", accent);
  };

  const setThemeMode = (mode: "dark" | "light") => {
    setThemeModeState(mode);
    localStorage.setItem("antigravity_mode", mode);
  };

  useEffect(() => {
    localStorage.setItem("antigravity_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("antigravity_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("antigravity_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("antigravity_roadmap_nodes", JSON.stringify(roadmapCompletedNodes));
  }, [roadmapCompletedNodes]);

  useEffect(() => {
    const root = document.documentElement;
    const colors: Record<string, any> = {
      orange: { primary: "#F97316", hover: "#EA580C", glow: "rgba(249, 115, 22, 0.15)", shadow: "rgba(249, 115, 22, 0.2)", rgb: "249, 115, 22" }, // Orange (Vibrant)
      coral: { primary: "#FF6B00", hover: "#E05E00", glow: "rgba(255, 107, 0, 0.15)", shadow: "rgba(255, 107, 0, 0.2)", rgb: "255, 107, 0" }, // Coral (TakeUForward)
      amber: { primary: "#F59E0B", hover: "#D97706", glow: "rgba(245, 158, 11, 0.15)", shadow: "rgba(245, 158, 11, 0.2)", rgb: "245, 158, 11" }, // Amber (Golden)
      rust: { primary: "#C2410C", hover: "#9A3412", glow: "rgba(194, 65, 12, 0.15)", shadow: "rgba(194, 65, 12, 0.2)", rgb: "194, 65, 12" }, // Rust (Deep)
      sunset: { primary: "#F43F5E", hover: "#E11D48", glow: "rgba(244, 63, 94, 0.15)", shadow: "rgba(244, 63, 94, 0.2)", rgb: "244, 63, 94" } // Sunset (Red-Orange)
    };
    const c = colors[themeAccent] || colors.orange;
    root.style.setProperty("--accent-primary", c.primary);
    root.style.setProperty("--accent-hover", c.hover);
    root.style.setProperty("--accent-glow", c.glow);
    root.style.setProperty("--accent-shadow", c.shadow);
    root.style.setProperty("--accent-rgb", c.rgb);
  }, [themeAccent]);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [themeMode]);

  const resetProgress = () => {
    setUser(defaultUser);
    setStreak(14);
    setHistory(initialHistory);
    setRoadmapCompletedNodes(["dsa-basics", "sys-design-basics"]);
    setThemeAccent("cyan");
    setThemeMode("dark");
    localStorage.removeItem("antigravity_screen");
    localStorage.removeItem("antigravity_token");
    setAccessToken(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        streak,
        setStreak,
        history,
        setHistory,
        activeChallenge,
        setActiveChallenge,
        currentEvaluation,
        setCurrentEvaluation,
        currentEvaluationId,
        setCurrentEvaluationId,
        activePersona,
        setActivePersona,
        stressActive,
        setStressActive,
        roadmapCompletedNodes,
        setRoadmapCompletedNodes,
        themeAccent,
        setThemeAccent,
        themeMode,
        setThemeMode,
        resetProgress,
        accessToken,
        setAccessToken,
        fetchHistory,
        fetchRoadmapProgress,
        updateRoadmapProgress,
        recommendation,
        fetchRecommendations,
        fetchRandomChallenge,
        prepGuidesCache,
        isGeneratingGuide,
        updatePrepGuideProgress,
        pingStreak,
        toggleManualQuestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
