import { create } from 'zustand';
import {
  MyRankingResponse,
  RankingItem,
  RankingQueryParams,
  RankingType
} from '../interfaces/Ranking';
import { RankingService } from '../service/RankingService';

interface RankingState {
  // 전체 랭킹 데이터
  dailyRankings: RankingItem[];
  weeklyRankings: RankingItem[];
  monthlyRankings: RankingItem[];
  
  // 나의 랭킹 데이터
  myDailyRanking?: MyRankingResponse;
  myWeeklyRanking?: MyRankingResponse;
  myMonthlyRanking?: MyRankingResponse;
  
  // 로딩 상태
  loading: boolean;
  myRankingLoading: boolean;
  
  // 에러 상태
  error?: string;
  myRankingError?: string;
  
  // State setters
  setDailyRankings: (rankings: RankingItem[]) => void;
  setWeeklyRankings: (rankings: RankingItem[]) => void;
  setMonthlyRankings: (rankings: RankingItem[]) => void;
  setMyDailyRanking: (ranking?: MyRankingResponse) => void;
  setMyWeeklyRanking: (ranking?: MyRankingResponse) => void;
  setMyMonthlyRanking: (ranking?: MyRankingResponse) => void;
  setLoading: (loading: boolean) => void;
  setMyRankingLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setMyRankingError: (error?: string) => void;
  
  // Actions (API calls)
  getRankingByType: (type: RankingType, params: RankingQueryParams) => Promise<void>;
  getMyRankingByType: (type: RankingType, params: RankingQueryParams) => Promise<void>;
  
  // Utility methods
  getRankingsByType: (type: RankingType) => RankingItem[];
  getMyRankingByTypeSync: (type: RankingType) => MyRankingResponse | undefined;
  clearError: () => void;
  clearMyRankingError: () => void;
}

export const useRankingStore = create<RankingState>((set, get) => ({
  // Initial state
  dailyRankings: [],
  weeklyRankings: [],
  monthlyRankings: [],
  myDailyRanking: undefined,
  myWeeklyRanking: undefined,
  myMonthlyRanking: undefined,
  loading: false,
  myRankingLoading: false,
  error: undefined,
  myRankingError: undefined,
  
  // State setters
  setDailyRankings: (rankings) => set({ dailyRankings: rankings }),
  setWeeklyRankings: (rankings) => set({ weeklyRankings: rankings }),
  setMonthlyRankings: (rankings) => set({ monthlyRankings: rankings }),
  setMyDailyRanking: (ranking) => set({ myDailyRanking: ranking }),
  setMyWeeklyRanking: (ranking) => set({ myWeeklyRanking: ranking }),
  setMyMonthlyRanking: (ranking) => set({ myMonthlyRanking: ranking }),
  setLoading: (loading) => set({ loading }),
  setMyRankingLoading: (loading) => set({ myRankingLoading: loading }),
  setError: (error) => set({ error, loading: false }),
  setMyRankingError: (error) => set({ myRankingError: error, myRankingLoading: false }),
  
  // Generic actions by type
  getRankingByType: async (type: RankingType, params: RankingQueryParams) => {
    try {
      set({ loading: true, error: undefined });
      const rankings = await RankingService.getRankingByType(type, params);
      
      switch (type) {
        case RankingType.DAILY:
          set({ dailyRankings: rankings, loading: false });
          break;
        case RankingType.WEEKLY:
          set({ weeklyRankings: rankings, loading: false });
          break;
        case RankingType.MONTHLY:
          set({ monthlyRankings: rankings, loading: false });
          break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${type} ranking`;
      set({ error: errorMessage, loading: false });
    }
  },

  getMyRankingByType: async (type: RankingType, params: RankingQueryParams) => {
    try {
      set({ myRankingLoading: true, myRankingError: undefined });
      const ranking = await RankingService.getMyRankingByType(type, params);
      
      switch (type) {
        case RankingType.DAILY:
          set({ myDailyRanking: ranking, myRankingLoading: false });
          break;
        case RankingType.WEEKLY:
          set({ myWeeklyRanking: ranking, myRankingLoading: false });
          break;
        case RankingType.MONTHLY:
          set({ myMonthlyRanking: ranking, myRankingLoading: false });
          break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch my ${type} ranking`;
      set({ myRankingError: errorMessage, myRankingLoading: false });
    }
  },

  // Utility methods
  getRankingsByType: (type: RankingType) => {
    const state = get();
    switch (type) {
      case RankingType.DAILY:
        return state.dailyRankings;
      case RankingType.WEEKLY:
        return state.weeklyRankings;
      case RankingType.MONTHLY:
        return state.monthlyRankings;
      default:
        return [];
    }
  },

  getMyRankingByTypeSync: (type: RankingType) => {
    const state = get();
    switch (type) {
      case RankingType.DAILY:
        return state.myDailyRanking;
      case RankingType.WEEKLY:
        return state.myWeeklyRanking;
      case RankingType.MONTHLY:
        return state.myMonthlyRanking;
      default:
        return undefined;
    }
  },

  // Error clearing
  clearError: () => set({ error: undefined }),
  clearMyRankingError: () => set({ myRankingError: undefined }),
})); 