import { Question } from "@prisma/client";

export interface QuestionDto {
  id: string;
  title: string;
  slug: string;
  problemStatement: string;
  realWorldScenario?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  createdAt: string;
  updatedAt: string;
}

export function toQuestionDto(q: Question): QuestionDto {
  return {
    id: q.id,
    title: q.title,
    slug: q.slug,
    problemStatement: q.problemStatement,
    realWorldScenario: q.realWorldScenario || undefined,
    difficulty: q.difficulty,
    topic: q.topic,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}
