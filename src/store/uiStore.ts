import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  showGoalWizard: boolean;
  showProgressModal: boolean;
  selectedDay: number | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openGoalWizard: () => void;
  closeGoalWizard: () => void;
  openModal: (type: string) => void;
  openProgressModal: (day: number) => void;
  closeProgressModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  showGoalWizard: false,
  showProgressModal: false,
  selectedDay: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },
  
  openGoalWizard: () => set({ showGoalWizard: true }),
  closeGoalWizard: () => set({ showGoalWizard: false }),
  
  openModal: (type) => {
    if (type === 'goal') set({ showGoalWizard: true });
  },
  
  openProgressModal: (day) => set({ showProgressModal: true, selectedDay: day }),
  closeProgressModal: () => set({ showProgressModal: false, selectedDay: null }),
}));
