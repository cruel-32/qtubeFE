import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/modules/Theme/context/ThemeContext';

interface QuizResult {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  questionNumber: number;
}

interface QuizResultScreenProps {
  score: number;
  totalQuestions: number;
  totalEarnedPoints: number;
  results: QuizResult[];
  onGoToMain: () => void;
}

const QuizResultScreen: React.FC<QuizResultScreenProps> = ({
  score,
  totalQuestions,
  totalEarnedPoints,
  results,
  onGoToMain,
}) => {
  const { colors } = useTheme();
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);
  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = results.filter(r => !r.isCorrect).length;

  const getScoreMessage = () => {
    if (percentage >= 90) return '완벽해요!';
    if (percentage >= 80) return '훌륭해요!';
    if (percentage >= 70) return '잘했어요!';
    if (percentage >= 60) return '괜찮아요!';
    return '더 노력해요!';
  };

  const getScoreDescription = () => {
    if (percentage >= 80) return '대부분의 문제를 맞히셨습니다.';
    if (percentage >= 60) return '절반 이상의 문제를 맞히셨습니다.';
    return '더 많은 연습이 필요합니다.';
  };

  const handleBackPress = () => {
    router.back();
  };

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    header: {
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
    },
    progressText: {
      color: colors.text,
    },
    scoreCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    scoreText: {
      color: colors.text,
    },
    scoreDescription: {
        color: colors.secondary,
    },
    correctStats: {
        backgroundColor: colors.accent + '20',
    },
    wrongStats: {
        backgroundColor: colors.destructive + '20',
    },
    correctStatsLabel: {
        color: colors.secondary,
    },
    wrongStatsLabel: {
        color: colors.secondary,
    },
    resultsTitle: {
        color: colors.text,
    },
    correctResult: {
        backgroundColor: colors.accent + '20',
    },
    wrongResult: {
        backgroundColor: colors.destructive + '20',
    },
    questionText: {
        color: colors.text,
    },
    tipsSection: {
        backgroundColor: colors.background,
    },
    tipsTitle: {
        color: colors.text,
    },
    tipsCard: {
        backgroundColor: colors.card,
        borderColor: colors.border,
    },
    tipText: {
        color: colors.secondary,
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>퀴즈 결과</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.progressText, dynamicStyles.progressText]}>{correctCount}/{totalQuestions}</Text>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { borderBottomColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score Section */}
        <View style={[styles.scoreCard, dynamicStyles.scoreCard]}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, dynamicStyles.scoreText]}>{totalEarnedPoints}점</Text>
            </View>
            <Text style={[styles.scoreMessage, dynamicStyles.scoreText]}>{getScoreMessage()}</Text>
            <Text style={[styles.scoreDescription, dynamicStyles.scoreDescription]}>{getScoreDescription()}</Text>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={[styles.correctStats, dynamicStyles.correctStats]}>
              <Text style={styles.correctStatsNumber}>{correctCount}문제</Text>
              <Text style={[styles.correctStatsLabel, dynamicStyles.correctStatsLabel]}>정답</Text>
            </View>
            <View style={[styles.wrongStats, dynamicStyles.wrongStats]}>
              <Text style={styles.wrongStatsNumber}>{wrongCount}문제</Text>
              <Text style={[styles.wrongStatsLabel, dynamicStyles.wrongStatsLabel]}>오답</Text>
            </View>
          </View>

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, dynamicStyles.resultsTitle]}>문항별 결과</Text>
          </View>

          {/* Question Results */}
          <View style={styles.questionResults}>
            {(showAllQuestions ? results : results.slice(0, 3)).map((result) => (
              <View
                key={result.questionId}
                style={[
                  styles.questionResult,
                  result.isCorrect ? dynamicStyles.correctResult : dynamicStyles.wrongResult,
                ]}
              >
                <View style={styles.questionNumber}>
                  <View
                    style={[
                      styles.questionNumberCircle,
                      result.isCorrect
                        ? styles.correctNumberCircle
                        : styles.wrongNumberCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.questionNumberText,
                        result.isCorrect
                          ? styles.correctNumberText
                          : styles.wrongNumberText,
                      ]}
                    >
                      {result.questionNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.questionContent}>
                  <Text style={[styles.questionText, dynamicStyles.questionText]}>{result.questionText}</Text>
                  <Text
                    style={[
                      styles.answerText,
                      result.isCorrect ? styles.correctAnswerText : styles.wrongAnswerText,
                    ]}
                  >
                    정답: {result.correctAnswer} (선택: {result.userAnswer})
                  </Text>
                </View>
                <View style={styles.questionIcon}>
                  <Ionicons
                    name={result.isCorrect ? "checkmark" : "close"}
                    size={20}
                    color={result.isCorrect ? "#16a34a" : "#dc2626"}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* View All Button */}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => setShowAllQuestions(!showAllQuestions)}
          >
            <Text style={styles.viewAllButtonText}>
              {showAllQuestions ? '접기' : '모든 문항 보기'}
            </Text>
            <Ionicons 
              name={showAllQuestions ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#6147ff" 
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={onGoToMain}
          >
            <Text style={styles.retakeButtonText}>다른 문제 풀기</Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Tips */}
        <View style={[styles.tipsSection, dynamicStyles.tipsSection]}>
          <Text style={[styles.tipsTitle, dynamicStyles.tipsTitle]}>퀴즈 팁</Text>
          <View style={[styles.tipsCard, dynamicStyles.tipsCard]}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={16} color="#6147ff" />
              <Text style={[styles.tipText, dynamicStyles.tipText]}>
                틀린 문제는 정답 해설을 통해 복습해보세요.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={16} color="#6147ff" />
              <Text style={[styles.tipText, dynamicStyles.tipText]}>
                다른 문제를 풀어보며 실력을 향상시킬 수 있습니다.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 16,
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6147ff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scoreCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginTop: 16,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreMessage: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  correctStats: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  correctStatsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 4,
  },
  correctStatsLabel: {
    fontSize: 14,
  },
  wrongStats: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  wrongStatsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  wrongStatsLabel: {
    fontSize: 14,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  questionResults: {
    gap: 12,
    marginBottom: 16,
  },
  questionResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  correctResult: {},
  wrongResult: {},
  questionNumber: {
    width: 44,
    alignItems: 'center',
  },
  questionNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctNumberCircle: {
    backgroundColor: '#dcfce7',
  },
  wrongNumberCircle: {
    backgroundColor: '#fee2e2',
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: '500',
  },
  correctNumberText: {
    color: '#16a34a',
  },
  wrongNumberText: {
    color: '#dc2626',
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
  },
  correctAnswerText: {
    color: '#16a34a',
  },
  wrongAnswerText: {
    color: '#dc2626',
  },
  questionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6147ff',
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  retakeButton: {
    backgroundColor: '#6147ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  tipsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  tipsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default QuizResultScreen;
