import {
  MyRankingResponse,
  RankingItem,
  RankingQueryParams,
  RankingType
} from '@/modules/Ranking/interfaces/Ranking';
import { request } from '@/utils/apiClient';

export class RankingService {
  /**
   * 일간 랭킹 조회 (전날 기준)
   */
  static async getDailyRanking(date?: string): Promise<RankingItem[]> {
    try {
      return await request<RankingItem[]>('/ranking/daily', { params: { date } });
    } catch (error) {
      console.error('Failed to get daily ranking:', error);
      throw new Error('일간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 주간 랭킹 조회 (지난 주 완료된 기간 기준)
   */
  static async getWeeklyRanking(wYear?: number, week?: number): Promise<RankingItem[]> {
    try {
      return await request<RankingItem[]>('/ranking/weekly', { params: { wYear, week } });
    } catch (error) {
      console.error('Failed to get weekly ranking:', error);
      throw new Error('주간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 월간 랭킹 조회 (지난 달 완료된 기간 기준)
   */
  static async getMonthlyRanking(mYear?: number, month?: number): Promise<RankingItem[]> {
    try {
      return await request<RankingItem[]>('/ranking/monthly', { params: { mYear, month } });
    } catch (error) {
      console.error('Failed to get monthly ranking:', error);
      throw new Error('월간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 나의 일간 랭킹 조회 (인증 필요)
   */
  static async getMyDailyRanking(date?: string): Promise<MyRankingResponse> {
    try {
      return await request<MyRankingResponse>('/ranking/me/daily', { params: { date } });
    } catch (error) {
      console.error('Failed to get my daily ranking:', error);
      throw new Error('나의 일간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 나의 주간 랭킹 조회 (인증 필요)
   */
  static async getMyWeeklyRanking(wYear?: number, week?: number): Promise<MyRankingResponse> {
    try {
      return await request<MyRankingResponse>('/ranking/me/weekly', { params: { wYear, week } });
    } catch (error) {
      console.error('Failed to get my weekly ranking:', error);
      throw new Error('나의 주간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 나의 월간 랭킹 조회 (인증 필요)
   */
  static async getMyMonthlyRanking(mYear?: number, month?: number): Promise<MyRankingResponse> {
    try {
      return await request<MyRankingResponse>('/ranking/me/monthly', { params: { mYear, month } });
    } catch (error) {
      console.error('Failed to get my monthly ranking:', error);
      throw new Error('나의 월간 랭킹을 가져오는데 실패했습니다.');
    }
  }

  /**
   * 특정 타입의 전체 랭킹 조회
   */
  static async getRankingByType(type: RankingType, params: RankingQueryParams): Promise<RankingItem[]> {
    const newParams = { ...params };
    switch (type) {
      case RankingType.DAILY:
        if (!newParams.date) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          newParams.date = yesterday.toISOString().split('T')[0];
        }
        return this.getDailyRanking(newParams.date);
      case RankingType.WEEKLY:
        if (newParams.wYear === undefined || newParams.week === undefined) {
          const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const d = new Date(Date.UTC(lastWeekDate.getFullYear(), lastWeekDate.getMonth(), lastWeekDate.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
          newParams.wYear = newParams.wYear ?? d.getUTCFullYear();
          newParams.week = newParams.week ?? weekNo;
        }
        return this.getWeeklyRanking(newParams.wYear, newParams.week);
      case RankingType.MONTHLY:
        if (newParams.mYear === undefined || newParams.month === undefined) {
          const lastMonthDate = new Date();
          lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
          newParams.mYear = newParams.mYear ?? lastMonthDate.getFullYear();
          newParams.month = newParams.month ?? lastMonthDate.getMonth() + 1;
        }
        return this.getMonthlyRanking(newParams.mYear, newParams.month);
      default:
        throw new Error('지원하지 않는 랭킹 타입입니다.');
    }
  }

  /**
   * 특정 타입의 나의 랭킹 조회
   */
  static async getMyRankingByType(type: RankingType, params: RankingQueryParams): Promise<MyRankingResponse> {
    const newParams = { ...params };
    switch (type) {
      case RankingType.DAILY:
        if (!newParams.date) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          newParams.date = yesterday.toISOString().split('T')[0];
        }
        return this.getMyDailyRanking(newParams.date);
      case RankingType.WEEKLY:
        if (newParams.wYear === undefined || newParams.week === undefined) {
          const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const d = new Date(Date.UTC(lastWeekDate.getFullYear(), lastWeekDate.getMonth(), lastWeekDate.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
          newParams.wYear = newParams.wYear ?? d.getUTCFullYear();
          newParams.week = newParams.week ?? weekNo;
        }
        return this.getMyWeeklyRanking(newParams.wYear, newParams.week);
      case RankingType.MONTHLY:
        if (newParams.mYear === undefined || newParams.month === undefined) {
          const lastMonthDate = new Date();
          lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
          newParams.mYear = newParams.mYear ?? lastMonthDate.getFullYear();
          newParams.month = newParams.month ?? lastMonthDate.getMonth() + 1;
        }
        return this.getMyMonthlyRanking(newParams.mYear, newParams.month);
      default:
        throw new Error('지원하지 않는 랭킹 타입입니다.');
    }
  }
} 