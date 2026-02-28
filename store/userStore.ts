import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserStats {
  totalSolved: number;
  totalAttempted: number;
  currentStreak: number;
  longestStreak: number;
  averageExecutionTime: number;
  accuracy: number;
}

interface UserState {
  stats: UserStats | null;
  hasApiKey: boolean;
  isLoading: boolean;
  setStats: (stats: UserStats) => void;
  setHasApiKey: (val: boolean) => void;
  updateStats: (partial: Partial<UserStats>) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        stats: null,
        hasApiKey: false,
        isLoading: false,
        setStats: (stats) => set({ stats }),
        setHasApiKey: (val) => set({ hasApiKey: val }),
        updateStats: (partial) =>
          set((state) => ({
            stats: state.stats ? { ...state.stats, ...partial } : null,
          })),
        reset: () => set({ stats: null, hasApiKey: false }),
      }),
      { name: "codecarft-user" }
    ),
    { name: "UserStore" }
  )
);
