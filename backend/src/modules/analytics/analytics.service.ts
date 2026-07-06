import { analyticsRepository } from "./analytics.repository";
import {
  DashboardSummaryDto,
  SkillBreakdownDto,
  TrendDto,
  PerformanceInsightsDto,
} from "./analytics.dto";

export class AnalyticsService {
  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    const sessions = await analyticsRepository.getUserSessions(userId);
    const reports = await analyticsRepository.getUserEvaluations(userId);
    const questionAttempts = await analyticsRepository.getUserQuestionAttempts(userId);
    const solvedQuestions = await analyticsRepository.getSuccessfulCodeSubmissions(userId);

    const totalSessions = sessions.length;
    const totalReports = reports.length;
    const questionsSolved = solvedQuestions.length;
    const interviewsCompleted = totalSessions;

    const todayStr = new Date().toISOString().split("T")[0];
    const questionsSolvedToday = solvedQuestions.filter(q => q.createdAt.toISOString().startsWith(todayStr)).length;
    const interviewsCompletedToday = sessions.filter(s => s.createdAt.toISOString().startsWith(todayStr)).length;

    if (totalReports === 0) {
      return {
        overallAverage: 0,
        strongestSkill: "N/A",
        weakestSkill: "N/A",
        improvementPercentage: 0,
        totalSessions,
        totalReports,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        questionsSolved,
        questionsSolvedToday,
        interviewsCompleted,
        interviewsCompletedToday,
        topicStrengths: [],
        topicWeaknesses: [],
      };
    }

    let totalScore = 0;
    reports.forEach((r) => {
      const avg = ((r.correctness || 0) + (r.speed || 0) + (r.architecture || 0) + (r.communication || 0)) / 4;
      totalScore += avg;
    });
    const overallAverage = Math.round(totalScore / totalReports);

    const breakdown = await this.getSkillBreakdown(userId);
    const skills = [
      { name: "Correctness", val: breakdown.correctness },
      { name: "Speed", val: breakdown.speed },
      { name: "Architecture", val: breakdown.architecture },
      { name: "Communication", val: breakdown.communication },
    ];
    
    skills.sort((a, b) => b.val - a.val);
    const strongestSkill = skills[0].name;
    const weakestSkill = skills[skills.length - 1].name;

    let improvementPercentage = 0;
    if (reports.length >= 2) {
      const recent = reports.slice(0, 5);
      const previous = reports.slice(5, 10);

      const getAvg = (reps: typeof reports) => {
        if (reps.length === 0) return 0;
        const sum = reps.reduce((acc, r) => acc + ((r.correctness || 0) + (r.speed || 0) + (r.architecture || 0) + (r.communication || 0)) / 4, 0);
        return sum / reps.length;
      };

      const recentAvg = getAvg(recent);
      const previousAvg = getAvg(previous);

      if (previousAvg > 0) {
        improvementPercentage = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
      } else {
        improvementPercentage = recentAvg > 0 ? 100 : 0;
      }
    }

    // --- New Metrics Calculation ---
    const allActivityDates = [
      ...sessions.map((s) => s.createdAt),
      ...questionAttempts.map((q) => q.createdAt),
    ];

    const { currentStreak, longestStreak, totalActiveDays } = this.calculateStreaks(allActivityDates);
    
    // Simplistic Topic Strengths (Mocked until Evaluation Report gives exact topic breakdowns)
    // We rely on getInsights which we will build shortly
    const insights = await this.getInsights(userId);

    return {
      overallAverage,
      strongestSkill,
      weakestSkill,
      improvementPercentage,
      totalSessions,
      totalReports,
      currentStreak,
      longestStreak,
      totalActiveDays,
      questionsSolved,
      questionsSolvedToday,
      interviewsCompleted,
      interviewsCompletedToday,
      topicStrengths: insights.strengths,
      topicWeaknesses: insights.weaknesses,
    };
  }

  private calculateStreaks(dates: Date[]) {
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };

    const uniqueDates = Array.from(new Set(dates.map((d) => d.toISOString().split("T")[0])))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const totalActiveDays = uniqueDates.length;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Check if streak is active (activity today or yesterday)
    let isStreakActive = uniqueDates.includes(today) || uniqueDates.includes(yesterday);

    let lastDate: Date | null = null;

    // Calculate longest streak
    const ascendingDates = [...uniqueDates].reverse();
    for (const dateStr of ascendingDates) {
      const dateObj = new Date(dateStr);
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffInDays = Math.round((dateObj.getTime() - lastDate.getTime()) / 86400000);
        if (diffInDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      lastDate = dateObj;
    }

    // Calculate current streak
    if (isStreakActive) {
      currentStreak = 1;
      let currDateObj = new Date(uniqueDates[0] === today ? today : yesterday);
      let foundIndex = uniqueDates.indexOf(currDateObj.toISOString().split("T")[0]);
      
      if (foundIndex !== -1) {
        for (let i = foundIndex + 1; i < uniqueDates.length; i++) {
          const prevDateStr = uniqueDates[i];
          const prevDateObj = new Date(prevDateStr);
          const diffInDays = Math.round((currDateObj.getTime() - prevDateObj.getTime()) / 86400000);
          if (diffInDays === 1) {
            currentStreak++;
            currDateObj = prevDateObj;
          } else {
            break;
          }
        }
      }
    }

    return { currentStreak, longestStreak, totalActiveDays };
  }

  async getSkillBreakdown(userId: string): Promise<SkillBreakdownDto> {
    const reports = await analyticsRepository.getUserEvaluations(userId);

    if (reports.length === 0) {
      return { correctness: 0, speed: 0, architecture: 0, communication: 0 };
    }

    let c = 0, s = 0, a = 0, comm = 0;
    reports.forEach((r) => {
      c += (r.correctness || 0);
      s += (r.speed || 0);
      a += (r.architecture || 0);
      comm += (r.communication || 0);
    });

    const len = reports.length;
    return {
      correctness: Math.round(c / len),
      speed: Math.round(s / len),
      architecture: Math.round(a / len),
      communication: Math.round(comm / len),
    };
  }

  async getTrends(userId: string, period: "daily" | "weekly" | "monthly"): Promise<TrendDto[]> {
    const reports = await analyticsRepository.getUserEvaluations(userId);
    
    // Group reports by period
    const grouped = new Map<string, number[]>();

    reports.forEach((r) => {
      const date = new Date(r.createdAt);
      let key = "";

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
        key = firstDay.toISOString().split("T")[0]; // Start of week
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
      }

      const avg = ((r.correctness || 0) + (r.speed || 0) + (r.architecture || 0) + (r.communication || 0)) / 4;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(avg);
    });

    const trends: TrendDto[] = [];
    grouped.forEach((scores, dateKey) => {
      const sum = scores.reduce((a, b) => a + b, 0);
      trends.push({
        date: dateKey,
        score: Math.round(sum / scores.length),
      });
    });

    // Sort chronologically ascending for charts
    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getInsights(userId: string): Promise<PerformanceInsightsDto> {
    const reports = await analyticsRepository.getUserEvaluations(userId);
    const breakdown = await this.getSkillBreakdown(userId);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (reports.length === 0) {
      return {
        strengths: ["Complete a diagnostic session to unlock strengths."],
        weaknesses: ["Complete a diagnostic session to identify weaknesses."],
        recommendations: ["Start with a basic DSA or Behavioral practice run."],
      };
    }

    // Rule-based insight generation
    if (breakdown.architecture > 85) strengths.push("Strong distributed systems architectural logic.");
    if (breakdown.communication > 85) strengths.push("Excellent communication and articulation of ideas.");
    if (breakdown.correctness > 85) strengths.push("High code correctness and optimal algorithm selection.");
    if (breakdown.speed > 85) strengths.push("Fast implementation velocity under pressure.");

    if (breakdown.speed < 60) {
      weaknesses.push("Coding speed and refactoring velocity");
      recommendations.push("Practice timed coding sessions using Medium-difficulty problems.");
    }
    if (breakdown.correctness < 60) {
      weaknesses.push("Algorithm correctness and edge-case handling");
      recommendations.push("Focus on manual dry-runs and identifying array/tree boundary conditions.");
    }
    if (breakdown.architecture < 60) {
      weaknesses.push("System design scalability patterns");
      recommendations.push("Review cache invalidation strategies and database sharding techniques.");
    }
    if (breakdown.communication < 60) {
      weaknesses.push("Verbal articulation and reliance on filler words");
      recommendations.push("Utilize the STAR method framework to structure your explanations.");
    }

    // Fallbacks
    if (strengths.length === 0) strengths.push("Building consistent practice habits.");
    if (weaknesses.length === 0) weaknesses.push("Pushing time-complexity bounds.");
    if (recommendations.length === 0) recommendations.push("Maintain current velocity and explore Hard difficulty topics.");

    return { strengths, weaknesses, recommendations };
  }

  async logHeartbeat(userId: string, durationSeconds: number, dateStr?: string): Promise<void> {
    const date = dateStr || new Date().toISOString().split("T")[0];
    await analyticsRepository.upsertActivity(userId, date, durationSeconds);
  }

  async getWeeklyActivity(userId: string, dateStrings: string[]): Promise<{ date: string; durationMinutes: number }[]> {
    const logs = await analyticsRepository.getWeeklyActivity(userId, dateStrings);
    const logMap = new Map(logs.map(log => [log.date, Math.round(log.durationSeconds / 60)]));

    return dateStrings.map(date => ({
      date,
      durationMinutes: logMap.get(date) || 0,
    }));
  }
}

export const analyticsService = new AnalyticsService();
