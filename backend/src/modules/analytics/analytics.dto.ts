export interface DashboardSummaryDto {
  overallAverage: number;
  strongestSkill: string;
  weakestSkill: string;
  improvementPercentage: number;
  totalSessions: number;
  totalReports: number;
  
  // New Fields for Step 15
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  questionsSolved: number;
  questionsSolvedToday: number;
  interviewsCompleted: number;
  interviewsCompletedToday: number;
  topicStrengths: string[];
  topicWeaknesses: string[];
}

export interface SkillBreakdownDto {
  correctness: number;
  speed: number;
  architecture: number;
  communication: number;
}

export interface TrendDto {
  date: string;
  score: number;
}

export interface PerformanceInsightsDto {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
