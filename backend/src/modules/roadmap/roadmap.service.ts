import { syllabusNodes, SyllabusNode } from "./roadmap.catalog";
import { roadmapRepository } from "./roadmap.repository";
import { RecommendationDto } from "./roadmap.dto";
import { analyticsService } from "../analytics/analytics.service";

export class RoadmapService {
  /**
   * Retrieve the full static catalog of syllabus roadmap nodes.
   */
  async getRoadmap(): Promise<SyllabusNode[]> {
    return syllabusNodes;
  }

  /**
   * Fetch all nodes marked completed by a specific user.
   */
  async getProgress(userId: string): Promise<string[]> {
    const records = await roadmapRepository.getUserProgress(userId);
    return records.filter((r) => r.completed).map((r) => r.nodeId);
  }

  /**
   * Mark a node completed or uncompleted for a user.
   */
  async markProgress(
    userId: string,
    nodeId: string,
    completed: boolean
  ): Promise<string[]> {
    await roadmapRepository.upsertProgress(userId, nodeId, completed);
    return this.getProgress(userId);
  }

  /**
   * Evaluate analytics dynamically using the Analytics module
   * and recommend the next challenge based on the weakest skill.
   */
  async getRecommendations(userId: string): Promise<RecommendationDto> {
    const summary = await analyticsService.getDashboardSummary(userId);
    const key = (summary.weakestSkill || "correctness").toLowerCase();

    if (key === "correctness" || key === "speed") {
      return {
        title: "Merge k Sorted Lists (DSA)",
        desc: "Practice heap sorting time bounds under stress configurations.",
        type: "DSA",
        challenge: {
          id: "dsa-merge-k",
          title: "Merge k Sorted Lists",
          type: "DSA",
          difficulty: "Hard",
          timeLimit: 40,
          description: "Merge k sorted linked lists and return it as one sorted list.",
          codeTemplate: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Write optimal O(N log k) solution\n    return null;\n}",
          optimalCode: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Using a Min-Heap is standard.\n    // Time Complexity: O(N log k), Space: O(k) for heap storage.\n    return null;\n}",
          transcript: [
            { speaker: "Interviewer", text: "We have multiple log streams that are pre-sorted by timestamp. How would you aggregate them into a single sorted stream?" },
            { speaker: "Candidate", text: "We can use a Min-Heap containing the head elements. At each step, we pop the smallest and insert its successor.", isFiller: false },
            { speaker: "Interviewer", text: "What's the space complexity of that?", isFiller: false },
            { speaker: "Candidate", text: "Like, it would be, uh, O(k) space where k is the number of lists.", isFiller: true }
          ]
        }
      };
    } else if (key === "architecture") {
      return {
        title: "Design a Distributed Cache (System Design)",
        desc: "Construct visual topologies, database cache invalidation models, and edge clusters.",
        type: "System Design",
        challenge: {
          id: "sys-design-cache",
          title: "Distributed Cache",
          type: "System Design",
          difficulty: "Medium",
          timeLimit: 45,
          description: "Design a high-throughput cache cluster with eviction policies and consistency.",
          codeTemplate: "// Define cache nodes and replication structure\nclass DistributedCache {\n    get(key: string): string | null {}\n    put(key: string, value: string): void {}\n}",
          optimalCode: "// Distributed cache uses consistent hashing to assign cache keys to nodes.\n// Eviction policies include LRU/LFU. Write-through vs Write-around is detailed.\n",
          transcript: [
            { speaker: "Interviewer", text: "How do you handle hot spots if a single cache key receives massive traffic?" },
            { speaker: "Candidate", text: "We can deploy read replicas for hot keys or use local cache caching inside clients.", isFiller: false },
            { speaker: "Interviewer", text: "Excellent, how does cache invalidation fit in?", isFiller: false },
            { speaker: "Candidate", text: "Actually, we should use, you know, write-through caches or CDC from databases.", isFiller: true }
          ]
        }
      };
    } else {
      // Default / Behavioral
      return {
        title: "Tell me about a time you resolved a conflict (Behavioral)",
        desc: "Structure stories using the STAR method (Situation, Task, Action, Result) for leadership evaluation.",
        type: "Behavioral",
        challenge: {
          id: "beh-conflict",
          title: "Resolving Team Conflicts",
          type: "Behavioral",
          difficulty: "Easy",
          timeLimit: 30,
          description: "Explain a situation where you had a strong technical disagreement with a peer.",
          codeTemplate: "# STAR Story Outline\n- Situation:\n- Task:\n- Action:\n- Result:",
          optimalCode: "- Situation: Conflict on React SSR implementation.\n- Task: Deliver system under latency bounds.\n- Action: Set up A/B validation tests to gather empirical logs.\n- Result: Improved latency by 30% and unified team direction.",
          transcript: [
            { speaker: "Interviewer", text: "Can you tell me about a time you disagreed with a colleague on architectural patterns?" },
            { speaker: "Candidate", text: "Yes, we were building SSR. I wanted caching, they didn't. I built a benchmark to show metrics.", isFiller: false },
            { speaker: "Interviewer", text: "How did they react to the data?", isFiller: false },
            { speaker: "Candidate", text: "Uhm, basically they agreed since the numbers were, like, very clear.", isFiller: true }
          ]
        }
      };
    }
  }
}

export const roadmapService = new RoadmapService();
