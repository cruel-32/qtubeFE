
import { queryClient } from '@/config/queryClient';
import { create } from 'zustand';
import { Category } from '../../Category/interfaces/Category';
import { Quiz } from '../interfaces/Quiz';
import { QuizService } from '../service/QuizService';

// Service response types
interface GetAllQuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetUnsolvedQuizzesResponse {
  quizzes: Quiz[];
  total: number;
  requestedLimit: number;
}

interface QuizState {
  quizzes: Quiz[];
  randomUnsolvedQuiz?: Quiz;
  previewQuizzes: Quiz[];
  currentQuiz?: Quiz;
  pagination?: GetAllQuizzesResponse['pagination'];
  loading: boolean;
  error?: string;
  
  // Helper function to enrich quiz with category name
  enrichQuizWithCategoryName: (quiz: Quiz) => Quiz;
  enrichQuizzesWithCategoryName: (quizzes: Quiz[]) => Quiz[];
  
  // State setters (for backwards compatibility)
  setQuizzes: (quizzes: Quiz[]) => void;
  setRandomUnsolvedQuiz: (quiz?: Quiz) => void;
  setPreviewQuizzes: (quizzes: Quiz[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Actions (API calls)
  getRandomUnsolvedQuizzes: (userId: string, categoryId: number, limit?: number) => Promise<GetUnsolvedQuizzesResponse>;
  getPreviewQuizzes: (userId: string, categoryIds: number[]) => Promise<void>;
  getQuizzesByCategory: (categoryId: number) => Promise<void>;
  getQuizById: (id: number) => Promise<void>;
  incrementCorrectCount: (id: number) => Promise<Quiz>;
  incrementWrongCount: (id: number) => Promise<Quiz>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  randomUnsolvedQuiz: undefined,
  previewQuizzes: [],
  currentQuiz: undefined,
  pagination: undefined,
  loading: false,
  error: undefined,
  
  // Helper functions to enrich quiz with category name
  enrichQuizWithCategoryName: (quiz: Quiz): Quiz => {
    const categories = queryClient.getQueryData<Category[]>(['categories', 'all']);
    const category = categories?.find((cat) => cat.id === quiz.categoryId);
    return {
      ...quiz,
      categoryName: category?.name || quiz.categoryName || '기타'
    };
  },

  enrichQuizzesWithCategoryName: (quizzes: Quiz[]): Quiz[] => {
    const { enrichQuizWithCategoryName } = get();
    return quizzes.map(enrichQuizWithCategoryName);
  },
  
  // State setters
  setQuizzes: (quizzes: Quiz[]) => {
    const { enrichQuizzesWithCategoryName } = get();
    const enrichedQuizzes = enrichQuizzesWithCategoryName(quizzes);
    set({ quizzes: enrichedQuizzes, loading: false, error: undefined });
  },
  
  setRandomUnsolvedQuiz: (quiz?: Quiz) => {
    if (quiz) {
      const { enrichQuizWithCategoryName } = get();
      const enrichedQuiz = enrichQuizWithCategoryName(quiz);
      set({ randomUnsolvedQuiz: enrichedQuiz, loading: false, error: undefined });
    } else {
      set({ randomUnsolvedQuiz: undefined, loading: false, error: undefined });
    }
  },
  
  setPreviewQuizzes: (quizzes: Quiz[]) => {
    const { enrichQuizzesWithCategoryName } = get();
    const enrichedQuizzes = enrichQuizzesWithCategoryName(quizzes);
    set({ previewQuizzes: enrichedQuizzes, loading: false, error: undefined });
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  
  // Actions
  getRandomUnsolvedQuizzes: async (userId: string, categoryId: number, limit: number = 10) => {
    try {
      set({ loading: true, error: undefined });
      const response = await QuizService.getRandomUnsolvedQuizzes(userId, categoryId, limit);
      const { enrichQuizzesWithCategoryName } = get();
      const enrichedQuizzes = enrichQuizzesWithCategoryName(response.quizzes);
      set({ loading: false });
      return {
        ...response,
        quizzes: enrichedQuizzes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unsolved quizzes';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getPreviewQuizzes: async (userId: string, categoryIds: number[]) => {
    try {
      set({ loading: true, error: undefined });
      const quizPromises = categoryIds.map(categoryId => 
        QuizService.getRandomUnsolvedQuizzes(userId, categoryId, 1).then(response => response.quizzes[0])
      );
      
      const results = await Promise.all(quizPromises);
      const validQuizzes = results.filter((quiz) => quiz !== undefined);
      const { enrichQuizzesWithCategoryName } = get();
      const enrichedQuizzes = enrichQuizzesWithCategoryName(validQuizzes);
      set({ previewQuizzes: enrichedQuizzes, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preview quizzes';
      set({ error: errorMessage, loading: false });
    }
  },

  getQuizzesByCategory: async (categoryId: number) => {
    try {
      set({ loading: true, error: undefined });
      const quizzes = await QuizService.getQuizzesByCategory(categoryId);
      const { enrichQuizzesWithCategoryName } = get();
      const enrichedQuizzes = enrichQuizzesWithCategoryName(quizzes);
      set({ quizzes: enrichedQuizzes, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quizzes by category';
      set({ error: errorMessage, loading: false });
    }
  },

  getQuizById: async (id: number) => {
    try {
      set({ loading: true, error: undefined });
      const currentQuiz = await QuizService.getQuizById(id);
      const { enrichQuizWithCategoryName } = get();
      const enrichedQuiz = enrichQuizWithCategoryName(currentQuiz);
      set({ currentQuiz: enrichedQuiz, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz';
      set({ error: errorMessage, loading: false });
    }
  },

  incrementCorrectCount: async (id: number) => {
    try {
      set({ loading: true, error: undefined });
      const quiz = await QuizService.incrementCorrectCount(id);
      const { enrichQuizWithCategoryName } = get();
      const enrichedQuiz = enrichQuizWithCategoryName(quiz);
      set({ loading: false });
      return enrichedQuiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to increment correct count';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  incrementWrongCount: async (id: number) => {
    try {
      set({ loading: true, error: undefined });
      const quiz = await QuizService.incrementWrongCount(id);
      const { enrichQuizWithCategoryName } = get();
      const enrichedQuiz = enrichQuizWithCategoryName(quiz);
      set({ loading: false });
      return enrichedQuiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to increment wrong count';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
