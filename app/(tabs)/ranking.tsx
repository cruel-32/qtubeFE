import {
  AnimeIcon,
  EconomyIcon,
  EntertainmentIcon,
  GameIcon,
  HistoryIcon,
  LanguageIcon,
  MovieIcon,
  ScienceIcon,
  SocietyIcon,
  SportsIcon,
} from '@/components/icons/categories';
import { Header } from '@/components/ui/Header';
import { MyRankingResponse, RankingItem, RankingType } from '@/modules/Ranking';
import { useGetMyRanking, useGetRanking } from '@/modules/Ranking/store/useRankingQuery';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { endOfMonth, endOfWeek, format, getISOWeek, getISOWeekYear, isSameMonth, startOfMonth, startOfWeek, subDays } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

Dimensions.get('window');

// UI에서 사용할 확장된 랭킹 아이템 인터페이스
interface ExtendedRankingItem extends RankingItem {
  isCurrentUser?: boolean;
  title?: string; // 기본 타이틀 제공
}

// 사용자의 장착한 배지에서 가장 높은 등급의 배지 이름을 가져오는 함수
const getUserTitle = (user: RankingItem['user']): string => {
  if (!user.userBadges || !user.equippedBadgeIds || user.equippedBadgeIds.length === 0) {
    return '퀴즈 도전자';
  }

  // 장착된 배지들 중에서 가장 높은 등급의 배지 찾기
  const equippedBadges = user.userBadges.filter(userBadge => 
    user.equippedBadgeIds!.includes(userBadge.badge.id)
  );

  if (equippedBadges.length === 0) {
    return '퀴즈 도전자';
  }

  // 배지 등급 순서 정의 (높은 등급부터)
  const gradeOrder = ['GRANDMASTER', 'MASTER', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
  
  // 가장 높은 등급의 배지 찾기
  const highestBadge = equippedBadges.reduce((highest, current) => {
    const currentGradeIndex = gradeOrder.indexOf(current.badge.grade);
    const highestGradeIndex = gradeOrder.indexOf(highest.badge.grade);
    
    if (currentGradeIndex < highestGradeIndex || highestGradeIndex === -1) {
      return current;
    }
    return highest;
  });

  return highestBadge.badge.name;
};

type PeriodType = 'daily' | 'weekly' | 'monthly';

// 카테고리별 아이콘 매핑
const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: { component: React.ComponentType<any>, color: string } } = {
    '과학': { component: ScienceIcon, color: '#3B82F6' },
    '역사': { component: HistoryIcon, color: '#F59E0B' },
    '사회': { component: SocietyIcon, color: '#10B981' },
    '경제': { component: EconomyIcon, color: '#8B5CF6' },
    '연예': { component: EntertainmentIcon, color: '#EC4899' },
    '게임': { component: GameIcon, color: '#6366F1' },
    '영화': { component: MovieIcon, color: '#EF4444' },
    '애니': { component: AnimeIcon, color: '#06B6D4' },
    '스포츠': { component: SportsIcon, color: '#F97316' },
    '영어': { component: LanguageIcon, color: '#14B8A6' },
  };
  
  return iconMap[categoryName] || { component: ScienceIcon, color: '#6B7280' };
};

export default function RankingScreen() {
  const { colors } = useTheme();
  const TODAY = new Date();
  const YESTERDAY = subDays(TODAY, 1);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');
  const [currentDate, setCurrentDate] = useState(YESTERDAY);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  
  const backgroundOpacity = useState(new Animated.Value(0))[0];
  const modalTranslateY = useState(new Animated.Value(300))[0];

  const rankingType = selectedPeriod as RankingType;

  const params = useMemo(() => {
    let date: string | undefined;
    let wYear: number | undefined;
    let week: number | undefined;
    let mYear: number | undefined;
    let month: number | undefined;

    if (rankingType === RankingType.DAILY) {
      date = format(currentDate, 'yyyy-MM-dd');
    } else if (rankingType === RankingType.WEEKLY) {
      wYear = getISOWeekYear(currentDate);
      week = getISOWeek(currentDate);
    } else if (rankingType === RankingType.MONTHLY) {
      mYear = currentDate.getFullYear();
      month = currentDate.getMonth() + 1;
    }
    return { date, wYear, week, mYear, month };
  }, [selectedPeriod, currentDate]);

  const { 
    data: rankingsData, 
    isLoading: rankingsLoading, 
    error: rankingsError, 
    refetch: refetchRankings 
  } = useGetRanking(rankingType, params);
  
  const { 
    data: myRankingData, 
    isLoading: myRankingLoading, 
    error: myRankingError, 
    refetch: refetchMyRanking 
  } = useGetMyRanking(rankingType, params);

  const isLoading = rankingsLoading || myRankingLoading;
  const queryError = rankingsError || myRankingError;

  // API 데이터를 UI 형식으로 변환
  const transformRankingData = (rankings: RankingItem[], myRanking: MyRankingResponse | undefined): ExtendedRankingItem[] => {
    const transformed = rankings.map((item): ExtendedRankingItem => ({
      ...item,
      title: getUserTitle(item.user), // 사용자의 실제 칭호
      isCurrentUser: false,
    }));

    if (myRanking && myRanking.rank && myRanking.user && !transformed.find(item => item.user.id === myRanking.user.id)) {
      transformed.push({
        ...myRanking,
        title: getUserTitle(myRanking.user),
        isCurrentUser: true,
      });
    } else if (myRanking && myRanking.user) {
      const index = transformed.findIndex(item => item.user.id === myRanking.user.id);
      if (index >= 0 && transformed[index]) {
        transformed[index].isCurrentUser = true;
        transformed[index].title = getUserTitle(myRanking.user);
      }
    }

    return transformed.sort((a, b) => (a.rank || 0) - (b.rank || 0));
  };

  const currentData = transformRankingData(rankingsData || [], myRankingData);
  const topThree = currentData.slice(0, 3);
  const currentUser = currentData.find(user => user.isCurrentUser);
  const otherUsers = currentData.slice(3, Math.min(displayCount, currentData.length));

  

  const formatDateRange = () => {
    if (selectedPeriod === 'daily') {
      return currentDate.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } else if (selectedPeriod === 'weekly') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

      return `${weekStart.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })} - ${weekEnd.toLocaleDateString('ko-KR', { 
        month: '2-digit', 
        day: '2-digit' 
      })}`;
    } else { // monthly
      const monthStart = startOfMonth(currentDate);
      // 어제가 현재달이면 마지막날이 아니라 어제 날짜를 반환
      const monthEnd = isSameMonth(currentDate, TODAY) ? YESTERDAY : endOfMonth(currentDate);

      return `${monthStart.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })} - ${monthEnd.toLocaleDateString('ko-KR', { 
        month: '2-digit', 
        day: '2-digit' 
      })}`;
    }
  };

  const getTopThreeTitle = () => {
    switch (selectedPeriod) {
      case 'daily': return '일간 TOP 3';
      case 'weekly': return '이번 주 TOP 3';
      case 'monthly': return '이번 달 TOP 3';
      default: return 'TOP 3';
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (direction === 'prev') {
        if (selectedPeriod === 'daily') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (selectedPeriod === 'weekly') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(1); // Go to start of current month
            newDate.setMonth(newDate.getMonth() - 1); // Go to previous month
        }
        setCurrentDate(newDate);
        return;
    }

    // direction === 'next'
    let nextDate = new Date(currentDate);

    if (selectedPeriod === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
        // 어제 날짜까지만 이동 가능
        if (nextDate >= YESTERDAY) return; 
        setCurrentDate(nextDate);

    } else if (selectedPeriod === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
        // 오늘이 포함된 주까지만 이동 가능
        if (startOfWeek(nextDate, { weekStartsOn: 1 }) > YESTERDAY) return;
        setCurrentDate(nextDate);

    } else { // monthly
        nextDate.setMonth(nextDate.getMonth() + 1, 1);
        
        const nextMonthStart = startOfMonth(nextDate);
        const currentMonthStart = startOfMonth(YESTERDAY);
        
        // 다음 월이 현재 월보다 미래면 조회 불가
        if (nextMonthStart > currentMonthStart) return;
        
        // 다음 월이 현재 월이라면, 오늘이 그 월의 첫날이 아닌 경우에만 조회 가능
        // (어제까지의 데이터가 있어야 함)
        if (nextMonthStart.getTime() === currentMonthStart.getTime() && YESTERDAY.getDate() === 1) return;
        
        setCurrentDate(nextDate);
    }
  };

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    const today = new Date();
    setCurrentDate(subDays(today, 1));
  };

  // 모달 애니메이션 처리
  useEffect(() => {
    if (showDetailModal) {
      // 모달이 열릴 때
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 모달이 닫힐 때
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDetailModal, backgroundOpacity, modalTranslateY]);

  const handleCloseModal = () => {
    setShowDetailModal(false);
  };

  const renderTopThreeItem = (user: ExtendedRankingItem, index: number) => {
    const positions = [
      { size: 80, podiumHeight: 96, marginTop: 32 }, // 1st
      { size: 64, podiumHeight: 80, marginTop: 0 },   // 2nd
      { size: 64, podiumHeight: 64, marginTop: 16 },  // 3rd
    ];
    
    const position = positions[index];
    if (!position) return undefined;
    
    const isFirst = index === 0;
    const podiumColor = isFirst ? colors.primary : colors.accent;

    return (
      <View key={user.user.id} style={[styles.topThreeItem, { marginTop: position.marginTop }]}>
        <View style={[
          styles.topThreeAvatar,
          { 
            width: position.size, 
            height: position.size,
            borderColor: podiumColor,
          }
        ]}>
          <Image 
            source={{ uri: user.user.picture || 'https://via.placeholder.com/48' }} 
            style={[
              styles.topThreeAvatarImage, 
              { 
                width: position.size - 8, 
                height: position.size - 8,
                borderRadius: (position.size - 8) / 2,
              }
            ]} 
          />
        </View>
        <View style={[
          styles.topThreePodium,
          {
            backgroundColor: podiumColor,
            height: position.podiumHeight,
            width: position.size - 8,
          }
        ]}>
          <Text style={styles.topThreeRank}>{user.rank || 0}</Text>
        </View>
        <Text style={[styles.topThreeName, { color: colors.text }]}>{user.user.nickName}</Text>
        <Text style={[styles.topThreeScore, { color: colors.secondary }]}>{user.score.toLocaleString()}점</Text>
      </View>
    );
  };

  const renderRankingItem = (user: ExtendedRankingItem) => {
    const isCurrentUser = user.isCurrentUser;
    const userRank = user.rank || 0;
    const rankColor = userRank === 1 ? colors.primary : userRank <= 3 ? colors.accent : colors.secondary;

    return (
      <View key={user.user.id} style={[styles.rankingItem, { borderBottomColor: colors.border }, isCurrentUser && { backgroundColor: colors.primary + '10' }]}>
        <View style={styles.rankingLeft}>
          <Text style={[
            styles.rankingRank,
            { 
              color: rankColor,
              fontWeight: (user.rank || 0) <= 3 ? '700' : '500',
            }
          ]}>
            {user.rank || 0}
          </Text>
          
          {isCurrentUser ? (
            <View style={[styles.currentUserAvatar, { backgroundColor: colors.border }]}>
              <Text style={[styles.currentUserAvatarText, { color: colors.secondary }]}>👤</Text>
            </View>
          ) : (
            <Image source={{ uri: user.user.picture || 'https://via.placeholder.com/48' }} style={styles.rankingAvatar} />
          )}
          
          <View style={styles.rankingInfo}>
            <Text style={[styles.rankingName, { color: colors.text }, isCurrentUser && { color: colors.primary }]}>
              {user.user.nickName}
            </Text>
            <Text style={[styles.rankingTitle, { color: colors.secondary }, isCurrentUser && { color: colors.primary + 'b3'}]}>
              {user.title}
            </Text>
          </View>
        </View>
        
        <View style={styles.rankingRight}>
          <Text style={[
            styles.rankingScore,
            { 
              color: isCurrentUser ? colors.primary : rankColor,
              fontWeight: (user.rank || 0) <= 3 ? '700' : '500',
            }
          ]}>
            {user.score.toLocaleString()}점
          </Text>
          <Text style={[styles.rankingAccuracy, { color: colors.secondary }, isCurrentUser && { color: colors.primary + 'b3' }]}>
            정답률 {user.accuracy}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.secondary }]}>랭킹 데이터를 불러오는 중...</Text>
            </View>
          )}

          {queryError && (
            <View style={[styles.errorContainer, { backgroundColor: colors.destructive + '20' }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {queryError instanceof Error ? queryError.message : '랭킹을 불러오는데 실패했습니다.'}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: colors.destructive }]}
                onPress={() => {
                  refetchRankings();
                  refetchMyRanking();
                }}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Period Selection */}
          <View style={[styles.periodSelector, { backgroundColor: colors.card }]}>
            {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && [styles.activePeriodButton, { backgroundColor: colors.primary }]
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text style={[
                  styles.periodButtonText, { color: colors.secondary },
                  selectedPeriod === period && styles.activePeriodButtonText
                ]}>
                  {period === 'daily' ? '일간' : period === 'weekly' ? '주간' : '월간'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Period Navigation */}
          <View style={styles.periodNavigation}>
            <TouchableOpacity 
              style={styles.periodNavButton}
              onPress={() => navigatePeriod('prev')}
            >
              <Text style={[styles.periodNavIcon, { color: colors.secondary }]}>‹</Text>
            </TouchableOpacity>
            
            <Text style={[styles.periodDisplay, { color: colors.secondary }]}>{formatDateRange()}</Text>
            
            <TouchableOpacity 
              style={styles.periodNavButton}
              onPress={() => navigatePeriod('next')}
            >
              <Text style={[styles.periodNavIcon, { color: colors.secondary }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          {/* Update Notice */}
          <Text style={[styles.updateNotice, { color: colors.secondary }]}>오늘의 결과는 익일 오전 2시 순위 업데이트 됩니다</Text>
          
          {/* TOP 3 Section */}
          <View style={[styles.topThreeSection, { backgroundColor: colors.card }]}>
            <View style={styles.topThreeHeader}>
              <Text style={[styles.topThreeSectionTitle, { color: colors.text }]}>{getTopThreeTitle()}</Text>
              {selectedPeriod === 'weekly' && (
                <Text style={[styles.topThreeDateRange, { color: colors.secondary }]}>{formatDateRange()}</Text>
              )}
            </View>
            
            <View style={styles.topThreeGrid}>
              {topThree.map((user, index) => renderTopThreeItem(user, index))}
            </View>
          </View>
          
          {/* Full Ranking Section */}
          <View style={[styles.fullRankingSection, { backgroundColor: colors.card }]}>
            <View style={[styles.fullRankingHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fullRankingTitle, { color: colors.text }]}>전체 랭킹</Text>
              <Text style={[styles.totalCount, { color: colors.secondary }]}>총 {currentData.length}명</Text>
            </View>
            
            <View style={[styles.rankingList, { backgroundColor: colors.card }]}>
              {otherUsers.map(renderRankingItem)}
              
              {currentUser && (
                renderRankingItem(currentUser)
              )}
            </View>
            
            {displayCount < currentData.length && (
              <TouchableOpacity 
                style={[styles.loadMoreButton, { borderTopColor: colors.border }]}
                onPress={() => setDisplayCount(prev => Math.min(prev + 5, currentData.length))}
              >
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                  더보기 ({Math.min(displayCount, currentData.length)}/{currentData.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* My Record Button */}
          <TouchableOpacity 
            style={[styles.myRecordButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => setShowDetailModal(true)}
          >
            <Text style={styles.myRecordButtonText}>나의 상세기록 보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              backgroundColor: backgroundOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
              })
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                transform: [{ translateY: modalTranslateY }],
                backgroundColor: colors.card
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>나의 상세기록</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={handleCloseModal}
              >
                <Text style={[styles.modalCloseText, { color: colors.secondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Overall Stats */}
              <View style={[styles.overallStats, { backgroundColor: colors.primary }]}>
                <Text style={styles.totalScore}>2,850점</Text>
                <Text style={styles.totalScoreLabel}>누적 총점</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>87%</Text>
                    <Text style={styles.statLabel}>전체 정답률</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>342</Text>
                    <Text style={styles.statLabel}>총 문제 수</Text>
                  </View>
                </View>
              </View>
              
              {/* Category Details */}
              <View style={[styles.categorySection, { backgroundColor: colors.card }]}>
                <Text style={[styles.categorySectionTitle, { color: colors.text }]}>카테고리별 상세</Text>
                
                {[
                  { name: '과학', accuracy: 92, problems: 45, score: 380 },
                  { name: '역사', accuracy: 89, problems: 38, score: 320 },
                  { name: '사회', accuracy: 85, problems: 42, score: 350 },
                  { name: '경제', accuracy: 83, problems: 35, score: 290 },
                  { name: '연예', accuracy: 91, problems: 28, score: 250 },
                  { name: '게임', accuracy: 88, problems: 32, score: 280 },
                  { name: '영화', accuracy: 94, problems: 40, score: 370 },
                  { name: '애니', accuracy: 86, problems: 25, score: 210 },
                  { name: '스포츠', accuracy: 80, problems: 30, score: 240 },
                  { name: '영어', accuracy: 87, problems: 27, score: 260 },
                ].map((category, index) => {
                  const { component: IconComponent, color } = getCategoryIcon(category.name);
                  
                  return (
                    <View key={index} style={[styles.categoryItem, { borderBottomColor: colors.border }]}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryIcon, { backgroundColor: `${color}20` }]}>
                          <IconComponent width={20} height={20} />
                        </View>
                        <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                      </View>
                      <Text style={[styles.categoryStats, { color: colors.text }]}>
                        {category.accuracy}% · {category.problems}문제 · {category.score}점
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  // Loading & Error States
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Period Selection
  periodSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#5B5FFF',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  
  // Period Navigation
  periodNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  periodNavButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodNavIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  periodDisplay: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  updateNotice: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // TOP 3 Section
  topThreeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topThreeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  topThreeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  topThreeDateRange: {
    fontSize: 12,
    color: '#6B7280',
  },
  topThreeGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  topThreeAvatar: {
    borderWidth: 4,
    borderRadius: 50,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topThreeAvatarImage: {
    backgroundColor: '#F3F4F6',
  },
  topThreePodium: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topThreeRank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topThreeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  topThreeScore: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Full Ranking Section
  fullRankingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  fullRankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fullRankingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  rankingList: {
    backgroundColor: '#FFFFFF',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  currentUserItem: {
    backgroundColor: 'rgba(91, 95, 255, 0.05)',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingRank: {
    fontSize: 18,
    fontWeight: '500',
    width: 24,
    marginRight: 16,
  },
  rankingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  currentUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserAvatarText: {
    fontSize: 20,
    color: '#6B7280',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#5B5FFF',
  },
  rankingTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentUserTitle: {
    color: 'rgba(91, 95, 255, 0.8)',
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingScore: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  rankingAccuracy: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentUserAccuracy: {
    color: 'rgba(91, 95, 255, 0.8)',
  },
  
  loadMoreButton: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5B5FFF',
  },
  
  // My Record Button
  myRecordButton: {
    backgroundColor: '#5B5FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5B5FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  myRecordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  
  // Overall Stats
  overallStats: {
    backgroundColor: '#5B5FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 24,
  },
  totalScore: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  totalScoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Category Section
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  categoryStats: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});