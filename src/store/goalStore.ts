import { create } from 'zustand';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  tasks?: any[];
}

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  setGoals: (goals: Goal[]) => void;
  setCurrentGoal: (goal: Goal | null) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  currentGoal: null,
  isLoading: false,
  setGoals: (goals) => set({ goals }),
  setCurrentGoal: (goal) => set({ currentGoal: goal }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    })),
  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
