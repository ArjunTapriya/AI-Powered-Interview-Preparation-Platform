import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { KeyRound, Mail, User, ShieldAlert } from "lucide-react";

export const AuthLayout: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("arjun@example.com");
  const [name, setName] = useState("Arjun Tapriya");
  const [password, setPassword] = useState("SecurePass1!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      setAccessToken(data.data.token.accessToken);
      setUser(data.data.user);

      if (data.data.user.diagnosticCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md p-8 glass-panel-glow border-[var(--accent-primary)]/20 shadow-glass-glowing relative">
        {/* Glow decoration */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-indigo-600 font-sans tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? "Access your custom prep workspace" : "Get started with custom roadmaps & stress simulation"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 tracking-wider uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-solid rounded-lg border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all font-sans text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-solid rounded-lg border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all font-sans text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 tracking-wider uppercase">Password</label>
              {isLogin && (
                <button type="button" className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-hover)] hover:underline">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-solid rounded-lg border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all font-sans text-sm"
                placeholder="Enter password"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" loading={loading}>
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-surface-border pt-6">
          <span className="text-gray-500">
            {isLogin ? "New to Antigravity Prep?" : "Already have an account?"}
          </span>{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-semibold transition-colors focus:outline-none"
          >
            {isLogin ? "Create account" : "Sign in here"}
          </button>
        </div>
      </Card>
    </div>
  );
};
