export interface SyllabusNode {
  id: string;
  title: string;
  category: "DSA" | "System Design" | "Behavioral";
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  prerequisites: string[];
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

export const syllabusNodes: SyllabusNode[] = [
  {
    id: "dsa-basics",
    title: "Recursion & Backtracking Fundamentals",
    category: "DSA",
    difficulty: "Easy",
    description: "Master call stacks, depth trees, and recursion constraints.",
    prerequisites: [],
    challenge: {
      id: "dsa-recurse",
      title: "Fibonacci Sequence Call Stack",
      type: "DSA",
      difficulty: "Easy",
      timeLimit: 20,
      description: "Implement Fibonacci sequence calculator recursively with memoization optimization.",
      codeTemplate: "function fib(n: number, memo: Record<number, number> = {}): number {\n    // Write base case & memo lookup\n    return 0;\n}",
      optimalCode: "function fib(n: number, memo: Record<number, number> = {}): number {\n    if (n <= 1) return n;\n    if (memo[n]) return memo[n];\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n    return memo[n];\n}"
    }
  },
  {
    id: "sys-design-basics",
    title: "Network Fundamentals & Latency API",
    category: "System Design",
    difficulty: "Easy",
    description: "Understand TCP vs UDP, DNS loops, and REST constraints.",
    prerequisites: [],
    challenge: {
      id: "sys-net",
      title: "Designing REST endpoints",
      type: "System Design",
      difficulty: "Easy",
      timeLimit: 25,
      description: "Draft structural routes for a scalable messaging system configuration.",
      codeTemplate: "# API REST Endpoints Spec\n- POST /messages\n- GET /messages/:id\n- DELETE /messages/:id",
      optimalCode: "POST /messages - Create message body\nGET /messages/:id - Fetch message by uuid\nPUT /messages/:id - Update edit notes"
    }
  },
  {
    id: "dsa-intermediate",
    title: "Sliding Window & Hash Indexes",
    category: "DSA",
    difficulty: "Medium",
    description: "Optimize quadratic sub-arrays checks to linear checks.",
    prerequisites: ["dsa-basics"],
    challenge: {
      id: "dsa-sliding",
      title: "Longest Substring Without Repeating Characters",
      type: "DSA",
      difficulty: "Medium",
      timeLimit: 30,
      description: "Find the length of the longest substring without repeating characters.",
      codeTemplate: "function lengthOfLongestSubstring(s: string): number {\n    let maxLen = 0;\n    \n    return maxLen;\n}",
      optimalCode: "function lengthOfLongestSubstring(s: string): number {\n    const map = new Map<string, number>();\n    let left = 0, max = 0;\n    for (let r = 0; r < s.length; r++) {\n        if (map.has(s[r])) {\n            left = Math.max(map.get(s[r])! + 1, left);\n        }\n        map.set(s[r], r);\n        max = Math.max(max, r - left + 1);\n    }\n    return max;\n}"
    }
  },
  {
    id: "sys-design-intermediate",
    title: "Consistent Hashing & Cache Invalidation",
    category: "System Design",
    difficulty: "Medium",
    description: "Scale database read replicas dynamically with minimal cache misses.",
    prerequisites: ["sys-design-basics"],
    challenge: {
      id: "sys-cache",
      title: "Consistent Hashing Ring",
      type: "System Design",
      difficulty: "Medium",
      timeLimit: 40,
      description: "Map partition keys onto hashing ring nodes with virtual points.",
      codeTemplate: "class ConsistentHashingRing {\n    addNode(node: string): void {}\n    getNode(key: string): string {}\n}",
      optimalCode: "class ConsistentHashingRing {\n    // Consistent hashing ring stores hash points mapping keys to servers.\n}"
    }
  },
  {
    id: "dsa-advanced",
    title: "Heaps & Merge Sort Algorithms",
    category: "DSA",
    difficulty: "Hard",
    description: "Merge k sorted lists using Priority Queues.",
    prerequisites: ["dsa-intermediate"],
    challenge: {
      id: "dsa-merge-k",
      title: "Merge k Sorted Lists",
      type: "DSA",
      difficulty: "Hard",
      timeLimit: 45,
      description: "Merge k sorted linked lists and return it as one sorted list.",
      codeTemplate: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    return null;\n}",
      optimalCode: "function mergeKLists(lists: ListNode[]): ListNode | null {\n    // Complete min-heap insertion implementation\n}"
    }
  },
  {
    id: "sys-design-advanced",
    title: "Rate Limiter & Load Balancer Topologies",
    category: "System Design",
    difficulty: "Hard",
    description: "Protect client-facing APIs from spikes and DDoS loops.",
    prerequisites: ["sys-design-intermediate"],
    challenge: {
      id: "sys-rate-limiter",
      title: "Token Bucket Rate Limiter",
      type: "System Design",
      difficulty: "Hard",
      timeLimit: 40,
      description: "Implement a thread-safe token bucket rate limiting middleware logic.",
      codeTemplate: "class TokenBucketLimiter {\n    allowRequest(clientId: string): boolean {}\n}",
      optimalCode: "class TokenBucketLimiter {\n    // Token bucket tracks token count refreshed over timestamps.\n}"
    }
  },
  {
    id: "star-behavioral",
    title: "STAR Communication: Conflict Leadership",
    category: "Behavioral",
    difficulty: "Medium",
    description: "Explain disagreements using Situation, Task, Action, and Result outlines.",
    prerequisites: [],
    challenge: {
      id: "star-conflict",
      title: "Describe a Conflict Story",
      type: "Behavioral",
      difficulty: "Medium",
      timeLimit: 30,
      description: "Write out a structured story answering: 'Tell me about a time you had a major technical dispute with a lead.'",
      codeTemplate: "# STAR Breakdown:\n- Situation:\n- Task:\n- Action:\n- Result:",
      optimalCode: "- Situation: Dispute on migration to AWS cloud microservices.\n- Task: Align tech requirements before release deadline.\n- Action: Set up code benchmark logs.\n- Result: Completed project on time, improving response latency by 20%."
    }
  }
];
