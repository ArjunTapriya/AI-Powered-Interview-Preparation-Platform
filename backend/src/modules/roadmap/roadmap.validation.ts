import { z } from "zod";
import { syllabusNodes } from "./roadmap.catalog";

const validNodeIds = syllabusNodes.map((node) => node.id);

export const updateRoadmapProgressSchema = z
  .object({
    nodeId: z.string().refine((val) => validNodeIds.includes(val), {
      message: "Invalid nodeId. Must be a valid syllabus roadmap node ID.",
    }),
    completed: z.boolean(),
  })
  .strict();

export type UpdateRoadmapProgressInput = z.infer<typeof updateRoadmapProgressSchema>;
