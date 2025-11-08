export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'credentials' | 'google' | 'github';
  createdAt: string;
}

export interface DayPlan {
  day: number;
  task: string;
  focus: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  isRestDay?: boolean;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  duration: number;
  hoursPerDay: number;
  plan: DayPlan[];
  status: 'active' | 'completed' | 'abandoned';
  startDate: string;
  completedDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  _id: string;
  goalId: string;
  userId: string;
  day: number;
  completed: boolean;
  comment?: string;
  sentimentScore?: number;
  hoursSpent?: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  averageSentiment: number;
  totalHoursSpent: number;
}

export interface MoodTrend {
  day: number;
  score: number;
}

export interface Insight {
  _id: string;
  goalId: string;
  userId: string;
  weekNumber: number;
  summary: string;
  moodTrend: MoodTrend[];
  motivationLevel: number;
  blockers: string[];
  recommendations: string[];
  highlights: string[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  status?: string;
  errors?: any[];
}
