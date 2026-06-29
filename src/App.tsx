import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./store/AppContext";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./components/LandingPage";
import { AuthLayout } from "./features/auth/components/AuthLayout";
import { OnboardingFlow } from "./features/auth/components/OnboardingFlow";
import { DashboardHome } from "./features/dashboard/components/DashboardHome";
import { PracticeWorkspace } from "./features/workspace/components/PracticeWorkspace";
import { EvaluationReport } from "./features/evaluation/components/EvaluationReport";
import { RoadmapTree } from "./features/roadmap/components/RoadmapTree";
import { InterviewPractice } from "./features/interview/components/InterviewPractice";
import { ResumeUpload } from "./features/resume/components/ResumeUpload";
import { AIFeedback } from "./features/ai-feedback/components/AIFeedback";
import { NotesResources } from "./features/notes/components/NotesResources";
import { PricingPage } from "./features/subscription/components/PricingPage";
import { AdminLayout } from "./features/admin/components/AdminLayout";
import { QuestionSeriesPage } from "./features/dashboard/components/QuestionSeriesPage";

const AppContent: React.FC = () => {
  const location = useLocation();
  const { themeMode, themeAccent } = useApp() as any;
  const isPublicRoute = ["/", "/auth", "/onboarding"].includes(location.pathname);

  React.useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    root.setAttribute("data-theme", themeAccent || "orange");
  }, [themeMode, themeAccent]);

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans">
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthLayout />} />
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar-new">
        <TopHeader />
        <main className="flex-1 px-8 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="/pricing" element={<PricingPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/workspace" element={<PracticeWorkspace />} />
                  <Route path="/evaluation" element={<EvaluationReport />} />
                  <Route path="/roadmap" element={<RoadmapTree />} />
                  <Route path="/interview-practice" element={<InterviewPractice />} />
                  <Route path="/ai-feedback" element={<AIFeedback />} />
                  <Route path="/notes" element={<NotesResources />} />
                  <Route path="/resume" element={<ResumeUpload />} />
                  <Route path="/series/:seriesId" element={<QuestionSeriesPage />} />
                  <Route path="/admin/*" element={<AdminLayout />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
