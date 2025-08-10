import { create } from 'zustand';
import { StreakData, StreakService, QuizResultForStreak } from '../service/StreakService';

interface StreakState {
  streaks: StreakData;
  isLoaded: boolean;
  loadStreaks: () => Promise<void>;
  updateStreaks: (result: QuizResultForStreak) => Promise<void>;
  resetStreaks: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  streaks: { ALL: 0 },
  isLoaded: false,

  /**
   * AsyncStorage에서 연속 정답 기록을 로드하여 상태에 반영합니다.
   */
  loadStreaks: async () => {
    const streaks = await StreakService.getStreaks();
    set({ streaks, isLoaded: true });
  },

  /**
   * 퀴즈 결과를 바탕으로 연속 정답 기록을 업데이트하고 상태를 갱신합니다.
   */
  updateStreaks: async (result: QuizResultForStreak) => {
    const updatedStreaks = await StreakService.updateStreaks(result);
    set({ streaks: updatedStreaks });
  },

  /**
   * 모든 연속 정답 기록과 상태를 초기화합니다.
   */
  resetStreaks: async () => {
    await StreakService.resetAllStreaks();
    set({ streaks: { ALL: 0 } });
  },
}));

// 앱 시작 시 한 번만 호출하여 기록을 로드합니다.
useStreakStore.getState().loadStreaks();
