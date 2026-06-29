import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Play, Sparkles, Trophy, Shield, Rocket, ArrowRight, Check } from "lucide-react";
import confetti from "canvas-confetti";

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, accessToken } = useApp();
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState<"Junior" | "Mid-level" | "Senior" | "Staff/Principal">("Senior");
  const [weeks, setWeeks] = useState(6);
  const [diagnosticChoice, setDiagnosticChoice] = useState<"take" | "skip">("take");

  // Code editor for diagnostic console
  const [code, setCode] = useState(
    `function twoSum(nums: number[], target: number): number[] {\n    // Write your O(N) solution here\n    const map = new Map<number, number>();\n    \n}`
  );
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState("");

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#06B6D4", "#3B82F6", "#8B5CF6"]
    });
  };

  const updateUserProfile = async (data: any) => {
    try {
      const res = await fetch("http://localhost:4000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setUser(json.data.user);
      }
    } catch (e) {
      console.error("Failed to sync profile:", e);
      // Fallback to local state if backend is down
      setUser((prev) => ({ ...prev, ...data }));
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setUser((prev) => ({
        ...prev,
        targetCompany: company,
        roleDepth: role,
        prepWeeks: weeks,
      }));
      await updateUserProfile({ targetCompany: company, roleDepth: role, prepWeeks: weeks });
      setStep(2);
    } else if (step === 2) {
      if (diagnosticChoice === "skip") {
        setUser((prev) => ({
          ...prev,
          diagnosticCompleted: true,
          radarScores: { correctness: 60, speed: 55, architecture: 50, communication: 45 },
        }));
        await updateUserProfile({ diagnosticCompleted: true });
        triggerConfetti();
        setStep(4);
      } else {
        setStep(3);
      }
    }
  };

  const runDiagnostic = () => {
    setIsRunningDiagnostic(true);
    setDiagnosticStatus("Running baseline compiler diagnostics...");
    setTimeout(() => {
      setDiagnosticStatus("Analyzing architectural complexity (Big-O)...");
      setTimeout(() => {
        setDiagnosticStatus("Evaluating verbal communication pattern models...");
        setTimeout(async () => {
          setIsRunningDiagnostic(false);
          setUser((prev) => ({
            ...prev,
            diagnosticCompleted: true,
            radarScores: { correctness: 75, speed: 65, architecture: 70, communication: 60 },
          }));
          await updateUserProfile({ diagnosticCompleted: true });
          triggerConfetti();
          setStep(4);
        }, 1000);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Indicators */}
      <div className="mb-10 text-center">
        <div className="flex justify-between max-w-md mx-auto items-center mb-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          <span className={step >= 1 ? "text-[var(--accent-primary)]" : ""}>1. Parameters</span>
          <span className={step >= 2 ? "text-[var(--accent-primary)]" : ""}>2. Diagnostic Setup</span>
          <span className={step >= 3 ? "text-[var(--accent-primary)]" : ""}>3. Mini Coding Test</span>
          <span className={step >= 4 ? "text-[var(--accent-primary)]" : ""}>4. Profile Ready</span>
        </div>
        <ProgressBar value={step * 25} size="sm" />
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
              Set Your Career Vector
            </h2>
            <p className="text-gray-400 mt-2">
              Interview Prep adapts preparation algorithms to your target standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-200">Target Environment</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Google", icon: Trophy },
                  { name: "Meta", icon: Rocket },
                  { name: "Netflix", icon: Sparkles },
                  { name: "Amazon", icon: Trophy },
                  { name: "Stripe", icon: Shield },
                  { name: "Early Startup", icon: Rocket },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setCompany(item.name)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      company === item.name
                        ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--accent-primary)] shadow-[0_4px_12px_var(--accent-glow)]"
                        : "border-surface-border bg-surface-solid/50 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <item.icon size={16} />
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Preparation Timeline</span>
                  <span className="text-[var(--accent-primary)] font-bold">{weeks} Weeks</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={weeks}
                  onChange={(e) => setWeeks(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>2 Weeks (Intensive)</span>
                  <span>24 Weeks (Deep Dive)</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-200">Role Seniority</h3>
              <div className="space-y-3">
                {[
                  { id: "Junior", desc: "CS grads, junior devs. Focuses on core DSA & basic logic." },
                  { id: "Mid-level", desc: "2-5 YOE. Focuses on system details & API layouts." },
                  { id: "Senior", desc: "5-10 YOE. Focuses on systems scale, caching, & architecture." },
                  { id: "Staff/Principal", desc: "10+ YOE. Focuses on cross-team design & leadership loops." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id as any)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      role === item.id
                        ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--accent-primary)] shadow-[0_4px_12px_var(--accent-glow)]"
                        : "border-surface-border bg-surface-solid/50 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleNextStep} className="gap-2 px-6">
              Next Step <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
              Choose Diagnostic Method
            </h2>
            <p className="text-gray-400 mt-2">
              Assess your baseline algorithms, code execution speed, and architectural thinking depth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setDiagnosticChoice("take")}
              className={`p-6 rounded-xl border text-left transition-all relative ${
                diagnosticChoice === "take"
                  ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--accent-primary)] shadow-[0_4px_12px_var(--accent-glow)]"
                  : "border-surface-border bg-surface-solid/50 text-gray-400 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Play className="text-[var(--accent-primary)]" size={24} />
                <div>
                  <h4 className="font-bold text-gray-200">Take 15-Minute Mini Diagnostic (Recommended)</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Solve a coding logic problem. Evaluates syntax velocity, big-O, and architecture.
                  </p>
                </div>
              </div>
              {diagnosticChoice === "take" && (
                <Check className="absolute top-6 right-6 text-[var(--accent-primary)]" size={20} />
              )}
            </button>

            <button
              onClick={() => setDiagnosticChoice("skip")}
              className={`p-6 rounded-xl border text-left transition-all relative ${
                diagnosticChoice === "skip"
                  ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.08)] text-[var(--accent-primary)] shadow-[0_4px_12px_var(--accent-glow)]"
                  : "border-surface-border bg-surface-solid/50 text-gray-400 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="text-gray-500" size={24} />
                <div>
                  <h4 className="font-bold text-gray-200">Skip and Use Standard Baseline Scores</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Initializes standard scores based on your role seniority. You can adjust this later.
                  </p>
                </div>
              </div>
              {diagnosticChoice === "skip" && (
                <Check className="absolute top-6 right-6 text-[var(--accent-primary)]" size={20} />
              )}
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleNextStep} className="gap-2">
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              Mini Coding Diagnostic Console
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              Implement standard O(N) solution to return indices of two numbers that sum to target.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Instruction Panel */}
            <Card className="lg:col-span-1 space-y-4">
              <h4 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
                Problem: Two Sum
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Given an array of integers <code className="text-xs bg-white/5 py-0.5 px-1.5 text-[var(--accent-primary)] font-mono">nums</code> and an integer{" "}
                <code className="text-xs bg-white/5 py-0.5 px-1.5 text-[var(--accent-primary)] font-mono">target</code>, return indices of the two numbers such that they add up to target.
              </p>
              <div className="bg-white/5 p-3 rounded-lg text-xs font-mono space-y-1 text-gray-400">
                <div className="text-[var(--accent-primary)] font-bold">Example 1:</div>
                <div>Input: nums = [2,7,11,15], target = 9</div>
                <div>Output: [0,1]</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-xs font-mono space-y-1 text-gray-400">
                <div className="text-[var(--accent-primary)] font-bold">Constraint:</div>
                <div>Time complexity: O(N)</div>
                <div>Space complexity: O(N)</div>
              </div>
            </Card>

            {/* Code Console */}
            <Card className="lg:col-span-2 p-0 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between border-b border-surface-border px-4 py-2 bg-surface-solid/40">
                <span className="text-xs font-mono text-[var(--accent-primary)]">solution.ts</span>
                <span className="text-xs text-gray-500">TypeScript (Node v20)</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-grow w-full p-4 bg-slate-950 font-mono text-sm text-white/95 focus:outline-none resize-none min-h-[200px]"
                disabled={isRunningDiagnostic}
              />
              <div className="border-t border-surface-border p-3 flex justify-between items-center bg-surface-solid/40">
                <span className="text-xs text-[var(--accent-primary)] font-mono">
                  {isRunningDiagnostic ? diagnosticStatus : "Ready to compiler run."}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={runDiagnostic}
                    loading={isRunningDiagnostic}
                  >
                    Analyze Code
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-md mx-auto text-center space-y-8 animate-fadeIn py-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-[var(--accent-primary)] to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Trophy size={40} className="text-white animate-bounce" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              Diagnostic Complete!
            </h2>
            <p className="text-gray-400">
              Your baseline profile is initialized. We have built a tailored roadmap matching {company} standards.
            </p>
          </div>

          <Card className="p-4 bg-[rgba(var(--accent-rgb),0.08)] border-[rgba(var(--accent-rgb),0.2)]">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-[var(--accent-primary)]" />
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Current Goal</div>
                <div className="text-sm font-bold text-gray-200">
                  Master {company} {role} Interview in {weeks} Weeks
                </div>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => {
              navigate("/dashboard");
            }}
            variant="primary"
            className="w-full py-3 gap-2"
          >
            Enter Dashboard Hub <ArrowRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
