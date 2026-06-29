import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import {
  Sparkles,
  Volume2,
  Activity,
  Flame,
  Play
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between py-12 px-6">
      {/* Glow backgrounds */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main hero center */}
      <div className="max-w-4xl mx-auto text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-semibold tracking-wider font-mono uppercase animate-pulse">
          <Sparkles size={13} /> UX-Led Mock Simulation Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight font-sans">
          Practice Speaking. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 neon-text-glow">
            Master the Code Loop.
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-gray-300 text-base md:text-lg leading-relaxed">
          Stop grinding silent coding problems. Interview Preparation combines high-fidelity split editors, system design whiteboard canvases, and real-time verbal transcript diagnostics to prepare you for actual FAANG interviews.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button
            onClick={() => navigate("/auth")}
            variant="primary"
            size="lg"
            className="gap-2 px-8 py-4 text-sm uppercase tracking-wider font-bold"
          >
            Start Preparing <Play size={15} className="fill-current" />
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="secondary"
            size="lg"
            className="px-8 py-4 text-sm"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Feature matrix grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
        <Card className="space-y-4 text-left p-6">
          <div className="p-3 bg-[rgba(var(--accent-rgb),0.08)] rounded-xl text-[var(--accent-primary)] border border-[rgba(var(--accent-rgb),0.2)] w-fit">
            <Volume2 size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-200">Talk While Coding</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Toggle browser microphone hooks to capture details. Flags filler word frequencies and matches transcript sentences with lines of code.
          </p>
        </Card>

        <Card className="space-y-4 text-left p-6">
          <div className="p-3 bg-[rgba(var(--accent-rgb),0.08)] rounded-xl text-[var(--accent-primary)] border border-[rgba(var(--accent-rgb),0.2)] w-fit">
            <Activity size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-200">Interactive Canvas Whiteboard</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Draw network topologies, database servers, and message queue lines right next to instructions during architecture sessions.
          </p>
        </Card>

        <Card className="space-y-4 text-left p-6">
          <div className="p-3 bg-[rgba(var(--accent-rgb),0.08)] rounded-xl text-[var(--accent-primary)] border border-[rgba(var(--accent-rgb),0.2)] w-fit">
            <Flame size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-200">Cognitive Stress Simulator</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Configurable interviewer personas trigger live timing alerts and requirement updates mid-session to build psychological resilience.
          </p>
        </Card>
      </div>
    </div>
  );
};
