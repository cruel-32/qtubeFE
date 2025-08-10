import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Answer, SubmitAnswerRequest } from '../interfaces/Answer';
import { AnswerService, SubmitAnswerResponse } from '../service/AnswerService';

interface UserStats {
  totalSolved: number;
  totalCorrect: number;
  correctRate: number;
  consecutiveCorrect: number;
}

interface AnswerState {
  answers: Record<number, Answer>;
  isLoaded: boolean;
  submitResult?: SubmitAnswerResponse;
  loading: boolean;
  error?: string;
  currentUserId: string | null;
  lastSyncTimestamp: string | null;

  // Actions
  setCurrentUserId: (userId: string | null) => void;
  loadAnswersFromStorage: (userId: string) => Promise<void>;
  setAnswers: (userId: string, answers: Answer[]) => Promise<void>;
  addAnswer: (userId: string, answer: Answer) => Promise<void>;
  getAnswersByUserId: (userId: string) => Promise<void>;
  submitAnswer: (data: SubmitAnswerRequest) => Promise<SubmitAnswerResponse>;
  getStats: (categoryId?: number) => UserStats;
}

const getStorageKey = (userId: string) => `userAnswers_${userId}`;
const getSyncTimestampKey = (userId: string) => `lastAnswerSyncTimestamp_${userId}`;

export const useAnswerStore = create<AnswerState>((set, get) => ({
  answers: {},
  isLoaded: false,
  submitResult: undefined,
  loading: false,
  error: undefined,
  currentUserId: null,
  lastSyncTimestamp: null,

  // Actions
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  loadAnswersFromStorage: async (userId: string) => {
    if (!userId) return;
    try {
      const key = getStorageKey(userId);
      const storedAnswers = await AsyncStorage.getItem(key);
      const storedTimestamp = await AsyncStorage.getItem(getSyncTimestampKey(userId));

      if (storedAnswers) {
        const answers = JSON.parse(storedAnswers);
        set({ answers, isLoaded: true, lastSyncTimestamp: storedTimestamp });
      } else {
        set({ answers: {}, isLoaded: true, lastSyncTimestamp: null });
      }
    } catch (error) {
      console.error("Failed to load answers from storage:", error);
      set({ isLoaded: true });
    }
  },

  setAnswers: async (userId: string, answers: Answer[]) => {
    if (!userId) return;
    const answerMap = answers.reduce((acc, answer) => {
      acc[answer.quizId] = answer;
      return acc;
    }, {} as Record<number, Answer>);

    try {
      const key = getStorageKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(answerMap));
      set({ answers: answerMap });
    } catch (error) {
      console.error("Failed to save answers to storage:", error);
    }
  },

  addAnswer: async (userId: string, answer: Answer) => {
    if (!userId) return;
    const newAnswers = { ...get().answers, [answer.quizId]: answer };
    try {
      const key = getStorageKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(newAnswers));
      set({ answers: newAnswers });
    } catch (error) {
      console.error("Failed to save answer to storage:", error);
    }
  },

  getAnswersByUserId: async (userId: string) => {
    if (!userId) return;
    try {
      set({ loading: true, error: undefined });
      const { lastSyncTimestamp } = get();
      const response = await AnswerService.getAnswersByUserId(userId, lastSyncTimestamp);
      const { answers, syncTimestamp } = response; // Assuming response is GetAnswersResponse

      const currentAnswers = get().answers;
      const newAnswerMap = answers.reduce((acc, answer) => {
        acc[answer.quizId] = answer;
        return acc;
      }, {} as Record<number, Answer>);

      const mergedAnswers = { ...currentAnswers, ...newAnswerMap };

      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(mergedAnswers));
      await AsyncStorage.setItem(getSyncTimestampKey(userId), syncTimestamp);

      set({ answers: mergedAnswers, lastSyncTimestamp: syncTimestamp, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user answers';
      set({ error: errorMessage, loading: false });
    }
  },

  submitAnswer: async (data: SubmitAnswerRequest) => {
    try {
      set({ loading: true, error: undefined });
      const result = await AnswerService.submitAnswer(data);
      // Assuming data.userId is the currently logged-in user
      await get().addAnswer(data.userId, result.answer);
      set({ submitResult: result, loading: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

    getStats: (categoryId?: number): UserStats => {
    const { answers } = get();
    const answerList = Object.values(answers);

    const filteredAnswers = categoryId
      ? answerList.filter(answer => answer.categoryId === categoryId)
      : answerList;

    // Sort answers by creation time to calculate consecutive correct answers
    const sortedAnswers = filteredAnswers.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    let consecutiveCorrect = 0;
    for (let i = sortedAnswers.length - 1; i >= 0; i--) {
      if (sortedAnswers[i]?.isCorrect) {
        consecutiveCorrect++;
      } else {
        break;
      }
    }

    const totalSolved = sortedAnswers.length;
    const totalCorrect = sortedAnswers.filter(a => a.isCorrect).length;
    const correctRate = totalSolved > 0 ? (totalCorrect / totalSolved) * 100 : 0;

    return {
      totalSolved,
      totalCorrect,
      correctRate: Math.round(correctRate),
      consecutiveCorrect,
    };
  },
}));