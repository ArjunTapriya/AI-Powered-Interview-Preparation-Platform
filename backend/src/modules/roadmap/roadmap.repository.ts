import { RoadmapProgress } from "@prisma/client";
import { prisma } from "../../config/database";

export class RoadmapRepository {
  /**
   * Fetch all roadmap progress entries for a given user.
   */
  async getUserProgress(userId: string): Promise<RoadmapProgress[]> {
    return prisma.roadmapProgress.findMany({
      where: { userId },
      orderBy: { nodeId: "asc" },
    });
  }

  /**
   * Create or update a progress node status.
   * Updates completedAt timestamp accordingly.
   */
  async upsertProgress(
    userId: string,
    nodeId: string,
    completed: boolean
  ): Promise<RoadmapProgress> {
    const completedAt = completed ? new Date() : null;

    return prisma.roadmapProgress.upsert({
      where: {
        userId_nodeId: {
          userId,
          nodeId,
        },
      },
      update: {
        completed,
        completedAt,
      },
      create: {
        userId,
        nodeId,
        completed,
        completedAt,
      },
    });
  }
}

export const roadmapRepository = new RoadmapRepository();
