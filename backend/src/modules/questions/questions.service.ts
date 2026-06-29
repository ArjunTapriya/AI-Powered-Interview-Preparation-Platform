import { questionsRepository } from "./questions.repository";
import { QuestionDto, toQuestionDto } from "./questions.dto";
import { GetQuestionsQuery, GetRandomQuestionQuery } from "./questions.validation";
import { analyticsService } from "../analytics/analytics.service";
import { NotFoundError } from "../../utils/AppError";
import { Difficulty, InterviewType } from "@prisma/client";

export class QuestionsService {
  /**
   * Retrieve paginated questions matching filter conditions.
   */
  async getQuestions(filters: GetQuestionsQuery) {
    const { questions, count } = await questionsRepository.findAndCount(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const totalPages = Math.ceil(count / limit);

    return {
      questions: questions.map(toQuestionDto),
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Fetch a single question by primary ID.
   */
  async getQuestionById(id: string): Promise<QuestionDto> {
    const question = await questionsRepository.findById(id);
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    return toQuestionDto(question);
  }

  /**
   * Fetch a single random question matching constraints.
   */
  async getRandomQuestion(filters: GetRandomQuestionQuery): Promise<QuestionDto> {
    const question = await questionsRepository.findRandom(filters);
    if (!question) {
      throw new NotFoundError("No question found matching these filters");
    }
    return toQuestionDto(question);
  }

  /**
   * Evaluate analytics (weakest skill) and overall average to recommend the next best question.
   */
  async getRecommendedQuestion(userId: string): Promise<QuestionDto> {
    // 1. Query user analytics
    const summary = await analyticsService.getDashboardSummary(userId);
    const avgScore = summary.overallAverage || 0;
    const key = (summary.weakestSkill || "correctness").toLowerCase();

    // 2. Determine target difficulty based on profile
    let preferredDifficulty: Difficulty;
    if (avgScore > 80) {
      preferredDifficulty = Math.random() > 0.5 ? Difficulty.Hard : Difficulty.Medium;
    } else if (avgScore >= 50) {
      preferredDifficulty = Math.random() > 0.5 ? Difficulty.Medium : Difficulty.Easy;
    } else {
      preferredDifficulty = Difficulty.Easy;
    }

    // 3. Determine category
    let category: InterviewType = InterviewType.DSA;
    if (key === "architecture") category = InterviewType.System_Design;
    else if (key === "communication") category = InterviewType.Behavioral;

    // 4. Query repository with vectors
    let question = await questionsRepository.findRandom({
      category,
      difficulty: preferredDifficulty,
    });

    // Fallback if no specific topic/difficulty matches
    if (!question) {
      question = await questionsRepository.findRandom({ category });
    }

    // Final fallback to any question in bank
    if (!question) {
      question = await questionsRepository.findRandom({});
    }

    if (!question) {
      throw new NotFoundError("No questions found in the Question Bank");
    }

    return toQuestionDto(question);
  }

  /**
   * Fetch all 3 series and the user's score for horizontal suggestion display.
   */
  async getAllocatedSet(userId: string): Promise<any> {
    const summary = await analyticsService.getDashboardSummary(userId);
    const avgScore = summary.overallAverage || 0;

    const dbSet1 = await questionsRepository.findManyByTag("Set 1");
    const dbSet2 = await questionsRepository.findManyByTag("Set 2");
    const dbSet3 = await questionsRepository.findManyByTag("Set 3");

    // Map Prisma models to expected UI format
    const formatSet = (set: any[]) => set.map(q => ({
      id: q.slug,
      title: q.title,
      difficulty: q.difficulty,
      description: q.problemStatement,
      timeLimit: q.difficulty === "Hard" ? 45 : q.difficulty === "Medium" ? 30 : 20,
      codeTemplate: q.starterCodes?.[0]?.code || "",
      optimalCode: q.solutions?.[0]?.code || "",
    }));

    const weakestSkill = summary.weakestSkill || "correctness";
    let prepSteps: string[] = [];

    if (weakestSkill === "architecture") {
      prepSteps = [
        "System Design Audit: Review past distributed architecture flaws.",
        "Scalability Patterns: Deep dive into Load Balancers & CDN.",
        "Database Sharding: Understand horizontal vs vertical scaling.",
        "Microservices vs Monoliths: Trade-offs and case studies.",
        "Caching Strategies: Redis, Memcached, and eviction policies.",
        "Mock Interview 1: Whiteboarding a scalable messaging queue.",
        "CAP Theorem: Study consistency, availability, partition tolerance.",
        "Event-Driven Architecture: Pub/Sub and Kafka fundamentals.",
        "Mock Interview 2: Designing a global video streaming service.",
        "Final Review: Consolidate design trade-offs and rest."
      ];
    } else if (weakestSkill === "communication") {
      prepSteps = [
        "Resume Audit: Finalize impact metrics and numbers.",
        "Behavioral Baseline: The STAR Method fundamentals.",
        "Story Mapping: Draft 5 stories for Leadership, Conflict, Failure.",
        "Communication Drill: Practice 'Thinking Out Loud' while coding.",
        "Mock Interview 1: Behavior & Culture Fit (Amazon LPs).",
        "Body Language & Delivery: Eye contact and tone optimization.",
        "Answering the Unanswerable: Strategy for 'I don't know' moments.",
        "Mock Interview 2: Technical Explanation of a complex concept.",
        "Reverse Interviewing: Prepare 3 intelligent questions for the interviewer.",
        "Final Review: Rehearse stories in front of a mirror and rest."
      ];
    } else {
      // Default / Correctness / Speed (DSA Focus)
      prepSteps = [
        "Resume Audit: Finalize technical projects and GitHub links.",
        "Core Syntax Mastery: Deep dive into language-specific standard library.",
        "DSA Fundamentals: HashMaps, Arrays, and String manipulation.",
        "Two-Pointers & Sliding Window: Master O(N) array traversals.",
        "Mock Interview 1: Solving 2 Easy Arrays in 30 minutes.",
        "Tree & Graph Traversals: BFS, DFS, and topological sort.",
        "Dynamic Programming: Memoization and state transitions.",
        "Mock Interview 2: Solving 1 Medium Graph in 40 minutes.",
        "Advanced DSA: Heaps, Tries, and Disjoint Sets.",
        "Final Review: Rest, review cheat sheets, and mental prep."
      ];
    }

    return {
      score: avgScore,
      prepSteps,
      set1: formatSet(dbSet1),
      set2: formatSet(dbSet2),
      set3: formatSet(dbSet3)
    };
  }

  /**
   * Fetch all 3 series for unconditional horizontal suggestion display.
   */
  async getSets(): Promise<any> {
    const dbSet1 = await questionsRepository.findManyByTag("Set 1");
    const dbSet2 = await questionsRepository.findManyByTag("Set 2");
    const dbSet3 = await questionsRepository.findManyByTag("Set 3");

    const formatSet = (set: any[]) => set.map(q => ({
      id: q.slug,
      title: q.title,
      difficulty: q.difficulty,
      description: q.problemStatement,
      timeLimit: q.difficulty === "Hard" ? 45 : q.difficulty === "Medium" ? 30 : 20,
      codeTemplate: q.starterCodes?.[0]?.code || "",
      optimalCode: q.solutions?.[0]?.code || "",
    }));

    return {
      set1: formatSet(dbSet1),
      set2: formatSet(dbSet2),
      set3: formatSet(dbSet3)
    };
  }
}


export const questionsService = new QuestionsService();
