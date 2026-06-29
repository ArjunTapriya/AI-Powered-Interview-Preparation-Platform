import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../../store/AppContext";
import { Button } from "../../../components/ui/Button";

import { ProgressBar } from "../../../components/ui/ProgressBar";
import {
  Upload, FileText, Brain, Star, Briefcase, GraduationCap, Code2, CheckCircle, AlertTriangle, RefreshCw, X
} from "lucide-react";

interface ResumeData {
  id: string;
  originalName: string;
  fileSize: number;
  skills: { current: string[]; improvementScope: string };
  experience: { current: { title: string; company: string; duration: string; description: string }[]; improvementScope: string };
  education: { current: { degree: string; institution: string; year: string }[]; improvementScope: string };
  projects: { current: { name: string; description: string; tech: string[] }[]; improvementScope: string };
  aiSummary: string[];
  matchScore: number;
  uploadedAt: string;
}

export const ResumeUpload: React.FC = () => {
  const { accessToken } = useApp();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing resume on mount
  useEffect(() => {
    if (!accessToken) return;
    fetch("http://localhost:4000/api/resumes/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.resume) {
          setResume(data.data.resume);
        }
      })
      .catch(() => {});
  }, [accessToken]);

  const handleUpload = async (file: File) => {
    if (!accessToken) {
      setError("Please sign in to upload your resume.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("resume", file);
    if (targetRole) formData.append("targetRole", targetRole);

    try {
      const res = await fetch("http://localhost:4000/api/resumes/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResume(data.data.resume);
        setSuccess("Resume uploaded and AI-analyzed successfully!");
      } else {
        setError(data.message || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      setError("Network error. Ensure backend is running.");
    } finally {
      setUploading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!accessToken || !resume) return;
    setReanalyzing(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:4000/api/resumes/reanalyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ targetRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResume(data.data.resume);
        setSuccess("Resume re-analyzed with updated AI insights!");
      } else {
        setError(data.message || "Re-analysis failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const scoreValue = resume ? resume.matchScore : 0;
  const scoreColor = scoreValue >= 75
    ? "text-emerald-400"
    : scoreValue >= 50
    ? "text-amber-400"
    : "text-rose-400";

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Resume <span className="text-[var(--accent-primary)]">Intelligence</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Upload your PDF resume to extract skills, experience, and get AI-powered resume scoring.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="space-y-6">
          <div className="new-card space-y-5 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Upload size={16} className="text-[var(--accent-primary)]" /> Upload Resume
            </h2>

            {/* Target Role Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Target Role (Optional)
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-solid border border-surface-border text-white placeholder-gray-600 rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 font-mono"
              >
                <option value="">Select a role... (Optional)</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
              </select>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[var(--accent-primary)] bg-[rgba(var(--accent-rgb),0.1)]"
                  : "border-gray-700 hover:border-[var(--accent-primary)]/50 hover:bg-white/5"
              }`}
            >
              <FileText size={36} className="mx-auto text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                Drag & drop your PDF resume, or{" "}
                <span className="text-[var(--accent-primary)] font-semibold">click to browse</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">PDF only • Max 10MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              className="w-full gap-2"
              loading={uploading}
            >
              <Upload size={16} /> {resume ? "Replace Resume" : "Upload PDF Resume"}
            </Button>

            {resume && (
              <Button
                onClick={handleReanalyze}
                variant="secondary"
                className="w-full gap-2"
                loading={reanalyzing}
              >
                <RefreshCw size={16} /> Re-analyze with AI
              </Button>
            )}
          </div>

          {/* Match Score */}
          <div className="new-card text-center space-y-4 bg-[rgba(var(--accent-rgb),0.05)] border-[var(--surface-border-new)] p-6">
            <Brain size={32} className={`mx-auto ${scoreColor}`} />
            <div>
              <div className={`text-5xl font-extrabold font-mono ${scoreColor}`}>
                {scoreValue}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Resume Score</div>
            </div>
            <ProgressBar value={scoreValue} size="sm" />
            <div className="pt-2">
              {resume && Array.isArray(resume.aiSummary) ? (
                <ul className="text-left text-xs text-gray-400 leading-relaxed space-y-2">
                  {resume.aiSummary.map((point, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 leading-relaxed text-center">
                  {resume ? resume.aiSummary : "Upload your resume to get a detailed AI evaluation and score."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Parsed Data Panel */}
        {resume ? (
          <div className="lg:col-span-2 space-y-6">
            {/* File info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono bg-white/5 p-3 rounded-lg border border-surface-border">
              <FileText size={16} className="text-[var(--accent-primary)] shrink-0" />
              <span className="text-gray-300 font-semibold">{resume.originalName}</span>
              <span>•</span>
              <span>{(resume.fileSize / 1024).toFixed(0)} KB</span>
              <span>•</span>
              <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
            </div>

            {/* Skills */}
            <div className="new-card space-y-4 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Code2 size={16} className="text-[var(--accent-primary)]" /> Skills ({resume.skills?.current?.length || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-500 font-mono mb-3">Current</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills?.current?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs rounded-full bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-primary)] font-mono font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                    {(!resume.skills?.current || resume.skills.current.length === 0) && (
                      <span className="text-gray-500 text-xs font-mono">No skills extracted. Try re-analyzing.</span>
                    )}
                  </div>
                </div>
                <div className="bg-[rgba(var(--accent-rgb),0.05)] border border-[rgba(var(--accent-rgb),0.2)] rounded-lg p-4 h-fit shadow-[inset_0_1px_15px_rgba(var(--accent-rgb),0.05)]">
                  <h4 className="text-[10px] uppercase font-bold text-[var(--accent-primary)] font-mono mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> Scope for Improvement</h4>
                  <p className="text-gray-200 font-medium text-xs leading-relaxed">{resume.skills?.improvementScope || "No suggestions available."}</p>
                </div>
              </div>
            </div>

            {/* Experience */}
            {resume.experience?.current && resume.experience.current.length > 0 && (
              <div className="new-card space-y-4 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Briefcase size={16} className="text-[var(--accent-primary)]" /> Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase font-bold text-gray-500 font-mono mb-2">Current</h4>
                    {resume.experience.current.map((exp, i) => (
                      <div key={i} className="border-l-2 border-[rgba(var(--accent-rgb),0.3)] pl-4 space-y-1">
                        <div className="font-semibold text-sm text-gray-200">{exp.title}</div>
                        <div className="text-xs text-[var(--accent-primary)] font-mono">{exp.company} • {exp.duration}</div>
                        {exp.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-950/10 border border-amber-500/10 rounded-lg p-4 h-fit">
                    <h4 className="text-[10px] uppercase font-bold text-amber-400 font-mono mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> Scope for Improvement</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{resume.experience.improvementScope || "No suggestions available."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education?.current && resume.education.current.length > 0 && (
              <div className="new-card space-y-4 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <GraduationCap size={16} className="text-[var(--accent-primary)]" /> Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold text-gray-500 font-mono mb-2">Current</h4>
                    {resume.education.current.map((edu, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm text-gray-200">{edu.degree}</div>
                          <div className="text-xs text-gray-400 font-mono">{edu.institution}</div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-950/10 border border-amber-500/10 rounded-lg p-4 h-fit">
                    <h4 className="text-[10px] uppercase font-bold text-amber-400 font-mono mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> Scope for Improvement</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{resume.education.improvementScope || "No suggestions available."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects?.current && resume.projects.current.length > 0 && (
              <div className="new-card space-y-4 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Star size={16} className="text-[var(--accent-primary)]" /> Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase font-bold text-gray-500 font-mono mb-2">Current</h4>
                    {resume.projects.current.map((proj, i) => (
                      <div key={i} className="space-y-2">
                        <div className="font-semibold text-sm text-gray-200">{proj.name}</div>
                        {proj.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">{proj.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tech.map((t, ti) => (
                            <span key={ti} className="px-2 py-0.5 text-[10px] rounded font-mono bg-white/5 border border-white/10 text-gray-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-950/10 border border-amber-500/10 rounded-lg p-4 h-fit">
                    <h4 className="text-[10px] uppercase font-bold text-amber-400 font-mono mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> Scope for Improvement</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{resume.projects.improvementScope || "No suggestions available."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center space-y-4 py-20">
              <Brain size={64} className="mx-auto text-gray-700" />
              <h3 className="text-xl font-bold text-gray-600">No Resume Uploaded</h3>
              <p className="text-sm text-gray-600">
                Upload your PDF resume to unlock AI-powered skill extraction, experience parsing, and career match scoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
