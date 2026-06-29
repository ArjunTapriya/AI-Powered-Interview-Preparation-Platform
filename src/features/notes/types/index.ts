export type ResourceType = 'Article' | 'Video' | 'Course' | 'Cheatsheet' | 'Practice' | 'Note' | 'Book' | 'Repository' | 'Roadmap';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  sourceName: string;
  sourceUrl: string;
  difficulty: Difficulty;
  estimatedTime: string; // e.g. "15 min"
  aiScore: number; // e.g. 95
  aiPreview: string;
  isBookmarked: boolean;
  tags: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  type: "Next" | "Weakness" | "Interview";
  confidenceScore?: number;
  companyMatch?: string;
  actionText?: string;
}

export interface DSANote {
  id: string;
  topic: string;
  author: string;
  sourceUrl: string;
  difficulty: Difficulty;
  lastUpdated: string;
  tags: string[];
}

export interface Insight {
  id: string;
  message: string;
  type: 'learning' | 'suggestion';
}
