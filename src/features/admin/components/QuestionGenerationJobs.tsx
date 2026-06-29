import React, { useState } from "react";

import { Button } from "../../../components/ui/Button";
import { apiFetch } from "../../../utils/apiFetch";
import { Loader2, Plus } from "lucide-react";

export const QuestionGenerationJobs: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [type, setType] = useState("DSA");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<any>(null);

  const startJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/question-generation/bulk-generate", {
        method: "POST",
        body: JSON.stringify({ topic, difficulty, type, count }),
      });
      const data = await res.json();
      if (data.success && data.data?.jobId) {
        setJobStatus({ id: data.data.jobId, status: "PENDING" });
        pollJob(data.data.jobId);
      } else {
        alert("Failed to start job: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error starting job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pollJob = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await apiFetch(`/question-generation/status/${jobId}`);
        const data = await res.json();
        if (data.success && data.data?.job) {
          setJobStatus(data.data.job);
          if (data.data.job.status === "DONE" || data.data.job.status === "FAILED") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Question Generation</h1>
        <p className="text-gray-400">Bulk generate interview questions using AI.</p>
      </div>

      <div className="new-card p-6 bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)]">
        <form onSubmit={startJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Programming, System Design"
                className="w-full bg-[#16161A] border border-surface-border text-white rounded-md px-3 py-2 focus:border-[var(--accent-primary)] outline-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Type</label>
              <select
                className="w-full bg-[#16161A] border border-surface-border text-white rounded-md px-3 py-2 focus:border-[var(--accent-primary)] outline-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="System_Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Difficulty</label>
              <select
                className="w-full bg-[#16161A] border border-surface-border text-white rounded-md px-3 py-2 focus:border-[var(--accent-primary)] outline-none"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Count</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                className="w-full bg-[#16161A] border border-surface-border text-white rounded-md px-3 py-2 focus:border-[var(--accent-primary)] outline-none"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Start Generation Job
          </Button>
        </form>
      </div>

      {jobStatus && (
        <div className="new-card p-6 bg-[rgba(255,255,255,0.02)] border-[var(--surface-border-new)] border-l-4 border-l-[var(--accent-primary)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Latest Job Status</h3>
            <span className={`px-2.5 py-1 text-xs rounded-full font-mono font-bold ${
              jobStatus.status === "DONE" ? "bg-emerald-950/40 text-emerald-400" :
              jobStatus.status === "FAILED" ? "bg-rose-950/40 text-rose-400" :
              "bg-blue-950/40 text-blue-400 animate-pulse"
            }`}>
              {jobStatus.status}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400 font-mono">
            <p>Job ID: {jobStatus.id}</p>
            {jobStatus.topic && <p>Target: {jobStatus.count}x {jobStatus.difficulty} {jobStatus.topic}</p>}
            {jobStatus.resultIds && <p>Generated: {jobStatus.resultIds.length} / {jobStatus.count || count}</p>}
            {jobStatus.errorMsg && <p className="text-rose-400 mt-2">Error: {jobStatus.errorMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
