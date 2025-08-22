import { BackIcon, CorrectIcon, FlagIcon, InfoIcon, NextArrowIcon, ShareIcon, TimeIcon, WrongIcon } from '@/components/icons';
import { ShareModal } from '@/components/modals/ShareModal';
import { AnswerService } from '@/modules/Answer/service/AnswerService';
import { useAnswerStore } from '@/modules/Answer/store/answerStore';
import { BadgeEvaluationService } from '@/modules/Badge/service/BadgeEvaluationService';
import { BadgeService } from '@/modules/Badge/service/BadgeService';
import { useCategoriesQuery } from '@/modules/Category/store/useCategoryQuery';
import { Quiz } from '@/modules/Quiz/interfaces/Quiz';
import { QuizService } from '@/modules/Quiz/service/QuizService';
import { useQuizStore } from '@/modules/Quiz/store/quizStore';
import { useReportStore } from '@/modules/Report/store/reportStore';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useStreakStore } from '@/modules/User/store/streakStore';
import { useUserStore } from '@/modules/User/store/userStore';
import { toastError, toastSuccess } from '@/utils/toast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QuizResultScreen from './QuizResultScreen';

export default function QuizScreen() {
  const { colors } = useTheme();
  const { categoryId, quizIds } = useLocalSearchParams<{ categoryId: string; quizIds?: string;}>();
  const router = useRouter();
  const { user } = useUserStore();
  const { getCategoryById } = useCategoriesQuery();
  const { getRandomUnsolvedQuizzes } = useQuizStore();
  const { createReport, loading: reportLoading } = useReportStore();
  const { addAnswer, answers: localAnswers } = useAnswerStore();
  const { updateStreaks } = useStreakStore();

  const parsedQuizIds = useMemo(() => {
    return quizIds ? quizIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : undefined;
  }, [quizIds]);

  const isSharedMode = useMemo(() => (
    parsedQuizIds !== undefined && parsedQuizIds.length > 0
  ), [parsedQuizIds]);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [textAnswer, setTextAnswer] = useState('');
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // Time tracking
  const [questionStartTime, setQuestionStartTime] = useState<number>();
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<number[]>([]);
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
  
  // Consecutive correct answers tracking
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  
  // Current question stats
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // Confirmation modal state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(12);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [submittedQuiz, setSubmittedQuiz] = useState<Quiz>();
  
  // Quiz completion state
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState<any[]>([]);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [originalQuizzes, setOriginalQuizzes] = useState<Quiz[]>([]);
  
  // Report modal state  
  const [showReportView, setShowReportView] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('기타');
  const [reportContent, setReportContent] = useState('');
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);


  // Get category info
  const category = getCategoryById(parseInt(categoryId || '0'));
  const categoryName = category?.name || '퀴즈';

  // Get current quiz from loaded quizzes
  const currentQuiz = quizzes[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Quiz loading effect - localAnswers 변경에 영향받지 않도록 처리
  useEffect(() => {
    const loadQuizzes = async () => {
      if (!user || !categoryId) return;

      try {
        let finalQuizzes: Quiz[] = [];
        
        if (isSharedMode && parsedQuizIds) {
          // 공유된 퀴즈를 통해 들어온 경우
          const sharedQuizzes = await QuizService.getQuizzesByIds(parsedQuizIds);
          
          // 공유 퀴즈 수가 10개 미만이면 나머지를 일반 퀴즈로 채움
          if (sharedQuizzes.length < 10) {
            const remainingCount = 10 - sharedQuizzes.length;
            const response = await getRandomUnsolvedQuizzes(user.id, parseInt(categoryId), remainingCount);
            finalQuizzes = [...sharedQuizzes, ...response.quizzes];
          } else {
            finalQuizzes = sharedQuizzes;
          }
        } else {
          // 일반적인 경우 - 10개 퀴즈 로드
          const response = await getRandomUnsolvedQuizzes(user.id, parseInt(categoryId), 10);
          finalQuizzes = response.quizzes;
        }
        
        // 현재까지 풀지 않은 퀴즈의 인덱스 계산 (로드 시점의 localAnswers 값 사용)
        let startIndex = 0;
        for (let i = 0; i < finalQuizzes.length; i++) {
          const quiz = finalQuizzes[i];
          if (quiz && quiz.id && !localAnswers[quiz.id]) {
            startIndex = i;
            break;
          }
        }
        
        // 상태 초기화
        setQuizzes(finalQuizzes);
        setOriginalQuizzes(finalQuizzes);
        setTotalQuestions(finalQuizzes.length);
        setCurrentQuestionIndex(startIndex);
        setAnswers(Array.from({ length: finalQuizzes.length }).map(() => undefined));
        setTimeSpentPerQuestion(Array.from({ length: finalQuizzes.length }).map(() => 0));
        setQuestionStartTime(Date.now());
        
      } catch (error) {
        console.error('Failed to load quizzes:', error);
        toastError('퀴즈를 불러오지 못했습니다. 다시 시도해주세요.');
        router.back();
      }
    };

    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryId, isSharedMode, parsedQuizIds, getRandomUnsolvedQuizzes, router]);
  // 의도적으로 localAnswers를 dependency에서 제외함

  // Start timing when current question changes
  useEffect(() => {
    if (quizzes.length > 0 && !isAnswerSubmitted) {
      setQuestionStartTime(Date.now());
      setCurrentElapsedTime(0);
    }
  }, [currentQuestionIndex, quizzes.length, isAnswerSubmitted]);

  // Real-time timer for current question
  useEffect(() => {
    if (!questionStartTime || isAnswerSubmitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setCurrentElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime, isAnswerSubmitted]);

  // Handle Android hardware back button
  useEffect(() => {
    const handleHardwareBackPress = () => {
      // 신고 화면이 열려있을 때 뒤로가기 처리
      if (showResultModal && showReportView) {
        setShowReportView(false);
        return true; // Prevent default back action
      }
      
      // 일반적인 뒤로가기 처리
      setShowExitConfirm(true);
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );

    return () => backHandler.remove();
  }, [showResultModal, showReportView]);

  const handleBack = () => {
    setShowExitConfirm(true);
  };

  const handleBackToMain = () => {
    setShowExitConfirm(false);
    router.push('/');
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const calculateBasePoints = (difficulty: string): number => {
    switch (difficulty) {
      case 'A': return 20;
      case 'B': return 15;
      case 'C': return 12;
      case 'D': return 10;
      default: return 10; // Default to D level if unknown
    }
  };

  const calculateBonusPoints = (isCorrect: boolean, timeSpent: number, consecutiveCount: number): number => {
    if (!isCorrect) return 0;
    
    let bonus = 0;
    
    // Time bonus: +1 point if answered within 10 seconds
    if (timeSpent <= 10) {
      bonus += 1;
    }
    
    // Consecutive correct bonus
    if (consecutiveCount >= 2) {
      if (consecutiveCount === 2) {
        bonus += 1; // 2 consecutive: +1 point
      } else {
        bonus += 2; // 3+ consecutive: +2 points
      }
    }
    
    return bonus;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleTextChange = (text: string) => {
    setTextAnswer(text);
  };

  const handleSubmitAnswer = async () => {
    if (isAnswerSubmitted) {
      // 이미 답이 제출된 경우 다음 문제로 이동
      handleNextQuestion();
      return;
    }

    const answer = currentQuiz?.type === 0 ? selectedAnswer : textAnswer;
    
    if (!answer || !user || !currentQuiz) {
      return; // Show validation error
    }

    // 답변 제출 시점의 퀴즈 정보 보존
    setSubmittedQuiz(currentQuiz);

    // Calculate time spent on this question
    const currentTime = Date.now();
    const timeSpent = questionStartTime ? Math.floor((currentTime - questionStartTime) / 1000) : 0;
    
    // Check if answer is correct (local check for bonus calculation)
    // Normalize both answers by converting to lowercase and removing spaces
    const normalizeAnswer = (text: string) => text.trim().toLowerCase()
    const correct = normalizeAnswer(currentQuiz.correct) === normalizeAnswer(answer);
    
    // Update consecutive correct count
    const newConsecutiveCorrect = correct ? consecutiveCorrect + 1 : 0;
    setConsecutiveCorrect(newConsecutiveCorrect);
    
    // Calculate points
    const basePoints = correct ? calculateBasePoints(currentQuiz.difficulty) : 0;
    const bonusPoints = calculateBonusPoints(correct, timeSpent, newConsecutiveCorrect);
    
    try {
      // Submit answer to API
      const submitData = {
        userId: user.id,
        quizId: currentQuiz.id,
        categoryId: parseInt(categoryId || '0'),
        userAnswer: answer,
        timeTaken: timeSpent,
        point: basePoints,
        ...(bonusPoints > 0 && { bonusPoint: bonusPoints })
      };
      
      const response = await AnswerService.submitAnswer(submitData);
      const { answer: submittedAnswer, correctAnswer } = response;

      // 연속 정답 횟수 업데이트
      await updateStreaks({
        isCorrect: submittedAnswer.isCorrect,
        mainCategoryId: category?.parentId || 0, // 메인 카테고리 ID가 없을 경우 대비
        subCategoryId: parseInt(categoryId || '0'),
      });

      // Save answer to local answerStore
      await addAnswer(user.id, submittedAnswer);

      // Save answer locally
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = submittedAnswer.userAnswer;
      setAnswers(newAnswers);

      // Save time spent locally
      const newTimeSpent = [...timeSpentPerQuestion];
      newTimeSpent[currentQuestionIndex] = timeSpent;
      setTimeSpentPerQuestion(newTimeSpent);

      // Update UI with response data
      setIsCorrect(submittedAnswer.isCorrect);
      setCorrectAnswer(correctAnswer);
      setTimeSpent(timeSpent);
      
      // Set earned points and accuracy for display
      setEarnedPoints(submittedAnswer.point + submittedAnswer.bonusPoint);
      
      // Update scores
      const newTotalCorrect = totalCorrect + (submittedAnswer.isCorrect ? 1 : 0);
      setTotalCorrect(newTotalCorrect);
      
      // Update total earned points
      setTotalEarnedPoints(prev => prev + submittedAnswer.point + submittedAnswer.bonusPoint);
      
      // 답 제출 상태 업데이트
      setIsAnswerSubmitted(true);
      
      console.log(`Question ${currentQuestionIndex + 1} completed in ${timeSpent} seconds - Base: ${basePoints}점, Bonus: ${bonusPoints}점 (Difficulty: ${currentQuiz.difficulty})`);
      
      // 신고 화면 상태 초기화 및 결과 모달 표시
      setShowReportView(false);
      setShowResultModal(true);
      
    } catch (error) {
      console.error('Failed to submit answer:', error);
      // Show error message to user
      toastError('답안 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleNextQuestion = () => {
    setShowResultModal(false);
    setShowReportView(false); // 신고 화면 상태 초기화
    setSubmittedQuiz(undefined); // 제출된 퀴즈 정보 초기화
    
    // Move to next question or show final results
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(undefined);
      setTextAnswer('');
      setIsAnswerSubmitted(false); // 다음 문제로 이동 시 답 제출 상태 초기화
    } else {
      // Quiz completed - prepare final results
      const normalizeAnswer = (text: string) => text.trim().toLowerCase();
      
      const results = originalQuizzes.map((quiz, index) => {
        const userAnswer = answers[index] || '';
        const isCorrect = normalizeAnswer(quiz.correct) === normalizeAnswer(userAnswer);
        
        return {
          questionId: quiz.id.toString(),
          questionText: quiz.question,
          correctAnswer: quiz.correct,
          userAnswer,
          isCorrect,
          questionNumber: index + 1,
        };
      });
      
      setFinalResults(results);
      setQuizCompleted(true);
      
      // Evaluate and award new badges
      if (categoryId) {
        BadgeEvaluationService.evaluateNewBadges(parseInt(categoryId)).then(newBadges => {
          if (newBadges.length > 0) {
            newBadges.forEach(badge => {
              BadgeService.awardBadge(badge.id);
            });
            toastSuccess(`축하합니다! 다음 배지를 획득했습니다: ${newBadges.map(b => b.name).join(', ')}`, '새로운 배지 획득!');
          }
            if (newBadges.length > 0) {
              newBadges.forEach(badge => {
                BadgeService.awardBadge(badge.id);
              });
              toastSuccess(`축하합니다! 다음 배지를 획득했습니다: ${newBadges.map(b => b.name).join(', ')}`, '새로운 배지 획득!');
            }
          });
        }

        console.log('Quiz completed!', {
        answers,
        timeSpentPerQuestion,
        totalTimeSpent: timeSpentPerQuestion.reduce((sum, time) => sum + time, 0),
        averageTimePerQuestion: timeSpentPerQuestion.reduce((sum, time) => sum + time, 0) / timeSpentPerQuestion.length,
        finalScore: results.filter(r => r.isCorrect).length
      });
    }
  };

  const handleReportSubmit = async () => {
    if (!reportTitle.trim() || !reportCategory || !reportContent.trim()) {
      return; // Show validation error
    }
    
    if (!user || !submittedQuiz) {
      console.error('User or submitted quiz is missing');
      return;
    }
    
    try {
      const reportData = {
        title: reportTitle,
        contents: reportContent,
        category: reportCategory,
        isPrivate: false,
        userId: user.id,
        quizId: submittedQuiz.id,
      };
      
      await createReport({
        ...reportData,
        category: reportCategory as "기타" | "정답 오류" | "부적절한 내용"
      });
      
      // Reset form and go back to result view
      setReportTitle('');
      setReportCategory('기타');
      setReportContent('');
      setShowReportView(false);
      
      // Show success message
      toastSuccess('소중한 의견 감사합니다. 더 나은 서비스를 위해 검토하겠습니다.', '신고 완료');
    } catch (error) {
      console.error('Failed to submit report:', error);
      // Show error message to user (optional)
    }
  };

  const handleReportCancel = () => {
    setReportTitle('');
    setReportCategory('기타');
    setReportContent('');
    setShowReportView(false);
  };

  const handleReportButtonPress = () => {
    setShowReportView(true);
  };

  const handleShareButtonPress = () => {
    setShowShareModal(true);
  };

  const generateShareUrl = () => {
    const currentQuizIds = quizzes.map(quiz => quiz.id);
    const quizIdsString = currentQuizIds.join(',');
    
    return `https://qtubebe-production.up.railway.app/pages/quizzes/${categoryId}?quizIds=${quizIdsString}`;
  };

  // Quiz result screen handlers
  const handleGoToMain = () => {
    // Navigate to main screen
    router.push('/');
  };


  const renderMultipleChoiceOptions = () => {
    if (!currentQuiz) return undefined;
    
    // Convert answer1-4 to options array
    const options = [currentQuiz.answer1, currentQuiz.answer2, currentQuiz.answer3, currentQuiz.answer4]
      .filter((answer): answer is string => answer !== undefined);
    
    if (options.length === 0) return undefined;

    return (
      <View style={styles.optionsContainer}>
        {options.map((option: string, index: number) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === option;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                isAnswerSubmitted && styles.optionItemDisabled
              ]}
              onPress={() => !isAnswerSubmitted && handleAnswerSelect(option)}
              disabled={isAnswerSubmitted}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionLetter,
                  { backgroundColor: colors.border },
                  isSelected && { backgroundColor: colors.primary }
                ]}>
                  <Text style={[
                    styles.optionLetterText,
                    { color: colors.secondary },
                    isSelected && { color: '#ffffff' }
                  ]}>
                    {letter}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  { color: colors.text },
                  isSelected && { color: colors.primary, fontWeight: '500' }
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSubjectiveInput = () => {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            isAnswerSubmitted && styles.textInputDisabled
          ]}
          value={textAnswer}
          onChangeText={handleTextChange}
          placeholder="정답을 입력하세요"
          placeholderTextColor={colors.secondary}
          multiline={false}
          autoCorrect={false}
          autoCapitalize="none"
          editable={!isAnswerSubmitted}
        />
      </View>
    );
  };

  const isAnswerSelected = currentQuiz?.type === 0 
    ? selectedAnswer !== undefined 
    : textAnswer.trim().length > 0;
  
  const isSubmitButtonEnabled = isAnswerSubmitted || isAnswerSelected;

  // Show quiz result screen when quiz is completed
  if (quizCompleted) {
    return (
      <QuizResultScreen
        score={totalCorrect}
        totalQuestions={totalQuestions}
        totalEarnedPoints={totalEarnedPoints}
        results={finalResults}
        onGoToMain={handleGoToMain}
      />
    );
  }

  // Show loading or empty state if no quizzes
  if (quizzes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <BackIcon width={24} height={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>{categoryName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.secondary }]}>퀴즈를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <BackIcon width={24} height={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>{categoryName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShareButtonPress}
            >
              <ShareIcon width={16} height={16} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {currentQuestionIndex + 1}/{totalQuestions}
            </Text>
            <View style={[styles.timerContainer, { backgroundColor: colors.primary + '20' }]}>
              <TimeIcon width={16} height={16} color={colors.primary} />
              <Text style={[styles.timerText, { color: colors.primary }]}>
                {Math.floor(currentElapsedTime / 60)}:{(currentElapsedTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quiz Content */}
        <View style={[styles.quizContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>{currentQuiz?.question || ''}</Text>
          </View>

          {/* Answer Section */}
          {currentQuiz?.type === 0 ? renderMultipleChoiceOptions() : renderSubjectiveInput()}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              !isSubmitButtonEnabled && { backgroundColor: colors.border }
            ]}
            onPress={handleSubmitAnswer}
            disabled={!isSubmitButtonEnabled}
          >
            <Text style={[
              styles.submitButtonText,
              !isSubmitButtonEnabled && { color: colors.secondary }
            ]}>
              {isAnswerSubmitted ? '다음 문제' : '정답 제출하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quiz Tips */}
        <View style={[styles.tipsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>퀴즈 팁</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <InfoIcon width={12} height={12} color={colors.secondary} />
              <Text style={[styles.tipText, { color: colors.secondary }]}>10초 이내에 정답을 맞추면 보너스 점수를 획득할 수 있습니다.</Text>
            </View>
            <View style={styles.tipItem}>
              <InfoIcon width={12} height={12} color={colors.secondary} />
              <Text style={[styles.tipText, { color: colors.secondary }]}>연속 정답 시 보너스 점수를 획득할 수 있습니다.</Text>
            </View>
            <View style={styles.tipItem}>
              <InfoIcon width={12} height={12} color={colors.secondary} />
              <Text style={[styles.tipText, { color: colors.secondary }]}>정답을 제출한 후에는 변경할 수 없습니다.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirm}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>정말 벗어나시겠습니까?</Text>
            <Text style={[styles.modalMessage, { color: colors.secondary }]}>일부 기록이 초기화될 수 있습니다.</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.border }]} 
                onPress={handleCancelExit}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.primary }]} 
                onPress={handleBackToMain}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => {
          setShowResultModal(false);
          setShowReportView(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.resultModalContainer, { backgroundColor: colors.card }]}>
            {!showReportView ? (
              <>
                <View style={styles.resultModalHeader}>
                  <TouchableOpacity 
                    style={styles.reportButton} 
                    onPress={handleReportButtonPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <FlagIcon width={10} height={10} />
                    <Text style={[styles.reportButtonText, { color: colors.secondary }]}>신고</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.resultIconContainer}>
                  <View style={[styles.resultIcon, isCorrect ? styles.correctIcon : styles.incorrectIcon]}>
                    {isCorrect ? (
                      <CorrectIcon width={50} height={42} color="#16A34A" />
                    ) : (
                      <WrongIcon width={50} height={48} color="#EF4444" />
                    )}
                  </View>
                </View>
                
                <Text style={[styles.resultTitle, isCorrect ? styles.correctTitle : styles.incorrectTitle]}>
                  {isCorrect ? '정답입니다!' : '오답입니다!'}
                </Text>
                
                <Text style={[styles.resultMessage, { color: colors.secondary }]}>
                  {isCorrect ? '다음 문제로 이동하세요' : '다음 문제를 잘 풀어보세요'}
                </Text>
                
                <View style={[styles.answerExplanationContainer, { backgroundColor: isCorrect ? colors.primary + '10' : colors.destructive + '10' }]}>
                  <View style={styles.answerHeader}>
                    <InfoIcon width={16} height={16} color={colors.text} />
                    <Text style={[styles.answerLabel, { color: colors.text }]}>정답: </Text>
                    <Text style={[styles.answerValue, { color: colors.primary }]}>{correctAnswer}</Text>
                  </View>
                  <Text style={[styles.answerExplanation, { color: colors.text }]}>
                    {submittedQuiz?.explanation || `${submittedQuiz?.correct}`}
                  </Text>
                </View>
                
                {/* Time and Stats Display */}
                <View style={[styles.timeContainer, { backgroundColor: colors.destructive + '10' }]}>
                  <TimeIcon width={16} height={16} color={colors.destructive} />
                  <Text style={[styles.timeText, { color: colors.destructive }]}>소요시간: {timeSpent}초</Text>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{consecutiveCorrect}</Text>
                    <Text style={[styles.statLabel, { color: colors.secondary }]}>연속 정답</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{earnedPoints}</Text>
                    <Text style={[styles.statLabel, { color: colors.secondary }]}>총 점수</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>
                      {submittedQuiz ? 
                        Math.round((submittedQuiz.correctCount / (submittedQuiz.correctCount + submittedQuiz.wrongCount)) * 100) || 0
                        : 0}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.secondary }]}>정답률</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNextQuestion}>
                  <Text style={styles.nextButtonText}>다음 문제</Text>
                  <View style={styles.nextButtonIcon}>
                    <NextArrowIcon width={16} height={16} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.reportModalHeader}>
                  <Text style={[styles.reportModalTitle, { color: colors.text }]}>문제 신고하기</Text>
                  <TouchableOpacity style={styles.reportCloseButton} onPress={handleReportCancel}>
                    <Text style={[styles.reportCloseButtonText, { color: colors.secondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.reportFormContainer}>
                  <View style={styles.reportField}>
                    <Text style={[styles.reportLabel, { color: colors.secondary }]}>제목</Text>
                    <TextInput
                      style={[styles.reportInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={reportTitle}
                      onChangeText={setReportTitle}
                      placeholder="신고 제목을 입력해주세요"
                      placeholderTextColor={colors.secondary}
                    />
                  </View>
                  
                  <View style={styles.reportField}>
                    <Text style={[styles.reportLabel, { color: colors.secondary }]}>카테고리</Text>
                    <View style={styles.reportCategoryContainer}>
                      {['정답 오류', '부적절한 내용', '기타'].map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.reportCategoryButton,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            reportCategory === category && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => setReportCategory(category)}
                        >
                          <Text style={[
                            styles.reportCategoryButtonText,
                            { color: colors.secondary },
                            reportCategory === category && { color: colors.primary, fontWeight: '500' }
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.reportField}>
                    <Text style={[styles.reportLabel, { color: colors.secondary }]}>내용</Text>
                    <TextInput
                      style={[styles.reportTextarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={reportContent}
                      onChangeText={setReportContent}
                      placeholder="상세 내용을 입력해주세요"
                      placeholderTextColor={colors.secondary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
                
                <View style={styles.reportButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.reportCancelButton, { backgroundColor: colors.border }]} 
                    onPress={handleReportCancel}
                    disabled={reportLoading}
                  >
                    <Text style={[styles.reportCancelButtonText, { color: colors.secondary }]}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.reportSubmitButton,
                      { backgroundColor: colors.primary },
                      reportLoading && { backgroundColor: colors.border }
                    ]} 
                    onPress={handleReportSubmit}
                    disabled={reportLoading}
                  >
                    <Text style={[styles.reportSubmitButtonText, reportLoading && { color: colors.secondary }]}>
                      {reportLoading ? '신고 중...' : '신고하기'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={generateShareUrl()}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Roboto',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginRight: 8,
    fontFamily: 'Roboto',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4f46e5',
    fontFamily: 'Roboto',
    minWidth: 32,
    textAlign: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 9999,
  },
  scrollView: {
    flex: 1,
  },
  quizContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 28,
    fontFamily: 'Roboto',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionItem: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#4f46e5',
  },
  optionItemDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterSelected: {
    backgroundColor: '#4f46e5',
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Roboto',
  },
  optionLetterTextSelected: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1f2937',
    lineHeight: 24,
    fontFamily: 'Roboto',
  },
  optionTextSelected: {
    color: '#1f2937',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '400',
    color: '#1f2937',
    fontFamily: 'Roboto',
    minHeight: 46,
    textAlignVertical: 'center',
  },
  textInputDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    color: '#6b7280',
    opacity: 0.6,
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 100 : 80,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 1,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4b5563',
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Roboto',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  // Confirmation Modal Styles (based on Figma design)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: 320,
    height: 180,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  modalMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4b5563',
    fontFamily: 'Roboto',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  // Result Modal Styles
  resultModalContainer: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  resultModalHeader: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    minWidth: 48,
    minHeight: 32,
    justifyContent: 'center',
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
    fontFamily: 'Roboto',
  },
  resultIconContainer: {
    marginBottom: 8,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctIcon: {
    backgroundColor: '#dcfce7',
  },
  incorrectIcon: {
    backgroundColor: '#fee2e2',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  correctTitle: {
    color: '#16a34a',
  },
  incorrectTitle: {
    color: '#ef4444',
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  answerExplanationContainer: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Roboto',
    marginLeft: 8,
  },
  answerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
    fontFamily: 'Roboto',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  answerExplanation: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  nextButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  nextButtonIcon: {
    marginLeft: 4,
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Roboto',
  },
  reportCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCloseButtonText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#9ca3af',
  },
  reportFormContainer: {
    marginBottom: 24,
    width: '100%',
  },
  reportField: {
    marginBottom: 20,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  reportInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '400',
    color: '#1f2937',
    fontFamily: 'Roboto',
    minHeight: 40,
  },
  reportCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
  },
  reportCategoryButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#4f46e5',
  },
  reportCategoryButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  reportCategoryButtonTextSelected: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  reportTextarea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '400',
    color: '#1f2937',
    fontFamily: 'Roboto',
    minHeight: 80,
  },
  reportButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  reportCancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCancelButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4b5563',
    fontFamily: 'Roboto',
  },
  reportSubmitButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSubmitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  reportSubmitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  
  // New styles for improved result modal
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    alignSelf: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 6,
    fontFamily: 'Roboto',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Roboto',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  logo: {
    marginRight: 8,
  },
}); 