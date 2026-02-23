
export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: number; // 1-10
  tags: string[];
}

export interface FeedPage {
  id: string;
  title: string;
  description: string;
  articles: NewsArticle[];
  lastUpdated: string;
  aiInsights: string;
}

export enum StaticCategory {
  TOP_STORIES = 'Global Pulse',
  POLITICS = 'Governance',
  TECH = 'Infrastructure',
  FINANCE = 'Markets',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
}
