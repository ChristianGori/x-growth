export interface TweetData {
  id: string;
  userId: string; // Linked to Firebase Auth UID
  text: string;
  imageUrl?: string; // Optional
  views: number;
  likes: number;
  comments: number;
  postedAt: string; // ISO Date string
  timestamp: number;
}

export interface AnalysisResult {
  bestTimeSlots: string[];
  nicheAnalysis: string;
  engagementScore: number;
}

export interface CalendarEntry {
  day: string;
  time: string;
  topic: string;
  hook: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  STRATEGY = 'strategy',
  TIPS = 'tips',
}

export interface TipCard {
  title: string;
  category: 'Engagement' | 'Algorithm' | 'Growth' | 'Content';
  content: string;
  actionable: string;
}