import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { apiFetch } from "../../../utils/apiFetch";
import { Button } from "../../../components/ui/Button";

import { ProgressBar } from "../../../components/ui/ProgressBar";
import { jsPDF } from "jspdf";
import {
  Upload,
  FileText,
  Clock,
  Mic,
  MicOff,
  ChevronRight,
  AlertTriangle,
  Award,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Download
} from "lucide-react";

interface QuestionLog {
  question: string;
  answerText: string;
  confidenceScore: number | null; // calculated from pauses & fillers, null if not voice
  grammarScore: number;
  relevanceScore: number;
  feedback: string;
  improvement: string;
}

export const InterviewPractice: React.FC = () => {
  const navigate = useNavigate();
  const { setHistory, setStreak, accessToken } = useApp() as any;

  // Screen State flow
  const [step, setStep] = useState<"setup" | "interview" | "report">("setup");

  // Setup Form states
  const [interviewMode, setInterviewMode] = useState<"mcq" | "voice">("mcq");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [durationMin, setDurationMin] = useState<number>(10);
  const [roleLevel, setRoleLevel] = useState<string>("Senior");
  const [dragOver, setDragOver] = useState(false);

  // Active Interview states
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [mcqSelectedOption, setMcqSelectedOption] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Completed Session logs
  const [sessionLogs, setSessionLogs] = useState<QuestionLog[]>([]);
  const [overallConfidence, setOverallConfidence] = useState(0);
  const [overallGrammar, setOverallGrammar] = useState(0);
  const [overallRelevance, setOverallRelevance] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [category, setCategory] = useState<"Behavioral" | "Technical">("Technical");
  const [mcqFeedbackData, setMcqFeedbackData] = useState<{ isCorrect: boolean, timeTaken: number } | null>(null);

  // Refs for speech and Web Audio
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioWaveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isEvaluatingRef = useRef(false);

  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);

  // Time formatting helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 1. Resume File Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file: File) => {
    const allowedExtensions = ["pdf"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      setResumeFileName(file.name);
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append("resume", file);
        
        const res = await apiFetch("/resumes/parse-temporary", {
          method: "POST",
          body: formData
        });
        
        const data = await res.json();
        if (res.ok && data.success && data.data?.resume) {
          const r = data.data.resume;
          const dynamicResumeContent = `Candidate Resume Profile Details:
Skills: ${r.skills.join(", ")}
Experience: ${JSON.stringify(r.experience)}
Education: ${JSON.stringify(r.education)}
Projects: ${JSON.stringify(r.projects)}
AI Summary: ${r.aiSummary}`;
          setResumeText(dynamicResumeContent);
        } else {
          alert("Failed to parse the resume: " + (data.message || "Unknown error"));
          setResumeFileName(null);
        }
      } catch (err) {
        console.error("Resume upload failed:", err);
        alert("An error occurred while uploading the resume.");
        setResumeFileName(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      alert("Unsupported file format. Please upload a PDF file.");
    }
  };

  // 2. Start Interview Session
  const handleStartInterview = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume or paste your resume details to begin.");
      return;
    }

    // Determine difficulty based on experience level
    let difficulty = "Medium";
    if (roleLevel === "Junior") difficulty = "Easy";
    if (roleLevel === "Staff/Principal") difficulty = "Hard";

    let generatedQuestions: any[] = [];

    try {
      const endpoint = interviewMode === "mcq" ? "/questions/generate-mcq" : "/questions/generate-from-resume";
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ resumeText, roleLevel, durationMin, category, difficulty })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.questions) {
        if (interviewMode === "mcq") {
          generatedQuestions = data.data.questions;
        } else {
          generatedQuestions = data.data.questions.map((q: any) => q.description || q.title || q.question);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dynamic questions from Gemini API:", err);
    }

    // Fallback if API fails
    if (generatedQuestions.length === 0) {
      if (interviewMode === "mcq") {
        generatedQuestions = Array.from({ length: durationMin }).map((_, i) => ({
          question: `Technical Concept Question ${i + 1} for ${roleLevel}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A"
        }));
      } else {
        generatedQuestions = Array.from({ length: durationMin }).map((_, i) =>
          `Technical Question ${i + 1}: Based on your resume, how would you architect a scalable solution under high constraints?`
        );
      }
    }

    setQuestions(generatedQuestions);
    // Setting 60 seconds per question (strict 1 min timer)
    setTimeLeft(60);
    setCurrentQuestionIdx(0);
    setTranscribedText("");
    setSessionLogs([]);
    setStep("interview");

    if (interviewMode === "voice" && generatedQuestions.length > 0) {
      setTimeout(() => {
        speakText(generatedQuestions[0]);
      }, 500);
    }
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  // 3. Audio & Voice level detector configuration
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWave = () => {
        if (!audioWaveCanvasRef.current || !analyserRef.current) return;
        const canvas = audioWaveCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dynamic color alignment based on themeaccent
        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || "#F97316";
        ctx.fillStyle = `${accentHex}33`; // 20% opacity fill
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 1.5;

        // Calculate average volume level for confidence metrics
        let total = 0;
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          total += v;
          const y = (1 - v) * canvas.height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += barWidth + 1;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        const averageVolume = total / bufferLength;
        setVoiceVolume(Math.min(Math.round(averageVolume * 100 * 2), 100));

        animationFrameRef.current = requestAnimationFrame(drawWave);
      };

      drawWave();
    } catch (err) {
      console.warn("Could not capture microphone for volume wave. Fallback visualizer will run.", err);
      simulateFallbackWave();
    }
  };

  const simulateFallbackWave = () => {
    let angle = 0;
    const drawMockWave = () => {
      if (!audioWaveCanvasRef.current) return;
      const canvas = audioWaveCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || "#F97316";
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const amplitude = Math.sin(angle + x * 0.05) * 8 * Math.sin(angle * 0.1);
        const y = canvas.height / 2 + amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      angle += 0.2;
      animationFrameRef.current = requestAnimationFrame(drawMockWave);
    };
    drawMockWave();
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVoiceVolume(0);
  };

  // 4. Browser Speech-to-Text Recognition hook
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("webkitSpeechRecognition not supported in this browser. Please type responses manually.");
      setIsListening(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let newlyFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newlyFinal += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (newlyFinal || interim) {
        setTranscribedText((prev) => {
          // ensure space formatting is correct when appending
          const trimmedPrev = prev.trim();
          const nextText = newlyFinal ? (trimmedPrev ? `${trimmedPrev} ${newlyFinal.trim()}` : newlyFinal.trim()) : trimmedPrev;
          
          // Track speech filler word count
          const fillers = ["actually", "basically", "like", "uh", "um", "you know"];
          const words = (nextText + " " + interim).toLowerCase().split(/\s+/);
          let count = 0;
          words.forEach((word) => {
            if (fillers.includes(word)) count++;
          });
          setFillerCount(count);

          return nextText;
        });
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript("");
  };

  const handleToggleListening = () => {
    if (!isListening) {
      startSpeechRecognition();
      startAudioAnalyzer();
    } else {
      stopSpeechRecognition();
      stopAudioAnalyzer();
    }
  };

  // Handle active countdown per question
  useEffect(() => {
    if (step !== "interview") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (isEvaluatingRef.current) return prev; // Pause timer during evaluation or feedback
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleSkipQuestion(), 0); // Trigger skip immediately
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, currentQuestionIdx]); // Reset timer on question change

  // Clean up hooks on component unmount
  useEffect(() => {
    return () => {
      stopAudioAnalyzer();
      stopSpeechRecognition();
    };
  }, []);

  const handleSkipQuestion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const currentQuestion = questions[currentQuestionIdx];

    const skippedLog: QuestionLog = {
      question: currentQuestion,
      answerText: "[SKIPPED]",
      confidenceScore: 0,
      grammarScore: 0,
      relevanceScore: 0,
      feedback: "Question was skipped or timed out.",
      improvement: "Ensure to submit an answer before the 1 minute timer runs out."
    };

    const updatedLogs = [...sessionLogs, skippedLog];
    setSessionLogs(updatedLogs);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setTimeLeft(60); // Reset timer for next question
      setTranscribedText("");
      setInterimTranscript("");
      setFillerCount(0);
    } else {
      handleEndInterview(updatedLogs);
    }
  };

  // 5. Submit single response
  const handleSubmitAnswer = async () => {
    let finalAnswer = "";
    let confidenceScore: number | null = 0;
    let grammarScore = 0;
    let relevanceScore = 0;
    let feedback = "";
    let improvement = "";
    let currentQuestionText = "";

    if (interviewMode === "mcq") {
      finalAnswer = mcqSelectedOption || "";
      if (!finalAnswer) {
        alert("Please select an option.");
        return;
      }
      
      setIsEvaluating(true);
      
      const timeTaken = 60 - timeLeft;
      currentQuestionText = questions[currentQuestionIdx]?.question;
      const isCorrect = finalAnswer === questions[currentQuestionIdx]?.correctAnswer;
      relevanceScore = isCorrect ? 100 : 0;
      confidenceScore = 100;
      grammarScore = 100;
      feedback = isCorrect ? "Correct answer selected." : `Incorrect. The correct answer was: ${questions[currentQuestionIdx]?.correctAnswer}`;
      improvement = isCorrect ? "Keep it up." : "Review this concept from your resume.";
      
      setMcqFeedbackData({ isCorrect, timeTaken });
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setMcqFeedbackData(null);
      setMcqSelectedOption(null);
      setIsEvaluating(false);
    } else {
      finalAnswer = (transcribedText + " " + interimTranscript).trim();
      if (!finalAnswer) {
        handleSkipQuestion();
        return;
      }
      currentQuestionText = questions[currentQuestionIdx];

      // Voice usage check
      const usedVoice = interviewMode === "voice" && (voiceVolume > 0 || fillerCount > 0 || isListening);

      // Evaluate single answer parameters using Gemini API
      setIsEvaluating(true);
      try {
        const res = await apiFetch(`/ai/evaluate-single-answer`, {
          method: "POST",
          body: JSON.stringify({
            question: currentQuestionText,
            answer: finalAnswer,
            resumeText,
            roleLevel,
            usedVoice
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          relevanceScore = data.data.relevanceScore || 0;
          grammarScore = data.data.grammarScore || 0;
          feedback = data.data.feedback || "Answer recorded.";
          improvement = data.data.improvement || "Keep practicing.";
        } else {
          relevanceScore = 50;
          grammarScore = 50;
          feedback = "Failed to evaluate answer.";
          improvement = "Try again later.";
        }
      } catch (err) {
        console.error("AI Evaluation error:", err);
        relevanceScore = 50;
        grammarScore = 50;
        feedback = "Network error during evaluation.";
        improvement = "Check connection.";
      } finally {
        setIsEvaluating(false);
      }

      if (usedVoice) {
        confidenceScore = Math.max(98 - fillerCount * 4 - (voiceVolume < 10 ? 15 : 0), 40);
      } else {
        confidenceScore = null;
      }
    }

    const logs: QuestionLog = {
      question: currentQuestionText,
      answerText: finalAnswer,
      confidenceScore,
      grammarScore,
      relevanceScore,
      feedback,
      improvement
    };

    const updatedLogs = [...sessionLogs, logs];
    setSessionLogs(updatedLogs);

    if (interviewMode === "voice") {
      setIsListening(false);
      await speakText(feedback);
      // Ensure recognition is stopped while AI is speaking
    }

    // Go to next question or complete interview
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setTimeLeft(60); // Reset timer
      setTranscribedText("");
      setInterimTranscript("");
      setFillerCount(0);

      if (interviewMode === "voice") {
        setTimeout(() => {
          speakText(questions[currentQuestionIdx + 1]);
        }, 500); // Ask the next question directly after a short pause
      }
    } else {
      handleEndInterview(updatedLogs);
    }
  };

  // 6. Complete Interview & Analytics Compiler
  const handleEndInterview = (finalLogs?: QuestionLog[]) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopAudioAnalyzer();
    stopSpeechRecognition();

    const logsToEvaluate = finalLogs || sessionLogs;

    // Sum overall diagnostic metrics
    const validConfidenceLogs = logsToEvaluate.filter(log => log.confidenceScore !== null);
    const confidenceSum = validConfidenceLogs.reduce((acc, log) => acc + (log.confidenceScore || 0), 0);
    
    const grammarSum = logsToEvaluate.reduce((acc, log) => acc + log.grammarScore, 0);
    const relevanceSum = logsToEvaluate.reduce((acc, log) => acc + log.relevanceScore, 0);
    const divisor = logsToEvaluate.length > 0 ? logsToEvaluate.length : 1;
    const confidenceDivisor = validConfidenceLogs.length > 0 ? validConfidenceLogs.length : 0;

    const avgConfidence = confidenceDivisor > 0 ? Math.round(confidenceSum / confidenceDivisor) : null;
    const avgGrammar = Math.round(grammarSum / divisor);
    const avgRelevance = Math.round(relevanceSum / divisor);
    const finalDiagnostic = Math.round(((avgConfidence || avgGrammar) + avgGrammar + avgRelevance) / 3);

    setOverallConfidence(avgConfidence || 0); // we can still use 0 for the state if we want, or keep it as any
    // Wait, let's keep overallConfidence as 0 if null, but we'll add a state or check for `validConfidenceLogs.length > 0` below
    const hasVoice = confidenceDivisor > 0;
    
    setOverallConfidence(avgConfidence || 0);
    setOverallGrammar(avgGrammar);
    setOverallRelevance(avgRelevance);
    setOverallScore(finalDiagnostic);

    // Save practice to general App History for overall dashboard metrics
    const newSession = {
      type: category === "Technical" ? "DSA" : "Behavioral",
      company: "Uploaded Resume Practice",
      overallScore: finalDiagnostic,
      durationMin: Math.round((durationMin * 60 - timeLeft) / 60) || 1,
      codeSnippet: "No code provided in voice practice.",
      metrics: {
        correctness: avgRelevance,
        speed: 80,
        architecture: avgGrammar,
        communication: avgConfidence || 0
      },
      transcript: logsToEvaluate,
      feedbackNotes: [
        hasVoice ? `Voice confidence metric: ${avgConfidence}% rating.` : `Voice was not utilized; confidence metric skipped.`,
        `Syntactic grammar structural check score: ${avgGrammar}%.`,
        `Targeted questions resolved according to uploaded resume details.`
      ]
    };

    // Push to backend if possible
    if (accessToken) {
      apiFetch("/interviews", {
        method: "POST",
        body: JSON.stringify(newSession),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistory((prev: any[]) => [data.data.session, ...prev]);
          } else {
            setHistory((prev: any[]) => [{ ...newSession, id: `practice-${Date.now()}`, date: new Date().toISOString().split("T")[0] } as any, ...prev]);
          }
        })
        .catch(err => {
          console.error("Failed to post session", err);
          setHistory((prev: any[]) => [{ ...newSession, id: `practice-${Date.now()}`, date: new Date().toISOString().split("T")[0] } as any, ...prev]);
        });
    } else {
      setHistory((prev: any[]) => [{ ...newSession, id: `practice-${Date.now()}`, date: new Date().toISOString().split("T")[0] } as any, ...prev]);
    }

    setStreak((prev: number) => prev + 1);
    setStep("report");
  };

  // 7. Download report generator
  // 7. Download report generator
  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await apiFetch("/ai/generate-final-report", {
        method: "POST",
        body: JSON.stringify({
          sessionLogs,
          roleLevel
        })
      });
      const data = await res.json();
      
      const reportMarkdown = res.ok && data.success && data.data ? data.data.reportMarkdown : "Could not generate report.";

      const doc = new jsPDF();
      
      // Basic formatting for the PDF
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22); // Accent primary
      doc.text("Interview Preparation - Practice Report", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Interview Level: ${roleLevel}`, 20, 42);
      doc.text(`Total Duration: ${durationMin} Minutes`, 20, 49);
      doc.text(`Overall Score: ${overallScore}/100`, 20, 56);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("AI Executive Summary", 20, 70);

      doc.setFontSize(11);
      // splitTextToSize wraps text to fit within a given width (e.g. 170mm)
      const lines = doc.splitTextToSize(reportMarkdown, 170);
      doc.text(lines, 20, 80);

      doc.save(`Interview_Practice_Report_${roleLevel}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF report", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 pb-8 text-left animate-fadeIn">
      {/* Back button or Dashboard navigate header */}
      <button
        onClick={() => navigate("/dashboard")}
        className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] text-gray-400 hover:text-[var(--accent-primary)] hover:bg-white/5 transition-all mb-6"
        title="Back to Dashboard"
      >
        <ArrowLeft size={18} />
      </button>

      {/* STEP 1: SETUP SCREEN */}
      {step === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Upload settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="new-card space-y-4 p-6 bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)]">
              <h3 className="text-base font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Upload size={16} className="text-[var(--accent-primary)]" /> 1. Upload Resume File
              </h3>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver
                    ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.08)]"
                    : "border-surface-border bg-white/5 hover:border-gray-700"
                  }`}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
                  <div className="w-12 h-12 rounded-full bg-[rgba(var(--accent-rgb),0.1)] flex items-center justify-center mx-auto text-[var(--accent-primary)]">
                    <Upload size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-200">
                      {isUploading ? "Uploading & Analyzing..." : "Drag & Drop PDF here, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {resumeFileName && (
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-400" /> {resumeFileName}
                  </span>
                  <button
                    onClick={() => {
                      setResumeFileName(null);
                      setResumeText("");
                    }}
                    className="text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="new-card space-y-4 p-6 bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)]">
              <h3 className="text-base font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText size={16} className="text-[var(--accent-primary)]" /> 2. Copy & Paste Resume Details
              </h3>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the text from your resume directly here..."
                rows={6}
                className="w-full bg-black/40 border border-surface-border rounded-lg text-gray-200 text-sm p-4 outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 font-mono resize-y"
              />
            </div>
          </div>

          {/* Right panel: Parameters selector */}
          <div className="lg:col-span-1 space-y-6">
            <div className="new-card space-y-6 p-6">
              <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider">
                Practice settings
              </h3>

              {/* Mode Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 block text-left">
                  Interview Mode:
                </label>
                <div className="flex bg-[#16161A] p-1 rounded-lg border border-surface-border">
                  <button
                    onClick={() => setInterviewMode("mcq")}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-md transition-all ${interviewMode === "mcq" ? "bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent-primary)] shadow-sm" : "text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    MCQ Mode
                  </button>
                  <button
                    onClick={() => setInterviewMode("voice")}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-md transition-all ${interviewMode === "voice" ? "bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent-primary)] shadow-sm" : "text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    Real Voice Agent
                  </button>
                </div>
              </div>

              {/* Time chips */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 block text-left">
                  Session Duration:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 10, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDurationMin(mins)}
                      className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all ${durationMin === mins
                          ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.1)] text-[var(--accent-primary)] font-bold"
                          : "border-surface-border hover:border-gray-700 text-gray-400"
                        }`}
                    >
                      {mins === 60 ? "1 Hour" : `${mins} Minutes`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Level selector */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono text-gray-400 block">
                  Target Experience Level:
                </label>
                <select
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value)}
                  className="w-full bg-[#16161A] border border-surface-border text-gray-200 rounded-lg py-2 px-3 outline-none focus:border-[var(--accent-primary)] cursor-pointer text-xs font-mono"
                >
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid">Mid-Level (3-5 years)</option>
                  <option value="Senior">Senior (6+ years)</option>
                  <option value="Staff/Principal">Staff / Principal</option>
                </select>
              </div>

              {/* Category selector */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono text-gray-400 block">
                  Interview Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "Behavioral" | "Technical")}
                  className="w-full bg-[#16161A] border border-surface-border text-gray-200 rounded-lg py-2 px-3 outline-none focus:border-[var(--accent-primary)] cursor-pointer text-xs font-mono"
                >
                  <option value="Technical">Technical Round</option>
                  <option value="Behavioral">HR / Behavioral Round</option>
                </select>
              </div>

              <div className="pt-4 border-t border-surface-border">
                <Button
                  onClick={handleStartInterview}
                  variant="primary"
                  className="w-full py-3 gap-2 text-xs uppercase font-mono font-bold tracking-widest"
                >
                  Start Practice Room <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE VOICE PRACTICE ROOM */}
      {step === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left panel: Active interviewer & prompt (7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="new-card flex-grow flex flex-col justify-between bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)] p-6 min-h-[400px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-b border-surface-border pb-3">
                  <span className="text-[var(--accent-primary)] font-bold">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> Time Left: {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="space-y-3 text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500 font-mono">
                    Interviewer Question:
                  </div>
                  <h2 className="text-lg font-bold text-white leading-relaxed font-sans">
                    {interviewMode === "mcq" ? questions[currentQuestionIdx]?.question : questions[currentQuestionIdx]}
                  </h2>
                </div>
              </div>

              {/* Textarea typed fallback or real transcription viewer */}
              {interviewMode === "voice" && (
                <div className="space-y-3 pt-6 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-primary)] font-mono block">
                    Your Answer:
                  </label>
                  <textarea
                    value={transcribedText + interimTranscript}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    placeholder="Click the microphone below to start speaking, or type your answer manually..."
                    rows={5}
                    className="w-full bg-black/40 border border-surface-border rounded-lg text-gray-200 text-sm p-4 outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 font-sans resize-none"
                  />
                </div>
              )}

              {interviewMode === "mcq" && questions[currentQuestionIdx]?.options && (
                <div className="space-y-3 pt-6 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-primary)] font-mono block">
                    Select Your Answer:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentQuestionIdx].options.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setMcqSelectedOption(opt)}
                        className={`p-4 text-sm rounded-lg border text-left transition-all ${mcqSelectedOption === opt
                            ? "bg-[rgba(var(--accent-rgb),0.2)] border-[var(--accent-primary)] text-white font-bold"
                            : "bg-black/40 border-surface-border text-gray-300 hover:border-gray-500"
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Voice detector analytics & Controls (5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="new-card flex-grow flex flex-col justify-between bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)] p-6 space-y-6">

              {interviewMode === "voice" ? (
                <>
                  <div className="space-y-4 text-left">
                    <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-300">
                      Vocal Detector Panel
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Real-time microphone analyzer tracking pitch frequency and volume stability metrics.
                    </p>
                  </div>

                  {/* Audio waveform rendering panel */}
                  <div className="space-y-3">
                    <div className="h-16 bg-black/60 border border-surface-border rounded-xl flex items-center justify-center p-3 relative overflow-hidden">
                      <canvas ref={audioWaveCanvasRef} width="350" height="50" className="w-full h-full" />
                      {isListening && (
                        <div className="absolute right-3 top-3 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-gray-400">Mic Signal Input:</span>
                      <span className={voiceVolume > 0 ? "text-emerald-400 font-bold" : "text-gray-500"}>
                        {voiceVolume > 0 ? `${voiceVolume}% Peak` : "Muted/No Signal"}
                      </span>
                    </div>
                  </div>

                  {/* Metrics audit preview */}
                  <div className="space-y-3 text-xs font-mono border-t border-surface-border pt-4 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Speech recognition status:</span>
                      <span className={isListening ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {isListening ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Filler Words caught:</span>
                      <span className={fillerCount > 2 ? "text-amber-400 font-bold" : "text-gray-200"}>
                        {fillerCount}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 text-left flex-grow flex flex-col justify-center items-center text-center">
                  <h3 className="text-sm uppercase font-mono font-bold tracking-wider text-gray-300">
                    Confidence & Accuracy Matrix
                  </h3>
                  
                  <div className="w-full space-y-4 mt-2">
                    <div className="flex justify-between text-xs font-mono border-b border-surface-border pb-2 px-2">
                      <span className="text-gray-400">Response Confidence:</span>
                      {mcqFeedbackData ? (
                        <span className="text-emerald-400 font-bold">{mcqFeedbackData.timeTaken}s taken</span>
                      ) : (
                        <span className="text-[var(--accent-primary)] font-bold animate-pulse">Pending...</span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs font-mono border-b border-surface-border pb-2 px-2">
                      <span className="text-gray-400">Response Accuracy:</span>
                      {mcqFeedbackData ? (
                        <span className={mcqFeedbackData.isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {mcqFeedbackData.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      ) : (
                        <span className="text-[var(--accent-primary)] font-bold animate-pulse">Pending...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {interviewMode === "voice" && (
                  <Button
                    variant={isListening ? "danger" : "primary"}
                    onClick={handleToggleListening}
                    className="w-full py-3 gap-2 text-xs uppercase font-mono font-bold tracking-wider"
                  >
                    {isListening ? (
                      <>
                        <MicOff size={15} /> Pause Listening
                      </>
                    ) : (
                      <>
                        <Mic size={15} /> Connect Mic & Talk
                      </>
                    )}
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating}
                    className="py-2.5 text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    {isEvaluating ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" /> Evaluating
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  {currentQuestionIdx < questions.length - 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSkipQuestion()}
                      className="py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-400"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEndInterview()}
                    className="py-2.5 text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    End Early
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SCORECARD & PERFORMANCE ANALYSIS REPORT */}
      {step === "report" && (
        <div className="space-y-8">
          {/* Summary scores matrix card */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="new-card lg:col-span-1 bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] flex flex-col items-center justify-center p-8 space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--accent-primary)] font-mono">Overall Diagnostic</span>
              <div className="relative flex items-center justify-center">
                <svg width="140" height="140" className="rotate-[-90deg]">
                  <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <circle
                    cx="70"
                    cy="70"
                    r="55"
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="8"
                    strokeDasharray={345.5}
                    strokeDashoffset={345.5 - (345.5 * overallScore) / 100}
                    className="filter drop-shadow-[0_0_6px_var(--accent-glow)] transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tighter">{overallScore}</span>
                  <span className="text-gray-400 font-semibold block text-xs">/ 100</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadReport}
                  disabled={isGeneratingReport}
                  className="text-xs text-[var(--accent-primary)] hover:underline font-mono flex items-center gap-1.5"
                >
                  {isGeneratingReport ? (
                    <><RefreshCw size={13} className="animate-spin" /> Generating AI PDF...</>
                  ) : (
                    <><Download size={13} /> Generate AI PDF Report</>
                  )}
                </button>
              </div>
            </div>

            <div className="new-card lg:col-span-3 space-y-5 p-6">
              <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider text-left">
                {interviewMode === "mcq" ? "Performance Metrics" : "Voice & Content Matrix Audit"}
              </h3>
              <div className="space-y-4 font-mono text-left">
                
                {interviewMode === "voice" ? (
                  <>
                    {sessionLogs.some(log => log.confidenceScore !== null) && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Vocal Confidence & Volume Stability</span>
                          <span className="text-[var(--accent-primary)] font-bold">{overallConfidence}%</span>
                        </div>
                        <ProgressBar value={overallConfidence} size="sm" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Grammar & Vocabulary Clarity</span>
                        <span className="text-[var(--accent-primary)] font-bold">{overallGrammar}%</span>
                      </div>
                      <ProgressBar value={overallGrammar} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Resume Context Relevance</span>
                        <span className="text-[var(--accent-primary)] font-bold">{overallRelevance}%</span>
                      </div>
                      <ProgressBar value={overallRelevance} size="sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Accuracy</span>
                        <span className="text-[var(--accent-primary)] font-bold">{overallRelevance}%</span>
                      </div>
                      <ProgressBar value={overallRelevance} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Attempt Speed</span>
                        <span className="text-[var(--accent-primary)] font-bold">
                          {Math.max(10, Math.round((timeLeft / 60) * 100))}%
                        </span>
                      </div>
                      <ProgressBar value={Math.max(10, Math.round((timeLeft / 60) * 100))} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Clarity</span>
                        <span className="text-[var(--accent-primary)] font-bold">{Math.round((overallRelevance + Math.max(10, Math.round((timeLeft / 60) * 100))) / 2)}%</span>
                      </div>
                      <ProgressBar value={Math.round((overallRelevance + Math.max(10, Math.round((timeLeft / 60) * 100))) / 2)} size="sm" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Individual Question audit timeline */}
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Question Analysis Breakdown
            </h3>

            <div className="space-y-4">
              {sessionLogs.map((log, i) => (
                <div key={i} className="new-card bg-[rgba(255,255,255,0.02)] border border-[var(--surface-border-new)] space-y-4 p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] uppercase">
                        Question {i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white font-sans">{log.question}</h4>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-bold text-gray-500 font-mono">Transcribed Spoken Answer:</div>
                    <p className="text-gray-300 leading-relaxed italic">"{log.answerText || "No response recorded."}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="space-y-2 p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-lg">
                      <div className="font-bold text-emerald-400 flex items-center gap-1 font-mono uppercase text-[10px]">
                        <Award size={13} /> Evaluation Critique
                      </div>
                      <p className="text-gray-300 leading-relaxed">{log.feedback}</p>
                    </div>

                    <div className="space-y-2 p-3 bg-amber-950/10 border border-amber-500/10 rounded-lg">
                      <div className="font-bold text-amber-400 flex items-center gap-1 font-mono uppercase text-[10px]">
                        <AlertTriangle size={13} /> Scope of Improvement
                      </div>
                      <p className="text-gray-300 leading-relaxed">{log.improvement}</p>
                    </div>
                  </div>
                </div>
              ))}

              {sessionLogs.length === 0 && (
                <div className="new-card text-center py-12 text-gray-500 text-xs font-mono p-6">
                  <AlertTriangle className="mx-auto text-amber-500 mb-3 animate-pulse" size={24} />
                  No answers were submitted during this simulation. Adjust settings to start again.
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-end gap-3 pt-6 border-t border-surface-border mt-8">
            <div className="flex gap-4 mb-4">
              <Button
                onClick={() => setStep("setup")}
                variant="glow"
                size="sm"
                className="gap-1.5 uppercase font-mono text-xs font-bold text-gray-400 hover:text-white"
              >
                <RefreshCw size={14} /> New Practice
              </Button>
            </div>

            <div className="new-card p-5 border border-[var(--accent-primary)]/30 bg-gradient-to-br from-[var(--accent-glow)] to-[rgba(255,255,255,0.02)] w-full md:w-2/3 lg:w-1/2 flex flex-col items-end text-right">
              <h4 className="text-[var(--accent-primary)] font-extrabold text-sm uppercase tracking-widest mb-1.5">
                Suggestion for You
              </h4>
              <p className="text-gray-300 text-xs mb-5">
                Based on your diagnostic score of {overallScore}, we have unlocked a personalized Question Series just for you. Head over to the Roadmap to start your prep!
              </p>
              <Button
                onClick={() => navigate("/roadmap")}
                variant="primary"
                size="md"
                className="w-full sm:w-auto gap-2 uppercase font-mono text-xs font-bold px-6"
              >
                Make the Roadmap <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
