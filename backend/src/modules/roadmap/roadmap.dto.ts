export interface RoadmapProgressDto {
  id: string;
  userId: string;
  nodeId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface RecommendationDto {
  title: string;
  desc: string;
  type: "DSA" | "System Design" | "Behavioral";
  challenge: {
    id: string;
    title: string;
    type: "DSA" | "System Design" | "Behavioral";
    difficulty: "Easy" | "Medium" | "Hard";
    timeLimit: number;
    description: string;
    codeTemplate: string;
    optimalCode: string;
    transcript?: any[];
  };
}

export function toRoadmapProgressDto(entity: any): RoadmapProgressDto {
  return {
    id: entity.id,
    userId: entity.userId,
    nodeId: entity.nodeId,
    completed: entity.completed,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    completedAt: entity.completedAt ? entity.completedAt.toISOString() : null,
  };
}
