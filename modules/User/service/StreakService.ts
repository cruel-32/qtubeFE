import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_STORAGE_KEY = 'consecutive_streaks';

export interface StreakData {
  ALL: number; // 전체 연속 정답
  [key: string]: number; // 카테고리별 연속 정답 (e.g., 'main_1', 'sub_15')
}

export interface QuizResultForStreak {
  isCorrect: boolean;
  mainCategoryId: number;
  subCategoryId: number;
}

export class StreakService {
  /**
   * AsyncStorage에서 연속 정답 기록을 가져옵니다.
   */
  static async getStreaks(): Promise<StreakData> {
    try {
      const storedStreaks = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (storedStreaks) {
        return JSON.parse(storedStreaks);
      }
    } catch (error) {
      console.error("Failed to load streaks from storage:", error);
    }
    // 데이터가 없거나 오류 발생 시 초기값 반환
    return { ALL: 0 };
  }

  /**
   * 퀴즈 결과를 바탕으로 연속 정답 기록을 업데이트합니다.
   * @param result - 퀴즈 채점 결과
   */
  static async updateStreaks(result: QuizResultForStreak): Promise<StreakData> {
    const currentStreaks = await this.getStreaks();
    const { isCorrect, mainCategoryId, subCategoryId } = result;

    const mainKey = `main_${mainCategoryId}`;
    const subKey = `sub_${subCategoryId}`;

    if (isCorrect) {
      // 정답일 경우: 모든 관련 카운터 1 증가
      currentStreaks.ALL = (currentStreaks.ALL || 0) + 1;
      currentStreaks[mainKey] = (currentStreaks[mainKey] || 0) + 1;
      currentStreaks[subKey] = (currentStreaks[subKey] || 0) + 1;
    } else {
      // 오답일 경우: 모든 관련 카운터 0으로 리셋
      currentStreaks.ALL = 0;
      currentStreaks[mainKey] = 0;
      currentStreaks[subKey] = 0;
    }

    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(currentStreaks));
    } catch (error) {
      console.error("Failed to save streaks to storage:", error);
    }

    return currentStreaks;
  }

  /**
   * 모든 연속 정답 기록을 초기화합니다.
   */
  static async resetAllStreaks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset streaks:", error);
    }
  }
}
