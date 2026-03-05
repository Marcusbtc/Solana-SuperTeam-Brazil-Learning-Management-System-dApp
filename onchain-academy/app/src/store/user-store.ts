import { create } from "zustand";
import { learningProgressService } from "@/services/learning-progress-service";
import type { StreakData, StreakDay } from "@/types/domain";

interface UserState {
  walletAddress: string | null;
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  streakCalendar: StreakDay[];
  isLoading: boolean;
  setWalletAddress: (address: string | null) => void;
  fetchUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  walletAddress: null,
  xp: 0,
  level: 1,
  streakDays: 0,
  longestStreakDays: 0,
  streakCalendar: [],
  isLoading: false,

  setWalletAddress: (address) => {
    set({ walletAddress: address });
    if (address) {
      get().fetchUserData();
    } else {
      set({
        xp: 0,
        level: 1,
        streakDays: 0,
        longestStreakDays: 0,
        streakCalendar: [],
      });
    }
  },

  fetchUserData: async () => {
    const { walletAddress } = get();
    if (!walletAddress) return;

    set({ isLoading: true });
    try {
      const xpData = await learningProgressService.getXpBalance(walletAddress);

      let streakData: StreakData = {
        currentDays: 0,
        longestDays: 0,
        freezesLeft: 0,
        calendar: [],
      };

      // Backend streak endpoint currently expects a backend user id, not wallet.
      // Keep XP on-chain fetch active and degrade streak gracefully when unavailable.
      try {
        streakData = await learningProgressService.getStreak(walletAddress);
      } catch {
        streakData = {
          currentDays: 0,
          longestDays: 0,
          freezesLeft: 0,
          calendar: [],
        };
      }

      set({
        xp: xpData.xp,
        level: xpData.level,
        streakDays: streakData.currentDays,
        longestStreakDays: streakData.longestDays,
        streakCalendar: streakData.calendar,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      set({ isLoading: false });
    }
  },
}));
