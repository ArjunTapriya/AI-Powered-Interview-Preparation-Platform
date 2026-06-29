import React, { useEffect, useState } from "react";
import { useApp } from "../../../store/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { X, Volume2, Flame } from "lucide-react";

interface StressSimulatorProps {
  onTrigger: (questionText: string) => void;
}

export const StressSimulator: React.FC<StressSimulatorProps> = ({ onTrigger }) => {
  const { activePersona, setStressActive } = useApp();
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [alertIndex, setAlertIndex] = useState(0);

  // Persona comments map
  const alertsMap = {
    Nitpicker: [
      "Wait! Are you sure your map lookup is O(1) in the worst case? What about hash collisions?",
      "Is that variable name clear? Please ensure your code conforms to standard Clean Code conventions.",
      "You initialized an array helper. What is the impact on garbage collection in hot loops?"
    ],
    Interrupter: [
      "Let's shift constraints: We just lost distributed consistency. How does that affect your caching policy?",
      "Hold on! What if the input array is sorted? Can we optimize code bounds to O(1) space?",
      "Wait, we have a memory spike. Can you re-write this without creating sub-arrays?"
    ],
    Coach: [
      "That is a great direction! Consider what happens if target sum contains negative integers.",
      "Think about duplicate numbers in the array. How do we ensure unique indices are returned?",
      "Excellent. Don't forget to write out the base validation checks first."
    ],
    Silent: [
      "...",
      "Please keep explaining your code logic verbally. I am tracking your pattern matching metrics.",
      "[Interviewer is typing notes...]"
    ]
  };

  useEffect(() => {
    // Schedule timed interruptions every 45 seconds if stress simulator is enabled
    const interval = setInterval(() => {
      const activeList = alertsMap[activePersona];
      const nextAlert = activeList[alertIndex % activeList.length];

      setAlertIndex((prev) => prev + 1);
      setActiveAlert(nextAlert);
      setStressActive(true);
      onTrigger(nextAlert);

      // Audio buzzer simulation
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, audioCtx.currentTime); // Subtle beep
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // Fallback if audio constraints prevent play
      }
    }, 40000); // Trigger every 40s to demonstrate features quickly

    return () => clearInterval(interval);
  }, [activePersona, alertIndex, onTrigger]);

  const handleClose = () => {
    setActiveAlert(null);
    setStressActive(false);
  };

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
      <Card className="danger-glow border-rose-500/40 bg-[#14060d]/95 p-5 shadow-[0_0_30px_rgba(244,63,94,0.25)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex gap-3 text-left">
          <div className="p-2 bg-rose-500/10 rounded text-rose-400 shrink-0 h-10 w-10 flex items-center justify-center border border-rose-500/20">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase font-mono flex items-center gap-1">
              <Volume2 size={12} /> Live Interruption ({activePersona})
            </span>
            <p className="text-xs text-gray-200 font-medium leading-relaxed mt-1">{activeAlert}</p>
            <div className="pt-3 flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="py-1 px-3 text-[10px]"
                onClick={handleClose}
              >
                Acknowledge & Adapt
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
