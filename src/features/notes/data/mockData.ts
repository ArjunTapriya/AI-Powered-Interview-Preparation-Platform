import type { Resource, Recommendation, DSANote, Insight } from '../types';

export const mockResources: Resource[] = [
  {
    id: "r1",
    title: "System Design Primer",
    description: "Learn how to design large-scale systems. Prep for the system design interview.",
    type: "Repository",
    sourceName: "GitHub",
    sourceUrl: "https://github.com/donnemartin/system-design-primer",
    difficulty: "Intermediate",
    estimatedTime: "25 hours",
    aiScore: 99,
    aiPreview: "Comprehensive guide to System Design, covering scalability, latency vs throughput, CAP theorem, and consistency patterns frequently tested by top tech companies.",
    isBookmarked: true,
    tags: ["System Design", "Scalability", "Architecture"]
  },
  {
    id: "r2",
    title: "Dynamic Programming Patterns",
    description: "Understand DP with common patterns and problems.",
    type: "Article",
    sourceName: "NeetCode",
    sourceUrl: "https://neetcode.io",
    difficulty: "Advanced",
    estimatedTime: "45 min",
    aiScore: 96,
    aiPreview: "Explains how to identify DP problems using overlapping subproblems and optimal substructure, breaking down Knapsack and Longest Common Subsequence patterns.",
    isBookmarked: false,
    tags: ["Dynamic Programming", "Algorithms", "DSA"]
  },
  {
    id: "r3",
    title: "Top Interview 150",
    description: "Curated list of must-do problems for interviews.",
    type: "Practice",
    sourceName: "LeetCode",
    sourceUrl: "https://leetcode.com",
    difficulty: "Intermediate",
    estimatedTime: "50 hours",
    aiScore: 98,
    aiPreview: "A curated sequence of 150 LeetCode problems covering all major data structures and algorithms required for cracking Google and Meta interviews.",
    isBookmarked: true,
    tags: ["DSA", "Practice", "Interview Prep"]
  },
  {
    id: "r4",
    title: "Data Structures - Complete Guide",
    description: "In-depth explanation of all data structures.",
    type: "Article",
    sourceName: "GeeksforGeeks",
    sourceUrl: "https://geeksforgeeks.org",
    difficulty: "Beginner",
    estimatedTime: "12 hours",
    aiScore: 92,
    aiPreview: "Thorough explanations of arrays, linked lists, trees, and graphs, including time complexities and standard operations implemented in C++ and Java.",
    isBookmarked: false,
    tags: ["DSA", "Fundamentals"]
  },
  {
    id: "r5",
    title: "Grokking the Coding Interview",
    description: "Must-read for every coding interviewer.",
    type: "Course",
    sourceName: "Educative",
    sourceUrl: "https://educative.io",
    difficulty: "Intermediate",
    estimatedTime: "20 hours",
    aiScore: 97,
    aiPreview: "Focuses on 16 fundamental coding patterns (Sliding Window, Two Pointers, Fast & Slow Pointers) rather than memorizing individual problem solutions.",
    isBookmarked: true,
    tags: ["Patterns", "Course", "DSA"]
  },
  {
    id: "r6",
    title: "Graph Algorithms Visualized",
    description: "Visualize and understand graph algorithms.",
    type: "Article",
    sourceName: "VisuAlgo",
    sourceUrl: "https://visualgo.net",
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    aiScore: 94,
    aiPreview: "Interactive visualizations of BFS, DFS, Dijkstra's, and Bellman-Ford algorithms, making it easier to grasp graph traversals visually.",
    isBookmarked: false,
    tags: ["Graphs", "Visualization"]
  },
  {
    id: "r7",
    title: "Cracking the Coding Interview",
    description: "189 programming questions and solutions.",
    type: "Book",
    sourceName: "Amazon",
    sourceUrl: "https://amazon.com",
    difficulty: "Beginner",
    estimatedTime: "40 hours",
    aiScore: 95,
    aiPreview: "The classic interview prep book by Gayle Laakmann McDowell. Excellent for getting a baseline understanding of what to expect in Big Tech interviews.",
    isBookmarked: false,
    tags: ["Book", "DSA", "Behavioral"]
  },
  {
    id: "r8",
    title: "Binary Search Explained",
    description: "Detailed guide to binary search variations.",
    type: "Article",
    sourceName: "GeeksforGeeks",
    sourceUrl: "https://geeksforgeeks.org",
    difficulty: "Intermediate",
    estimatedTime: "20 min",
    aiScore: 91,
    aiPreview: "This article explains Binary Search variations including lower bound, upper bound, floor and ceil applications frequently asked in Google interviews.",
    isBookmarked: false,
    tags: ["Binary Search", "Algorithms"]
  },
  {
    id: "r9",
    title: "Bit Manipulation Tricks",
    description: "Learn important bit manipulation techniques.",
    type: "Article",
    sourceName: "CP-Algorithms",
    sourceUrl: "https://cp-algorithms.com",
    difficulty: "Advanced",
    estimatedTime: "45 min",
    aiScore: 88,
    aiPreview: "Covers advanced bitwise operations, isolating the rightmost 1-bit, and counting set bits in O(1) time using Brian Kernighan's algorithm.",
    isBookmarked: false,
    tags: ["Bit Manipulation", "Math"]
  },
  {
    id: "r10",
    title: "System Design Roadmap",
    description: "Step-by-step system design roadmap.",
    type: "Roadmap",
    sourceName: "ByteByteGo",
    sourceUrl: "https://bytebytego.com",
    difficulty: "Intermediate",
    estimatedTime: "2 hours",
    aiScore: 98,
    aiPreview: "A structured path to learning System Design, created by Alex Xu. Covers databases, caching, message queues, and load balancers sequentially.",
    isBookmarked: true,
    tags: ["System Design", "Roadmap"]
  },
  {
    id: "r11",
    title: "AWS Architecture Blog",
    description: "Real-world system architectures from AWS.",
    type: "Article",
    sourceName: "AWS Blog",
    sourceUrl: "https://aws.amazon.com/blogs/architecture/",
    difficulty: "Advanced",
    estimatedTime: "15 min",
    aiScore: 93,
    aiPreview: "Deep dives into how companies scale on AWS using microservices, event-driven architectures, and serverless compute.",
    isBookmarked: false,
    tags: ["System Design", "Cloud", "AWS"]
  },
  {
    id: "r12",
    title: "CS50: Intro to Computer Science",
    description: "Harvard's introductory computer science course.",
    type: "Course",
    sourceName: "Harvard CS50",
    sourceUrl: "https://cs50.harvard.edu/",
    difficulty: "Beginner",
    estimatedTime: "12 weeks",
    aiScore: 90,
    aiPreview: "A fantastic primer on C, Python, SQL, and JavaScript, focusing on memory management and basic data structures.",
    isBookmarked: false,
    tags: ["CS Basics", "Course"]
  },
  {
    id: "r13",
    title: "Uber Engineering Blog",
    description: "How Uber handles millions of requests.",
    type: "Article",
    sourceName: "Uber Engineering",
    sourceUrl: "https://eng.uber.com/",
    difficulty: "Advanced",
    estimatedTime: "25 min",
    aiScore: 96,
    aiPreview: "Detailed case studies on Uber's real-time dispatch systems, geospatial indexing (H3), and distributed databases.",
    isBookmarked: true,
    tags: ["System Design", "Real-world"]
  },
  {
    id: "r14",
    title: "Striver's SDE Sheet",
    description: "Top 180 questions for top product based companies.",
    type: "Practice",
    sourceName: "TakeUForward",
    sourceUrl: "https://takeuforward.org/",
    difficulty: "Intermediate",
    estimatedTime: "60 hours",
    aiScore: 99,
    aiPreview: "The most popular DSA sheet in India, focusing on array manipulations, linked list reversals, and essential DP patterns.",
    isBookmarked: true,
    tags: ["Practice", "DSA"]
  },
  {
    id: "r15",
    title: "React Under the Hood",
    description: "How React renders and manages state.",
    type: "Video",
    sourceName: "YouTube",
    sourceUrl: "https://youtube.com",
    difficulty: "Advanced",
    estimatedTime: "45 min",
    aiScore: 91,
    aiPreview: "A deep dive into the React Fiber reconciler, explaining how React batches updates and prioritizes rendering tasks.",
    isBookmarked: false,
    tags: ["Frontend", "React", "Architecture"]
  },
  {
    id: "r16",
    title: "Mastering the Behavioral Interview",
    description: "STAR method and leadership principles.",
    type: "Cheatsheet",
    sourceName: "Tech Dummies",
    sourceUrl: "https://youtube.com",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    aiScore: 94,
    aiPreview: "Provides 50 examples of how to answer Amazon's 16 Leadership Principles using the STAR method effectively.",
    isBookmarked: true,
    tags: ["Behavioral", "Amazon"]
  },
  {
    id: "r17",
    title: "Netflix Tech Blog: Microservices",
    description: "How Netflix scaled their microservices.",
    type: "Article",
    sourceName: "Netflix Tech",
    sourceUrl: "https://netflixtechblog.com/",
    difficulty: "Advanced",
    estimatedTime: "30 min",
    aiScore: 97,
    aiPreview: "Explains how Netflix transitioned from a monolith to microservices and how they handle fault tolerance with chaos engineering.",
    isBookmarked: false,
    tags: ["System Design", "Microservices"]
  },
  {
    id: "r18",
    title: "SQL Murder Mystery",
    description: "Learn SQL by solving a crime.",
    type: "Practice",
    sourceName: "Knight Lab",
    sourceUrl: "https://mystery.knightlab.com/",
    difficulty: "Beginner",
    estimatedTime: "2 hours",
    aiScore: 89,
    aiPreview: "A fun, interactive way to learn complex SQL JOINs, subqueries, and window functions.",
    isBookmarked: false,
    tags: ["SQL", "Databases"]
  },
  {
    id: "r19",
    title: "Designing Data-Intensive Applications",
    description: "The holy grail of distributed systems.",
    type: "Book",
    sourceName: "O'Reilly",
    sourceUrl: "https://oreilly.com",
    difficulty: "Advanced",
    estimatedTime: "60 hours",
    aiScore: 100,
    aiPreview: "Martin Kleppmann's masterpiece on distributed databases, replication, partitioning, and consistency models.",
    isBookmarked: true,
    tags: ["System Design", "Book", "Databases"]
  },
  {
    id: "r20",
    title: "Tree Traversals Cheatsheet",
    description: "Inorder, Preorder, Postorder tricks.",
    type: "Cheatsheet",
    sourceName: "AlgoMonster",
    sourceUrl: "https://algo.monster",
    difficulty: "Beginner",
    estimatedTime: "10 min",
    aiScore: 92,
    aiPreview: "Quick reference for recursive and iterative tree traversals, essential for binary tree interview questions.",
    isBookmarked: false,
    tags: ["Trees", "DSA", "Cheatsheet"]
  },
  {
    id: "r21",
    title: "Google Engineering Blog",
    description: "Innovations from Google engineers.",
    type: "Article",
    sourceName: "Google Blog",
    sourceUrl: "https://developers.googleblog.com/",
    difficulty: "Advanced",
    estimatedTime: "20 min",
    aiScore: 94,
    aiPreview: "Insights into Google's infrastructure, including Spanner, Bigtable, and how they optimize search latency.",
    isBookmarked: false,
    tags: ["System Design", "Google"]
  },
  {
    id: "r22",
    title: "Blind 75 LeetCode Questions",
    description: "The essential 75 questions.",
    type: "Practice",
    sourceName: "LeetCode",
    sourceUrl: "https://leetcode.com",
    difficulty: "Intermediate",
    estimatedTime: "25 hours",
    aiScore: 98,
    aiPreview: "The original curated list of 75 questions that cover 90% of DSA concepts tested in phone screens.",
    isBookmarked: true,
    tags: ["Practice", "DSA"]
  },
  {
    id: "r23",
    title: "Hussein Nasser - Backend Engineering",
    description: "Deep dive into backend protocols.",
    type: "Video",
    sourceName: "YouTube",
    sourceUrl: "https://youtube.com",
    difficulty: "Intermediate",
    estimatedTime: "5 hours",
    aiScore: 96,
    aiPreview: "Excellent breakdowns of HTTP/2 vs HTTP/3, WebSockets, gRPC, and database indexing strategies.",
    isBookmarked: false,
    tags: ["Backend", "Networking"]
  },
  {
    id: "r24",
    title: "System Design Interview - Alex Xu",
    description: "An insider's guide to system design.",
    type: "Book",
    sourceName: "Amazon",
    sourceUrl: "https://amazon.com",
    difficulty: "Intermediate",
    estimatedTime: "30 hours",
    aiScore: 99,
    aiPreview: "Provides templates and step-by-step guides for designing Rate Limiters, URL Shorteners, and Chat Applications.",
    isBookmarked: true,
    tags: ["System Design", "Book"]
  },
  {
    id: "r25",
    title: "Trie Data Structure Masterclass",
    description: "Implement autocomplete systems.",
    type: "Video",
    sourceName: "FreeCodeCamp",
    sourceUrl: "https://freecodecamp.org",
    difficulty: "Intermediate",
    estimatedTime: "1 hour",
    aiScore: 93,
    aiPreview: "Step-by-step implementation of Tries, showing how to efficiently store strings and build prefix search systems.",
    isBookmarked: false,
    tags: ["Trie", "DSA"]
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec1",
    title: "System Design Fundamentals",
    reason: "Based on your recent graph practice.",
    type: "Next",
    actionText: "Start Learning"
  },
  {
    id: "rec2",
    title: "Dynamic Programming",
    reason: "Weak Area Detected",
    type: "Weakness",
    confidenceScore: 78,
    actionText: "Review curated DP roadmap"
  },
  {
    id: "rec3",
    title: "Behavioral Preparation",
    reason: "Upcoming Interview Focus",
    type: "Interview",
    companyMatch: "Google",
    actionText: "Practice Leadership Principles"
  }
];

export const mockDSANotes: DSANote[] = [
  {
    id: "n1",
    topic: "Data Structures & Algorithms (Complete Notes)",
    author: "Striver",
    sourceUrl: "https://takeuforward.org",
    difficulty: "Advanced",
    lastUpdated: "2 weeks ago",
    tags: ["Recommended", "Complete"]
  },
  {
    id: "n2",
    topic: "DSA Notes by Abdul Bari",
    author: "Abdul Bari",
    sourceUrl: "https://abdulbari.com",
    difficulty: "Beginner",
    lastUpdated: "1 month ago",
    tags: ["Beginner Friendly"]
  },
  {
    id: "n3",
    topic: "Data Structures & Algo in Java",
    author: "GeeksforGeeks",
    sourceUrl: "https://geeksforgeeks.org",
    difficulty: "Intermediate",
    lastUpdated: "3 days ago",
    tags: ["Java", "Comprehensive"]
  },
  {
    id: "n4",
    topic: "DSA Roadmap & Notes",
    author: "CodeHelp",
    sourceUrl: "https://codehelp.in",
    difficulty: "Intermediate",
    lastUpdated: "1 week ago",
    tags: ["Roadmap", "C++"]
  },
  {
    id: "n5",
    topic: "Competitive Programming Notes",
    author: "NeetCode",
    sourceUrl: "https://neetcode.io",
    difficulty: "Advanced",
    lastUpdated: "5 days ago",
    tags: ["CP", "Python"]
  }
];

export const mockInsights: Insight[] = [
  {
    id: "ins1",
    message: "You learn graphs 35% faster than DP.",
    type: "learning"
  },
  {
    id: "ins2",
    message: "System Design completion increased 12% this week.",
    type: "learning"
  },
  {
    id: "ins3",
    message: "Recommended focus: Communication + LLD.",
    type: "suggestion"
  },
  {
    id: "ins4",
    message: "Complete Graph Roadmap",
    type: "suggestion"
  },
  {
    id: "ins5",
    message: "Review DP Notes",
    type: "suggestion"
  },
  {
    id: "ins6",
    message: "Attempt Mock Interview",
    type: "suggestion"
  }
];
