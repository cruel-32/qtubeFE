react-query 도메인별 캐싱 전략
- staleTime 3분
- gcTime 5분

- Ranking
 - Ranking 데이터는 다음 업데이트까지 남은 시간동안 캐싱 유지
 - refetchOnWindowFocus: false
 - refetchOnMount: false
 - refetchOnReconnect: false

- Quiz
 - 퀴즈 페이지에서 퀴즈 풀이 완료시 시 즉시 Optimistic Updates 적용
 - staleTime 5분
 - gcTime 10분
 - refetchOnWindowFocus: true
 - refetchOnMount: true
 - refetchOnReconnect: true

- User
 - 프로필을 변경하면 즉시 Optimistic Updates
 - staleTime Infinity
 - gcTime Infinity
 - refetchOnWindowFocus: false
 - refetchOnMount: false
 - refetchOnReconnect: false

- Category
 - staleTime: Infinity
 - gcTime: Infinity
 - refetchOnWindowFocus: false
 - refetchOnMount: false
 - refetchOnReconnect: false

