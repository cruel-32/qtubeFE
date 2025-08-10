import { useQuery } from '@tanstack/react-query';
import { addDays, getISOWeek, getISOWeekYear, getMonth, getYear, set } from 'date-fns';
import { RankingQueryParams, RankingType } from '../interfaces/Ranking';
import { RankingService } from '../service/RankingService';

/**
 * 랭킹 데이터의 캐시 시간을 결정하는 함수
 * - DAILY, 지난 주, 지난 달 데이터는 절대 변하지 않으므로 Infinity로 설정
 * - 이번 주, 이번 달 데이터는 다음 날 오전 2시에 만료되도록 설정
 */
const getStaleTimeForRanking = (type: RankingType, params: RankingQueryParams) => {
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonth = getMonth(now) + 1;
  const currentWeek = getISOWeek(now);
  const currentWeekYear = getISOWeekYear(now);

  let isCurrent = false;
  if (type === RankingType.WEEKLY) {
    isCurrent = params.wYear === currentWeekYear && params.week === currentWeek;
  } else if (type === RankingType.MONTHLY) {
    isCurrent = params.mYear === currentYear && params.month === currentMonth;
  }

  // 일간 데이터 또는 과거의 주간/월간 데이터는 변하지 않음
  if (type === RankingType.DAILY || !isCurrent) {
    return Infinity;
  }

  // 현재 주/월 데이터는 다음 날 오전 2시에 만료
  const tomorrow = addDays(now, 1);
  const nextTwoAM = set(tomorrow, { hours: 2, minutes: 0, seconds: 0, milliseconds: 0 });
  
  return nextTwoAM.getTime() - now.getTime();
};

/**
 * 특정 타입의 전체 랭킹을 조회하는 useQuery 훅
 * @param type 랭킹 타입 (daily, weekly, monthly)
 * @param params 쿼리 파라미터
 * @param enabled 쿼리 활성화 여부
 */
export const useGetRanking = (type: RankingType, params: RankingQueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['rankings', type, params],
    queryFn: () => RankingService.getRankingByType(type, params),
    staleTime: getStaleTimeForRanking(type, params),
    enabled,
  });
};

/**
 * 특정 타입의 나의 랭킹을 조회하는 useQuery 훅
 * @param type 랭킹 타입 (daily, weekly, monthly)
 * @param params 쿼리 파라미터
 * @param enabled 쿼리 활성화 여부
 */
export const useGetMyRanking = (type: RankingType, params: RankingQueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['myRanking', type, params],
    queryFn: () => RankingService.getMyRankingByType(type, params),
    staleTime: getStaleTimeForRanking(type, params),
    enabled,
  });
};
