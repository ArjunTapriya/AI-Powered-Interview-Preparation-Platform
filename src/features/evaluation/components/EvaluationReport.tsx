import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, type InterviewSession } from "../../../store/AppContext";
import { apiFetch } from "../../../utils/apiFetch";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import {
  Play,
  Pause,
  AlertTriangle,
  FileCode,
  MessageSquare,
  Award,
  ArrowLeft,
  TrendingUp,
  ChevronRight
} from "lucide-react";

export const EvaluationReport: React.FC = () => {
  const navigate = useNavigate();
  const { currentEvaluation, currentEvaluationId, setCurrentEvaluation, setCurrentEvaluationId, history } = useApp() as any;

  // All hook declarations first (Unconditional)
  const [localSession, setLocalSession] = useState<InterviewSession | null>(currentEvaluation);
  const [loading, setLoading] = useState(!currentEvaluation && !!currentEvaluationId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [activeDiffLine, setActiveDiffLine] = useState<number | null>(null);
  const playInterval = useRef<any>(null);

  useEffect(() => {
    if (!currentEvaluationId) {
      setLocalSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch(`/interviews/${currentEvaluationId}/report`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data?.session) {
          // Provide defaults for UI rendering if any fields are missing
          const fullSession: InterviewSession = {
            ...data.data.session,
            optimalCode: data.data.session.optimalCode || "function solve() {\n  // Optimal solution layout\n}",
            codeSnippet: data.data.session.codeSnippet || "// user solution",
            transcript: data.data.session.transcript || [
              { speaker: "Interviewer", text: "Explain your design topology.", timestamp: "0:05" },
              { speaker: "Candidate", text: "Uhm, basically, we scale using a cache replica.", timestamp: "0:12", isFiller: true }
            ]
          };
          setLocalSession(fullSession);
          if (setCurrentEvaluation) setCurrentEvaluation(fullSession);
        }
      })
      .catch((err) => {
        console.error("Error loading report from Supabase:", err);
      })
      .finally(() => setLoading(false));
  }, [currentEvaluationId]);

  // Audio Playback scrubber logic
  const maxTimeSec = 120; // 2 mins simulation
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= maxTimeSec) {
            setIsPlaying(false);
            clearInterval(playInterval.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playInterval.current) clearInterval(playInterval.current);
    }
    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying]);

  // Conditional early returns (after all hooks run)
  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-mono animate-pulse">Loading report from PostgreSQL...</div>;
  }

  // If no report ID is selected, show the history list representation
  if (!currentEvaluationId) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto px-4 pt-0 pb-6 text-left">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] text-gray-400 hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all mb-4"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="grid grid-cols-1 gap-4">
          {history && history.length > 0 ? (
            history.map((session: any, idx: number) => {
              const score = session.overallScore !== undefined ? session.overallScore : (session.score !== undefined ? session.score : 0);
              const duration = session.durationMin !== undefined ? session.durationMin : (session.duration !== undefined ? session.duration : 0);
              const dateStr = new Date(session.createdAt || session.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <Card
                  key={session.id || idx}
                  onClick={() => {
                    if (setCurrentEvaluationId) setCurrentEvaluationId(session.id);
                  }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface-solid border-surface-border hover:border-[var(--accent-primary)]/40 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[rgba(var(--accent-rgb),0.1)] text-[var(--accent-primary)] border border-[rgba(var(--accent-rgb),0.2)] text-[10px] font-bold uppercase tracking-wider">
                        {session.interviewType || session.type || "Practice"}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {dateStr}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">
                      {session.company || "Uploaded Resume Practice"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Duration: {duration} min
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {score}
                      </span>
                      <span className="text-gray-500 text-xs"> / 100</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Overall Score</p>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-[var(--accent-primary)]/10 group-hover:border-[var(--accent-primary)]/20 transition-colors">
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--accent-primary)] transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-surface-solid border border-surface-border rounded-xl">
              <p className="text-gray-500 text-sm font-mono mb-4">No evaluation reports found in the database.</p>
              <Button onClick={() => navigate("/interview-practice")} variant="primary">
                Take a Mock Interview
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If report ID is selected, calculate and render scorecard details
  const foundSession = history?.find((s: any) => s.id === currentEvaluationId);
  const session: InterviewSession = localSession || foundSession || currentEvaluation || {
    id: "session-fallback",
    company: "Google",
    date: new Date().toISOString().split("T")[0],
    type: "DSA",
    overallScore: 71,
    metrics: { correctness: 68, speed: 50, architecture: 75, communication: 62 },
    durationMin: 18,
    codeSnippet: `function twoSum(nums: number[], target: number): number[] {\n    // Brute force approach\n    for(let i=0; i<nums.length; i++) {\n        for(let j=i+1; j<nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                return [i, j];\n            }\n        }\n    }\n    return [];\n}`,
    optimalCode: `function twoSum(nums: number[], target: number): number[] {\n    // Optimal Hash Map approach O(N) time and O(N) space\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
    feedbackNotes: [
      "Brute force solution works but runs in O(N^2) time complexity.",
      "The optimal path requires a single-pass hash map which runs in linear time.",
      "Verbal transcripts indicate frequent pause markers ('actually', 'uhm') during critical code updates.",
      "Identified array boundary conditions correctly during dry runs."
    ],
    transcript: [
      { speaker: "Interviewer", text: "Welcome, let's explore the Two Sum problem.", timestamp: "0:00" },
      { speaker: "Candidate", text: "I will write a nested loop to check all pairs first.", timestamp: "0:15", isFiller: false },
      { speaker: "Interviewer", text: "What is the time complexity of that nested approach?", timestamp: "0:45", isFiller: false },
      { speaker: "Candidate", text: "Actually, it would be O(N^2) because we iterate twice, you know, over the items.", timestamp: "0:52", isFiller: true },
      { speaker: "Interviewer", text: "Can we reduce this to linear O(N) time?", timestamp: "1:20", isFiller: false },
      { speaker: "Candidate", text: "Uhm, basically if we keep a Map of indices we already saw, we can do it in one pass.", timestamp: "1:35", isFiller: true }
    ]
  };

  const formatSec = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Click transcript block to jump
  const handleTranscriptClick = (timeStr: string) => {
    const [m, s] = (timeStr || "0:00").split(":").map(Number);
    const targetSec = m * 60 + s;
    setCurrentTimeSec(targetSec);
    setIsPlaying(true);
  };

  // Check if transcript is active based on simulated scrubber timestamp
  const getActiveTranscriptIndex = () => {
    if (!session.transcript) return -1;
    // Map timestamps
    const secondsArray = session.transcript.map((item) => {
      const [m, s] = (item?.timestamp || "0:00").split(":").map(Number);
      return m * 60 + s;
    });

    let activeIdx = 0;
    for (let i = 0; i < secondsArray.length; i++) {
      if (currentTimeSec >= secondsArray[i]) {
        activeIdx = i;
      }
    }
    return activeIdx;
  };

  const activeTranscriptIdx = getActiveTranscriptIndex();

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto px-4 pt-0 pb-6 text-left">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (setCurrentEvaluationId) {
                setCurrentEvaluationId(null);
              } else {
                navigate("/dashboard");
              }
            }}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] text-gray-400 hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all"
            title="Back to Reports History"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white m-0">Performance Review</h2>
            <p className="text-gray-400 mt-0.5 text-xs m-0">
              Analysis scorecards for mock run on {session.company} ({session.type}) completed.
            </p>
          </div>
        </div>

        <Button onClick={() => navigate("/roadmap")} variant="glow" size="sm" className="gap-1.5">
          Go to Roadmap <TrendingUp size={15} />
        </Button>
      </div>

      {/* Overview stats layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall score card */}
        <Card className="lg:col-span-1 bg-gradient-to-tr from-[rgba(var(--accent-rgb),0.12)] via-surface-solid to-slate-950/40 border-[rgba(var(--accent-rgb),0.2)] flex flex-col items-center justify-center p-8 space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--accent-primary)] font-mono">Overall Diagnostic Score</span>
          <div className="relative flex items-center justify-center">
            {/* Round SVGs score indicators */}
            <svg width="150" height="150" className="rotate-[-90deg]">
              <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="8"
                strokeDasharray={376.8}
                strokeDashoffset={376.8 - (376.8 * session.overallScore) / 100}
                className="filter drop-shadow-[0_0_6px_var(--accent-glow)] transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tighter">{session.overallScore}</span>
              <span className="text-gray-400 font-semibold block text-xs">/ 100</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-mono">Calculated across 4 vector channels</span>
        </Card>

        {/* Detailed vector bars progress */}
        <Card className="lg:col-span-2 space-y-5">
          <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider">Metrics Vector breakdown</h3>
          <div className="space-y-4 font-mono">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Code Correctness & Complexity</span>
                <span className="text-[var(--accent-primary)] font-bold">{session.metrics.correctness}%</span>
              </div>
              <ProgressBar value={session.metrics.correctness} size="sm" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Distributed Architectural Logic</span>
                <span className="text-[var(--accent-primary)] font-bold">{session.metrics.architecture}%</span>
              </div>
              <ProgressBar value={session.metrics.architecture} size="sm" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Speech Articulation & Clarity</span>
                <span className="text-[var(--accent-primary)] font-bold">{session.metrics.communication}%</span>
              </div>
              <ProgressBar value={session.metrics.communication} size="sm" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Coding Speed & Refactoring Velocity</span>
                <span className="text-[var(--accent-primary)] font-bold">{session.metrics.speed}%</span>
              </div>
              <ProgressBar value={session.metrics.speed} size="sm" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Diff Code Section and Transcripts timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Code comparison Diff viewer (7/12 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          <Card className="p-0 flex-grow flex flex-col bg-slate-950/40">
            <div className="px-5 py-3 border-b border-surface-border bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode size={16} /> Code comparison diff
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Select any line to read remediation lessons</span>
            </div>

            {/* Split diff tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono overflow-x-auto divide-y md:divide-y-0 md:divide-x divide-surface-border">
              {/* User code */}
              <div className="p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-3 border-b border-rose-500/10 pb-1.5 flex justify-between">
                  <span>Your submission</span>
                  <span>O(N^2)</span>
                </div>
                {session.codeSnippet?.split("\n").map((line, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveDiffLine(idx + 1)}
                    className={`h-5 leading-5 hover:bg-white/5 px-2.5 rounded cursor-pointer transition-colors ${
                      activeDiffLine === idx + 1 ? "bg-white/10 text-white font-bold" : "text-gray-400"
                    } ${
                      line.includes("for") ? "bg-rose-950/20 text-rose-200 border-l-2 border-rose-500" : ""
                    }`}
                  >
                    <span className="text-gray-500 w-5 inline-block mr-1.5 text-right">{idx + 1}</span>
                    {line}
                  </div>
                ))}
              </div>

              {/* Optimal solution code */}
              <div className="p-4 space-y-1 bg-[rgba(var(--accent-rgb),0.03)]">
                <div className="text-[10px] uppercase font-bold text-[var(--accent-primary)] tracking-widest mb-3 border-b border-[rgba(var(--accent-rgb),0.1)] pb-1.5 flex justify-between">
                  <span>Optimal Solution</span>
                  <span>O(N)</span>
                </div>
                {session.optimalCode?.split("\n").map((line, idx) => (
                  <div
                    key={idx}
                    className={`h-5 leading-5 px-2.5 rounded text-gray-400 ${
                      line.includes("Map") || line.includes("has") ? "bg-emerald-950/20 text-emerald-200 border-l-2 border-emerald-500" : ""
                    }`}
                  >
                    <span className="text-gray-500 w-5 inline-block mr-1.5 text-right">{idx + 1}</span>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Differential notes details */}
            {activeDiffLine && (
              <div className="p-4 border-t border-surface-border bg-[rgba(var(--accent-rgb),0.1)] text-xs font-mono text-[var(--accent-primary)]">
                <div className="flex items-center justify-between font-bold mb-1 uppercase text-[10px] tracking-wider text-[var(--accent-primary)]">
                  <span>Line {activeDiffLine} review point</span>
                  <button onClick={() => setActiveDiffLine(null)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <p className="leading-relaxed">
                  Nested iteration loops check all permutations of numbers. This consumes quadratic execution time. Re-structuring with dynamic hash indexes eliminates sub-iterations.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Timeline Speech Tracker & Audio controls (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <Card className="p-0 flex-grow flex flex-col bg-slate-950/40">
            {/* Audio scrubber controls */}
            <div className="px-5 py-4 border-b border-surface-border bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={16} /> Timeline Speech Tracker
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-full bg-[rgba(var(--accent-rgb),0.1)] hover:bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-primary)] border border-[rgba(var(--accent-rgb),0.2)] transition-all focus:outline-none"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-[var(--accent-primary)]" />}
                </button>
                <span className="text-xs font-mono text-gray-400 font-bold">{formatSec(currentTimeSec)} / {formatSec(maxTimeSec)}</span>
              </div>
            </div>

            {/* Scrubber tracker progress track */}
            <div
              className="h-1 bg-white/5 w-full cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const offset = e.clientX - rect.left;
                const ratio = offset / rect.width;
                setCurrentTimeSec(Math.round(ratio * maxTimeSec));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)]"
                style={{ width: `${(currentTimeSec / maxTimeSec) * 100}%` }}
              />
            </div>

            {/* Transcripts dialogue blocks */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3.5 max-h-[300px]">
              {session.transcript?.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTranscriptClick(item.timestamp)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    idx === activeTranscriptIdx
                      ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.15)] text-white shadow-[0_0_10px_var(--accent-glow)] font-medium"
                      : "border-surface-border bg-white/5 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                    <span className={item.speaker === "Candidate" ? "text-[var(--accent-primary)] font-bold" : "text-amber-400 font-bold"}>
                      {item.speaker}
                    </span>
                    <span className="text-gray-400">{item.timestamp}</span>
                  </div>
                  <p className="leading-relaxed leading-5 text-gray-200">
                    {/* Parse speech filler words */}
                    {item.text.split(" ").map((word, wordIdx) => {
                      const cleanWord = word.toLowerCase().replace(/[^a-zA-Z]/g, "");
                      const isFiller = ["actually", "uhm", "basically", "like", "you", "know"].includes(cleanWord);
                      return (
                        <span
                          key={wordIdx}
                          className={isFiller ? "text-amber-400 font-bold underline decoration-amber-500/50 cursor-help" : ""}
                          title={isFiller ? "Filler word detected" : undefined}
                        >
                          {word}{" "}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Remediation / Feedback cards */}
          <Card className="space-y-4">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-300 flex items-center gap-1.5">
              <Award size={14} className="text-[var(--accent-primary)]" /> Actionable Remediation Points
            </h4>
            <div className="space-y-2 text-xs">
              {session.feedbackNotes?.map((note, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded bg-white/5 border border-white/5 text-gray-300 leading-relaxed">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
