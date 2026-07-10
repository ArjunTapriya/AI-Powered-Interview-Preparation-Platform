import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, type InterviewSession } from "../../../store/AppContext";
import { apiFetch } from "../../../utils/apiFetch";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import {
  CheckCircle,
  FileText,
  Trash2,
  Clock,
  MessageSquare
} from "lucide-react";
import { StressSimulator } from "./StressSimulator";

// Helper to decode HTML entities
const decodeHtml = (html: string): string => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent || html;
  } catch (e) {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ');
  }
};

interface ParsedChallenge {
  description: string;
  examples: { title: string; input: string; output: string; explanation?: string }[];
  constraints: string[];
}

const parseChallengeContent = (challenge: any): ParsedChallenge => {
  const decodedFull = decodeHtml(challenge.description || "");

  // Detect if examples are embedded in the description
  const exampleRegex = /Example\s+(\d+)\s*:/gi;
  const hasEmbeddedExamples = exampleRegex.test(decodedFull);
  exampleRegex.lastIndex = 0;

  if (!hasEmbeddedExamples) {
    return {
      description: decodedFull,
      examples: (challenge.examples || []).map((ex: any, idx: number) => ({
        title: `Example ${idx + 1}`,
        input: ex.input || "",
        output: ex.output || "",
        explanation: ex.explanation || "",
      })),
      constraints: challenge.constraints || [],
    };
  }

  const firstExampleIndex = decodedFull.search(/Example\s+1\s*:/i);
  let mainDesc = decodedFull;
  let remainingText = "";

  if (firstExampleIndex !== -1) {
    mainDesc = decodedFull.substring(0, firstExampleIndex).trim();
    remainingText = decodedFull.substring(firstExampleIndex).trim();
  }

  const constraintsIndex = remainingText.search(/Constraints\s*:/i);
  let examplesPart = remainingText;
  let constraintsPart = "";

  if (constraintsIndex !== -1) {
    examplesPart = remainingText.substring(0, constraintsIndex).trim();
    constraintsPart = remainingText.substring(constraintsIndex).trim();
  }

  const exampleMatches = [...examplesPart.matchAll(/Example\s+(\d+)\s*:/gi)];
  const parsedExamples: any[] = [];

  for (let i = 0; i < exampleMatches.length; i++) {
    const match = exampleMatches[i];
    const num = match[1];
    const startIndex = match.index! + match[0].length;
    const endIndex = i + 1 < exampleMatches.length ? exampleMatches[i + 1].index : examplesPart.length;
    const exampleBody = examplesPart.substring(startIndex, endIndex).trim();

    let input = "";
    let output = "";
    let explanation = "";

    const lines = exampleBody.split("\n");
    let currentKey: "input" | "output" | "explanation" | null = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("Input:")) {
        input = trimmed.replace("Input:", "").trim();
        currentKey = "input";
      } else if (trimmed.startsWith("Output:")) {
        output = trimmed.replace("Output:", "").trim();
        currentKey = "output";
      } else if (trimmed.startsWith("Explanation:")) {
        explanation = trimmed.replace("Explanation:", "").trim();
        currentKey = "explanation";
      } else if (trimmed) {
        if (currentKey === "input") {
          input += "\n" + trimmed;
        } else if (currentKey === "output") {
          output += "\n" + trimmed;
        } else if (currentKey === "explanation") {
          explanation += "\n" + trimmed;
        }
      }
    }

    parsedExamples.push({
      title: `Example ${num}`,
      input: input.trim(),
      output: output.trim(),
      explanation: explanation.trim(),
    });
  }

  const parsedConstraints: string[] = [];
  if (constraintsPart) {
    const cleanConstraints = constraintsPart.replace(/Constraints\s*:/i, "").trim();
    const lines = cleanConstraints.split("\n");
    for (let line of lines) {
      const trimmed = line.trim().replace(/^\s*[\t•\-*]\s*/, "").trim();
      if (trimmed) {
        parsedConstraints.push(trimmed);
      }
    }
  }

  return {
    description: mainDesc,
    examples: parsedExamples,
    constraints: parsedConstraints,
  };
};

export const PracticeWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeChallenge,
    setCurrentEvaluation,
    setHistory,
    activePersona,
    stressActive,
    setStreak,
    themeAccent,
    accessToken,
    updateRoadmapProgress
  } = useApp();

  // If no challenge loaded, provide a fallback DSA one
  const challenge = activeChallenge || {
    id: "dsa-fallback",
    title: "Reverse a Linked List",
    type: "DSA",
    difficulty: "Easy",
    timeLimit: 30,
    description: "Given the head of a singly linked list, reverse the list, and return its reversed list.",
    codeTemplate: "function reverseList(head: ListNode | null): ListNode | null {\n    let prev: ListNode | null = null;\n    let curr = head;\n    \n    return prev;\n}",
    optimalCode: "function reverseList(head: ListNode | null): ListNode | null {\n    let prev: ListNode | null = null;\n    let curr = head;\n    while (curr !== null) {\n        let nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}",
    transcript: [
      { speaker: "Interviewer", text: "Can you explain the temporal complexity of your reversed solution?" },
      { speaker: "Candidate", text: "It runs in O(N) because we iterate through the list elements, uh, exactly once.", isFiller: false },
      { speaker: "Interviewer", text: "And space complexity?", isFiller: false },
      { speaker: "Candidate", text: "Uhm, it would be, like, O(1) auxiliary space since we only adjust the references.", isFiller: true }
    ]
  };

  const parsed = parseChallengeContent(challenge);

  // State Management
  const [leftTab, setLeftTab] = useState<"instructions" | "whiteboard">("instructions");
  const [code, setCode] = useState(challenge.codeTemplate);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit * 60);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [codeMap, setCodeMap] = useState<Record<string, string>>({
    javascript: challenge.codeTemplate || "",
  });

  const [chatLog, setChatLog] = useState<{ speaker: string; text: string; time: string }[]>([
    {
      speaker: "Interviewer",
      text: `Hello, Arjun. I'm your interviewer today. Let's look at "${challenge.title}". Please explain your approach as you write the code.`,
      time: "0:00"
    }
  ]);
  // Canvas Drawing States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawTool, setDrawTool] = useState<"pen" | "rect" | "arrow" | "text" | "eraser">("pen");
  const [drawColor, setDrawColor] = useState("#06B6D4");
  const [isDrawing, setIsDrawing] = useState(false);
  const drawStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const defaultColors = {
      cyan: "#06B6D4",
      blue: "#3B82F6",
      purple: "#8B5CF6",
      emerald: "#10B981",
      rose: "#F43F5E"
    };
    setDrawColor(defaultColors[themeAccent]);
  }, [themeAccent]);



  // Line numbers setup
  const [lineCount, setLineCount] = useState(1);
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines);
  }, [code]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };



  // Sync when challenge changes
  useEffect(() => {
    setCode(challenge.codeTemplate || "");
    setLanguage("javascript");
    setCodeMap({
      javascript: challenge.codeTemplate || "",
    });
    setStdin("");
    setConsoleOutput([]);
  }, [challenge.id]);

  const getStarterCode = (challengeTitle: string, lang: string, originalCode: string) => {
    const title = challengeTitle.toLowerCase();
    if (lang === "javascript") {
      return originalCode || "function solve() {\n  \n}";
    }
    if (title.includes("two sum")) {
      if (lang === "python") return "def twoSum(nums, target):\n    return []";
      if (lang === "cpp") return "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n}";
      if (lang === "java") return "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[0];\n    }\n}";
    } else if (title.includes("reverse a linked list") || title.includes("reverse list")) {
      if (lang === "python") return "# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\ndef reverseList(head):\n    return None";
      if (lang === "cpp") return "ListNode* reverseList(ListNode* head) {\n    return nullptr;\n}";
      if (lang === "java") return "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}";
    } else if (title.includes("merge k sorted lists") || title.includes("merge k lists")) {
      if (lang === "python") return "def mergeKLists(lists):\n    return None";
      if (lang === "cpp") return "ListNode* mergeKLists(vector<ListNode*>& lists) {\n    return nullptr;\n}";
      if (lang === "java") return "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        return null;\n    }\n}";
    } else if (title.includes("lru cache")) {
      if (lang === "python") return "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass";
      if (lang === "cpp") return "class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};";
      if (lang === "java") return "class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}";
    } else if (title.includes("longest substring without repeating")) {
      if (lang === "python") return "def lengthOfLongestSubstring(s: str) -> int:\n    return 0";
      if (lang === "cpp") return "#include <string>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    return 0;\n}";
      if (lang === "java") return "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}";
    }

    if (lang === "python") return "def solve(data):\n    return None";
    if (lang === "cpp") return "#include <iostream>\nusing namespace std;\n\nint solve(int data) {\n    return 0;\n}";
    if (lang === "java") return "class Solution {\n    public int solve(int data) {\n        return 0;\n    }\n}";
    return originalCode;
  };

  const handleLanguageChange = (newLang: string) => {
    setCodeMap((prev) => ({ ...prev, [language]: code }));
    if (codeMap[newLang]) {
      setCode(codeMap[newLang]);
    } else {
      const template = getStarterCode(challenge.title, newLang, challenge.codeTemplate || "");
      setCode(template);
      setCodeMap((prev) => ({ ...prev, [newLang]: template }));
    }
    setLanguage(newLang);
  };

  // Handle Compiler Run
  const handleCompileCode = async () => {
    if (!accessToken) {
      setConsoleOutput(["Please sign in to execute code in the compiler."]);
      return;
    }
    setIsCompiling(true);
    setConsoleOutput(["Compiling files and running code in the Judge0 sandbox..."]);

    try {
      const response = await apiFetch("/code/run", {
        method: "POST",
        body: JSON.stringify({
          language,
          sourceCode: code,
          stdin,
        }),
      });

      const data = await response.json();
      setIsCompiling(false);

      if (response.ok && data.success) {
        const result = data.data;
        const outputLines = [
          `Status: ${result.status}`,
          result.runtime !== null && result.runtime !== undefined ? `Execution time: ${result.runtime.toFixed(1)} ms` : "",
          result.memory !== null && result.memory !== undefined ? `Memory used: ${result.memory} KB` : "",
          "",
        ];

        if (result.stdout) {
          outputLines.push("Output:");
          outputLines.push(result.stdout);
        }
        if (result.stderr) {
          outputLines.push("Error:");
          outputLines.push(result.stderr);
        }
        if (result.compileOutput) {
          outputLines.push("Compile Log:");
          outputLines.push(result.compileOutput);
        }

        if (!result.stdout && !result.stderr && !result.compileOutput) {
          outputLines.push("(No console output generated)");
        }

        setConsoleOutput(outputLines.filter((l) => l !== ""));
      } else {
        setConsoleOutput([
          "Execution Failed",
          data.error?.message || "Internal server error occurred."
        ]);
      }
    } catch (err: any) {
      setIsCompiling(false);
      setConsoleOutput([
        "Connection Error",
        "Failed to reach the code execution server. Ensure your backend and Judge0 docker are online.",
        err.message || ""
      ]);
    }
  };

  const handleSubmitCode = async () => {
    if (!accessToken) {
      setConsoleOutput(["Please sign in to submit your solution."]);
      return;
    }
    setIsSubmitting(true);
    setConsoleOutput(["Running test cases and validating overall solution constraints..."]);

    try {
      const response = await apiFetch(`/code/submit/${challenge.id}`, {
        method: "POST",
        body: JSON.stringify({
          language,
          sourceCode: code,
        }),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        const result = data.data;
        const outputLines = [
          `Submission Status: ${result.status}`,
          `Passed Tests: ${result.passedTests} / ${result.totalTests}`,
          result.runtime !== null && result.runtime !== undefined ? `Average execution time: ${result.runtime.toFixed(1)} ms` : "",
          result.memory !== null && result.memory !== undefined ? `Max memory used: ${result.memory} KB` : "",
          "",
        ];

        if (result.status === "ACCEPTED") {
          outputLines.push("🎉 All tests passed successfully!");
        } else {
          outputLines.push("❌ Some test cases failed.");
        }

        if (result.executionResults) {
          result.executionResults.forEach((res: any) => {
            outputLines.push(
              `${res.passed ? "✓" : "✗"} Test Case ${res.testCaseNumber}: ${res.passed ? "Success" : "Failed"}`
            );
          });
        }

        setConsoleOutput(outputLines);
      } else {
        setConsoleOutput([
          "Submission Failed",
          data.error?.message || "Internal server error occurred."
        ]);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setConsoleOutput([
        "Connection Error",
        "Failed to reach the code execution server. Ensure your backend and Judge0 docker are online.",
        err.message || ""
      ]);
    }
  };

  // Canvas Mouse drawing utilities
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    drawStart.current = coords;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawTool === "eraser" ? 20 : 2;
    ctx.lineCap = "round";

    if (drawTool === "pen" || drawTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (drawTool === "pen") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (drawTool === "eraser") {
      ctx.strokeStyle = "#0D0D11"; // Eraser uses background color
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const coords = getCanvasCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 2;

    if (drawTool === "rect") {
      const w = coords.x - drawStart.current.x;
      const h = coords.y - drawStart.current.y;
      ctx.strokeRect(drawStart.current.x, drawStart.current.y, w, h);
    } else if (drawTool === "arrow") {
      // Draw standard pointer arrow head
      const fromx = drawStart.current.x;
      const fromy = drawStart.current.y;
      const tox = coords.x;
      const toy = coords.y;
      const headlen = 10;
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (drawTool === "text") {
      const txt = prompt("Enter text component to draw on canvas:", "Load Balancer");
      if (txt) {
        ctx.fillStyle = drawColor;
        ctx.font = "12px JetBrains Mono";
        ctx.fillText(txt, coords.x, coords.y);
      }
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Stress simulator callback event triggers
  const handleStressTrigger = (questionText: string) => {
    const timestamp = formatTime(challenge.timeLimit * 60 - timeLeft);
    setChatLog((prev) => [
      ...prev,
      {
        speaker: `Interviewer (${activePersona})`,
        text: questionText,
        time: timestamp
      }
    ]);
  };

  // Submit interview
  const handleSubmitInterview = () => {
    // Generate post session analysis
    const overallScore = Math.floor(Math.random() * 20) + 65; // 65-85 score
    const correctness = Math.floor(Math.random() * 25) + 65;
    const speed = Math.floor(Math.random() * 30) + 55;
    const architecture = Math.floor(Math.random() * 20) + 70;
    const communication = Math.floor(Math.random() * 25) + 60;

    // Build evaluations session model
    const newSession: InterviewSession = {
      id: `session-user-${Date.now()}`,
      company: challenge.title,
      date: new Date().toISOString().split("T")[0],
      type: challenge.type,
      overallScore,
      durationMin: Math.round((challenge.timeLimit * 60 - timeLeft) / 60),
      metrics: { correctness, speed, architecture, communication },
      codeSnippet: code,
      optimalCode: challenge.optimalCode,
      feedbackNotes: [
        "Good algorithm structure, but could optimize loop indexes.",
        "Demonstrated solid knowledge of system edge constraints.",
        "Avoid using filler words like 'actually' or 'like' repeatedly when answering follow ups."
      ],
      transcript: [
        { speaker: "Interviewer", text: "Welcome. Let's look at the challenge.", timestamp: "0:00" },
        { speaker: "Candidate", text: "Sure, let me implement the brute force solution first.", timestamp: "0:15", isFiller: false },
        { speaker: "Interviewer", text: "Can you optimize this to linear time complexity?", timestamp: "1:20", isFiller: false },
        { speaker: "Candidate", text: "Yes, actually, if we use a hash map, we can get O(N) lookup.", timestamp: "1:40", isFiller: true },
        { speaker: "Interviewer", text: "How does distributed concurrency affect this state map?", timestamp: "3:40", isFiller: false },
        { speaker: "Candidate", text: "Uhm, we'd, like, need locks or distributed sharding queues.", timestamp: "4:05", isFiller: true }
      ]
    };

    // Map challenge.id to roadmap nodeId
    const challengeToNodeMap: Record<string, string> = {
      "dsa-recurse": "dsa-basics",
      "sys-net": "sys-design-basics",
      "dsa-sliding": "dsa-intermediate",
      "sys-cache": "sys-design-intermediate",
      "dsa-merge-k": "dsa-advanced",
      "sys-rate-limiter": "sys-design-advanced",
      "star-conflict": "star-behavioral",
    };

    const nodeId = challengeToNodeMap[challenge.id];
    if (nodeId) {
      updateRoadmapProgress(nodeId, true);
    }

    // Submit to backend if logged in
    if (accessToken) {
      apiFetch("/interviews", {
        method: "POST",
        body: JSON.stringify(newSession),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistory(prev => [data.data.session, ...prev]);
          } else {
            setHistory(prev => [newSession, ...prev]);
          }
        })
        .catch(err => {
          console.error("Failed to post session", err);
          setHistory(prev => [newSession, ...prev]);
        });
    } else {
      setHistory((prev) => [newSession, ...prev]);
    }

    setStreak((prev) => prev + 1);
    setCurrentEvaluation(newSession);
    navigate("/evaluation");
  };

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* Top action status panel */}
      <div className="flex items-center justify-between px-6 py-4 border border-surface-border bg-surface-solid/40 rounded-xl shrink-0 shadow-lg">
        <div>
          <span className="text-xs font-mono tracking-widest text-[var(--accent-primary)] uppercase font-semibold">
            Active Prep Room • {challenge.type} Loop
          </span>
          <h2 className="text-sm font-bold text-white m-0 text-left">{challenge.title}</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg">
            <Clock size={16} className={timeLeft < 300 ? "text-rose-400 animate-pulse" : "text-[var(--accent-primary)]"} />
            <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-rose-400 font-extrabold" : "text-gray-200"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <Button variant="danger" size="sm" onClick={handleSubmitInterview} className="gap-1.5">
            <CheckCircle size={15} /> Finish & Evaluate
          </Button>
        </div>
      </div>

      {/* Main Resizable split editor body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left pane: Instructions or whiteboard (4/12 cols) */}
        <div className="lg:col-span-4 border border-surface-border rounded-xl flex flex-col bg-slate-950/20 lg:h-[750px] overflow-hidden shadow-lg">
          <div className="flex border-b border-surface-border bg-surface-solid/40">
            <button
              onClick={() => setLeftTab("instructions")}
              className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${leftTab === "instructions"
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
            >
              Problem Specs
            </button>
            <button
              onClick={() => setLeftTab("whiteboard")}
              className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${leftTab === "whiteboard"
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
            >
              System Canvas
            </button>
          </div>

          {/* Left panel body scroll */}
          <div className="flex-grow overflow-y-auto bg-[#18181b] custom-scrollbar p-6">
            {leftTab === "instructions" ? (
              <div className="space-y-6 text-left text-gray-200 font-sans text-sm antialiased select-text">
                {/* Title and Difficulty Badges */}
                <div className="space-y-4 pb-4 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {challenge.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Difficulty Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${challenge.difficulty === "Hard"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : challenge.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                      {challenge.difficulty}
                    </span>

                    {/* Topics Badge */}
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z" />
                      </svg>
                      Topics
                    </button>

                    {/* Companion Badge */}
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Companion
                    </button>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-[14px] text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">
                  {parsed.description}
                </div>

                {/* Examples */}
                {parsed.examples && parsed.examples.length > 0 && (
                  <div className="space-y-5 pt-4">
                    {parsed.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <p className="font-semibold text-white text-sm">{ex.title}:</p>
                        <div className="bg-[#1f1f23]/90 border border-white/5 rounded-xl p-4 text-xs font-mono text-gray-300 space-y-2.5 shadow-inner">
                          {ex.input && (
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-400 select-none mr-2 w-12 shrink-0">Input:</span>
                              <code className="text-gray-200 select-text break-all whitespace-pre-wrap">{ex.input}</code>
                            </div>
                          )}
                          {ex.output && (
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-400 select-none mr-2 w-12 shrink-0">Output:</span>
                              <code className="text-gray-200 select-text break-all whitespace-pre-wrap">{ex.output}</code>
                            </div>
                          )}
                          {ex.explanation && (
                            <div className="flex items-start border-t border-white/5 pt-2.5 mt-2 text-gray-400">
                              <span className="font-semibold text-gray-500 select-none mr-2 w-12 shrink-0">Explain:</span>
                              <span className="select-text leading-relaxed text-gray-300 whitespace-pre-wrap">{ex.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {parsed.constraints && parsed.constraints.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="font-semibold text-white text-sm">Constraints:</p>
                    <ul className="space-y-2 pl-1">
                      {parsed.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 font-mono">
                          <span className="text-gray-600 mt-1 select-none">•</span>
                          <code className="bg-[#1f1f23] text-gray-200 px-2 py-0.5 rounded-md border border-white/5 text-[11px] leading-relaxed break-all">
                            {c}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3 pt-6 border-t border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Mock Sandbox Rules</h4>
                  <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 font-bold">•</span>
                      Toggle microphone to capture verbal explanations while coding.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 font-bold">•</span>
                      Interviewer personas will dynamically prompt follow ups in the chat feed.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                {/* Canvas toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface-solid/40 border border-surface-border rounded-lg justify-between">
                  <div className="flex gap-1">
                    {[
                      { id: "pen", label: "Pen" },
                      { id: "rect", label: "Rect" },
                      { id: "arrow", label: "Arrow" },
                      { id: "text", label: "Text" },
                      { id: "eraser", label: "Eraser" },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setDrawTool(tool.id as any)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${drawTool === tool.id
                            ? "bg-cyan-500 text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                          }`}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {["#06B6D4", "#3B82F6", "#8B5CF6", "#10B981"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setDrawColor(color)}
                        className={`w-4 h-4 rounded-full border border-white/10 ${drawColor === color ? "ring-2 ring-cyan-500" : ""
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={handleClearCanvas}
                      className="p-1 bg-rose-950/40 text-rose-300 rounded border border-rose-500/20 hover:bg-rose-900/60"
                      title="Clear whiteboard"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Drawing board canvas */}
                <canvas
                  ref={canvasRef}
                  width="400"
                  height="450"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full bg-[#0D0D11] border border-surface-border rounded-lg cursor-crosshair h-[400px] overflow-hidden"
                />
                <span className="text-[10px] text-gray-600 font-mono text-center">
                  Drag pen to draw. Click shapes/text, then drag canvas nodes to complete drawings.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Editor and console output (5/12 cols) */}
        <div className="lg:col-span-5 border border-surface-border rounded-xl flex flex-col bg-[#0B0B0E] lg:h-[750px] overflow-hidden shadow-lg">
          {/* Editor header */}
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-2 bg-surface-solid/40">
            <span className="text-xs font-mono text-[var(--accent-primary)] flex items-center gap-1.5">
              <FileText size={14} /> {language === "javascript" ? "editor.js" : language === "python" ? "editor.py" : language === "cpp" ? "editor.cpp" : "Solution.java"}
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-black/40 border border-surface-border text-gray-300 text-xs rounded px-2 py-0.5 outline-none font-mono focus:border-[var(--accent-primary)]"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Lines layout editor */}
          <div className="flex-grow flex overflow-hidden font-mono text-sm relative">
            {/* Gutter numbers */}
            <div className="w-12 py-4 select-none text-right pr-3 text-gray-600 bg-black/10 border-r border-surface-border">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="h-5 leading-5 text-xs">
                  {i + 1}
                </div>
              ))}
            </div>
            {/* Input area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow p-4 bg-transparent outline-none border-none resize-none font-mono text-xs text-gray-100/90 leading-5 overflow-y-auto"
              style={{ tabSize: 4 }}
              spellCheck="false"
            />
          </div>

          {/* Console logger panel */}
          <div className="h-[220px] border-t border-surface-border flex flex-col bg-[#141416]">
            <div className="px-4 py-2 border-b border-surface-border bg-black/45 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowStdin(false)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${!showStdin
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  Console Output
                </button>
                <button
                  type="button"
                  onClick={() => setShowStdin(true)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${showStdin
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  Custom Testcases
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="glow"
                  size="sm"
                  className="py-1.5 px-3 text-xs"
                  onClick={handleCompileCode}
                  loading={isCompiling}
                  disabled={isSubmitting}
                >
                  Run Code
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="py-1.5 px-3 text-xs"
                  onClick={handleSubmitCode}
                  loading={isSubmitting}
                  disabled={isCompiling}
                >
                  Submit Code
                </Button>
              </div>
            </div>

            <div className="flex-grow flex overflow-hidden text-xs font-mono text-left">
              {showStdin ? (
                <div className="w-full flex flex-col bg-[#0f0f11]/90">
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    className="flex-grow p-4 bg-transparent outline-none border-none resize-none text-gray-300 font-mono text-xs focus:ring-0"
                    placeholder="Provide standard input (STDIN) for execution. For example, [2, 7, 11, 15] or target values..."
                  />
                </div>
              ) : (
                <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-[#0f0f11]/80 select-text custom-scrollbar">
                  {consoleOutput.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-1.5">
                      <svg className="w-5 h-5 opacity-40 animate-pulse text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                      <span className="text-[11px] font-sans">
                        Console ready. Click 'Run Code' or 'Submit Code' to execute.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {consoleOutput.map((line, i) => {
                        let isSuccess = line.startsWith("✓") || line.startsWith("🎉") || line.includes("ACCEPTED") || line.includes("Success");
                        let isError = line.startsWith("✗") || line.startsWith("❌") || line.includes("Failed") || line.includes("Error");

                        return (
                          <div
                            key={i}
                            className={
                              isSuccess
                                ? "text-emerald-400 font-semibold py-0.5"
                                : isError
                                  ? "text-rose-400 font-semibold py-0.5"
                                  : line.startsWith("Compiling") || line.startsWith("Submission Status:")
                                    ? "text-cyan-400 font-bold"
                                    : "text-gray-300"
                            }
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Interview simulator grid (3/12 cols) */}
        <div className="lg:col-span-3 border border-surface-border rounded-xl flex flex-col bg-[#080d1a] p-4 space-y-4 justify-between lg:h-[750px] overflow-hidden shadow-lg">
          <div className="space-y-4 overflow-hidden flex flex-col flex-grow min-h-0">
            {/* Interviewer avatar container */}
            <Card className="p-3 bg-surface-solid border-surface-border shrink-0 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white relative ${stressActive ? "bg-rose-950 border border-rose-500 danger-glow" : "bg-[var(--accent-glow)] border border-[var(--accent-primary)]/45"
                }`}>
                {activePersona[0]}
                {/* Live online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-solid bg-emerald-500" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Interviewer</div>
                <div className="text-sm font-bold text-gray-200">Persona: {activePersona}</div>
              </div>
            </Card>

            {/* Conversation/Interrupt Log */}
            <Card className="flex-grow flex flex-col overflow-hidden p-0 border-surface-border min-h-0">
              <div className="px-4 py-2 border-b border-surface-border bg-white/5 text-xs text-left text-gray-400 font-mono flex items-center gap-1.5 shrink-0">
                <MessageSquare size={13} /> Active Chat Transcripts
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3.5 text-xs text-left font-sans">
                {chatLog.map((chat, i) => (
                  <div
                    key={i}
                    className={`space-y-1.5 p-2.5 rounded-lg ${chat.speaker === "Candidate"
                        ? "bg-white/5 border border-white/5"
                        : chat.speaker.includes("Interviewer")
                          ? "bg-[var(--accent-glow)]/40 border border-[var(--accent-primary)]/15"
                          : "bg-rose-950/10 border border-rose-500/15 danger-glow"
                      }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className={chat.speaker === "Candidate" ? "text-[var(--accent-primary)] font-bold" : "text-amber-400 font-bold"}>
                        {chat.speaker}
                      </span>
                      <span className="text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed leading-5 whitespace-pre-wrap">{chat.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Text-based chat controls */}
          <Card className="bg-[#0b1225] border-surface-border shrink-0 p-4 space-y-3">
            <div className="text-xs font-mono text-gray-400 text-left">
              Type message to interviewer:
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("chatInput") as HTMLInputElement;
                if (!input.value.trim()) return;
                const userText = input.value.trim();
                const newTimestamp = formatTime(timeLeft);
                setChatLog((prev) => [
                  ...prev,
                  { speaker: "Candidate", text: userText, time: newTimestamp }
                ]);
                // Real AI Mentor Integration
                const fetchMentorResponse = async (textToSend: string, endpoint: string = '/mentor/chat') => {
                  try {
                    const res = await apiFetch(endpoint, {
                      method: 'POST',
                      body: JSON.stringify({
                        interviewSessionId: "active-session", // In reality, fetch from context
                        questionId: challenge.id,
                        currentCode: codeMap[language] || code,
                        message: textToSend,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setChatLog((prev) => [
                        ...prev,
                        { speaker: `Interviewer (${activePersona})`, text: data.data.response, time: formatTime(timeLeft) }
                      ]);
                    } else {
                      setChatLog((prev) => [...prev, { speaker: 'System', text: 'Error connecting to Mentor.', time: formatTime(timeLeft) }]);
                    }
                  } catch (error) {
                    setChatLog((prev) => [...prev, { speaker: 'System', text: 'Network Error.', time: formatTime(timeLeft) }]);
                  }
                };

                fetchMentorResponse(userText, '/mentor/chat');

                form.reset();
              }}
              className="flex gap-2"
            >
              <input
                name="chatInput"
                type="text"
                placeholder="Explain your approach..."
                className="flex-grow bg-black/40 border border-surface-border text-gray-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-[var(--accent-primary)] font-sans"
              />
              <Button type="submit" variant="primary" size="sm" className="px-3">
                Send
              </Button>
            </form>

            <div className="flex gap-2 justify-between">
              <button
                onClick={() => {
                  setChatLog((prev) => [...prev, { speaker: "Candidate", text: "I need a hint...", time: formatTime(timeLeft) }]);
                  // Wrap in async IIFE or create a method
                  (async () => {
                    try {
                      const res = await apiFetch(`/mentor/hint`, {
                        method: 'POST',
                        body: JSON.stringify({ interviewSessionId: "active-session", questionId: challenge.id, currentCode: codeMap[language] || code, message: "I need a hint" })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setChatLog((prev) => [...prev, { speaker: `Interviewer (${activePersona})`, text: data.data.response, time: formatTime(timeLeft) }]);
                      }
                    } catch (e) { }
                  })();
                }}
                className="text-[10px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30 px-2 py-1 rounded transition-colors"
              >
                💡 Hint
              </button>
              <button
                onClick={() => {
                  setChatLog((prev) => [...prev, { speaker: "Candidate", text: "Can you debug this?", time: formatTime(timeLeft) }]);
                  (async () => {
                    try {
                      const res = await apiFetch(`/mentor/debug`, {
                        method: 'POST',
                        body: JSON.stringify({ interviewSessionId: "active-session", questionId: challenge.id, currentCode: codeMap[language] || code, message: "Debug" })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setChatLog((prev) => [...prev, { speaker: `Interviewer (${activePersona})`, text: data.data.response, time: formatTime(timeLeft) }]);
                      }
                    } catch (e) { }
                  })();
                }}
                className="text-[10px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border border-rose-500/30 px-2 py-1 rounded transition-colors"
              >
                🐛 Debug
              </button>
              <button
                onClick={() => {
                  setChatLog((prev) => [...prev, { speaker: "Candidate", text: "Analyze complexity", time: formatTime(timeLeft) }]);
                  (async () => {
                    try {
                      const res = await apiFetch(`/mentor/complexity`, {
                        method: 'POST',
                        body: JSON.stringify({ interviewSessionId: "active-session", questionId: challenge.id, currentCode: codeMap[language] || code, message: "Complexity" })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setChatLog((prev) => [...prev, { speaker: `Interviewer (${activePersona})`, text: data.data.response, time: formatTime(timeLeft) }]);
                      }
                    } catch (e) { }
                  })();
                }}
                className="text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/30 px-2 py-1 rounded transition-colors"
              >
                ⏱️ Complexity
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Background scheduler stress injector */}
      <StressSimulator onTrigger={handleStressTrigger} />
    </div>
  );
};
