import { create } from 'zustand';
import { Goal, Progress, ProgressStats, Insight } from '@/types';
import api from '@/lib/api';

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  progress: Progress[];
  stats: ProgressStats | null;
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  
  // Goal actions
  fetchGoals: (status?: string) => Promise<void>;
  fetchGoal: (id: string) => Promise<void>;
  createGoal: (data: any) => Promise<Goal>;
  updateGoal: (id: string, data: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  regeneratePlan: (id: string, feedback?: string) => Promise<void>;
  
  // Progress actions
  fetchProgress: (goalId: string) => Promise<void>;
  fetchStats: (goalId: string) => Promise<void>;
  updateProgress: (data: any) => Promise<void>;
  
  // Insight actions
  fetchInsights: (goalId: string) => Promise<void>;
  generateInsights: (goalId: string) => Promise<void>;
  
  clearError: () => void;
  setCurrentGoal: (goal: Goal | null) => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  currentGoal: null,
  progress: [],
  stats: null,
  insights: [],
  isLoading: false,
  error: null,

  fetchGoals: async (status?: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getGoals(status);
      set({ goals: data.goals, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch goals',
        isLoading: false,
      });
    }
  },

  fetchGoal: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getGoal(id);
      set({ currentGoal: data.goal, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch goal',
        isLoading: false,
      });
    }
  },

  createGoal: async (data: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.createGoal(data);
      set((state) => ({
        goals: [response.goal, ...state.goals],
        currentGoal: response.goal,
        isLoading: false,
      }));
      return response.goal;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create goal',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGoal: async (id: string, data: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.updateGoal(id, data);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === id ? response.goal : g)),
        currentGoal: state.currentGoal?._id === id ? response.goal : state.currentGoal,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update goal',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((g) => g._id !== id),
        currentGoal: state.currentGoal?._id === id ? null : state.currentGoal,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete goal',
        isLoading: false,
      });
      throw error;
    }
  },

  regeneratePlan: async (id: string, feedback?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.regenerateGoalPlan(id, feedback);
      set((state) => ({
        goals: state.goals.map((g) => (g._id === id ? response.goal : g)),
        currentGoal: state.currentGoal?._id === id ? response.goal : state.currentGoal,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to regenerate plan',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProgress: async (goalId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getProgressByGoal(goalId);
      set({ progress: data.progress, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch progress',
        isLoading: false,
      });
    }
  },

  fetchStats: async (goalId: string) => {
    try {
      const data = await api.getProgressStats(goalId);
      set({ stats: data.stats });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch stats' });
    }
  },

  updateProgress: async (data: any) => {
    try {
      const response = await api.createProgress(data);
      set((state) => {
        const existing = state.progress.find(
          (p) => p.goalId === data.goalId && p.day === data.day
        );
        if (existing) {
          return {
            progress: state.progress.map((p) =>
              p.goalId === data.goalId && p.day === data.day ? response.progress : p
            ),
          };
        }
        return { progress: [...state.progress, response.progress] };
      });
      
      // Refresh stats
      await get().fetchStats(data.goalId);
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update progress' });
      throw error;
    }
  },

  fetchInsights: async (goalId: string) => {
    try {
      const data = await api.getInsightsByGoal(goalId);
      set({ insights: data.insights });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch insights' });
    }
  },

  generateInsights: async (goalId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.generateInsights(goalId);
      set((state) => ({
        insights: [data.insight, ...state.insights],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to generate insights',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setCurrentGoal: (goal: Goal | null) => set({ currentGoal: goal }),
}));
