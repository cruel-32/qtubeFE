import { CreateQuizRequest, Quiz, QuizQuery, UpdateQuizRequest } from '@/modules/Quiz/interfaces/Quiz';
import { request } from '@/utils/apiClient';

// BE API 응답 형식에 맞춘 인터페이스들
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

export class QuizService {
  static async createQuiz(data: CreateQuizRequest): Promise<Quiz> {
    try {
      return await request('/quizzes', {
        method: 'POST',
        data,
      });
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw new Error('퀴즈 생성에 실패했습니다.');
    }
  }

  static async getAllQuizzes(query?: QuizQuery): Promise<GetAllQuizzesResponse> {
    try {
      const queryString = query ? `?${new URLSearchParams(query as any).toString()}` : '';
      return await request<GetAllQuizzesResponse>(`/quizzes${queryString}`);
    } catch (error) {
      console.error('Failed to get all quizzes:', error);
      throw new Error('모든 퀴즈를 가져오는데 실패했습니다.');
    }
  }

  // 여러 개의 unsolved quiz를 가져오는 메서드 추가
  static async getRandomUnsolvedQuizzes(userId: string, categoryId: number, limit: number = 10): Promise<GetUnsolvedQuizzesResponse> {
    try {
      return await request<GetUnsolvedQuizzesResponse>(`/quizzes/random/unsolved?userId=${userId}&categoryId=${categoryId}&limit=${limit}`);
    } catch (error) {
      console.error('Failed to get unsolved quizzes:', error);
      throw new Error('풀지 않은 퀴즈들을 가져오는데 실패했습니다.');
    }
  }

  static async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    try {
      return await request(`/quizzes/category/${categoryId}`);
    } catch (error) {
      console.error(`Failed to get quizzes by category ${categoryId}:`, error);
      throw new Error(`카테고리 ${categoryId}의 퀴즈를 가져오는데 실패했습니다.`);
    }
  }

  static async getQuizzesByType(type: number): Promise<Quiz[]> {
    try {
      return await request(`/quizzes/type/${type}`);
      } catch (error) {
      console.error(`Failed to get quizzes by type ${type}:`, error);
      throw new Error(`타입 ${type}의 퀴즈를 가져오는데 실패했습니다.`);
    }
  }

  static async getQuizById(id: number): Promise<Quiz> {
    try {
      return await request(`/quizzes/${id}`);
    } catch (error) {
      console.error(`Failed to get quiz by ID ${id}:`, error);
      throw new Error(`ID ${id}의 퀴즈를 가져오는데 실패했습니다.`);
    }
  }

  static async updateQuiz(id: number, data: UpdateQuizRequest): Promise<Quiz> {
    try {
      return await request(`/quizzes/${id}`, {
        method: 'PUT',
        data,
      });
    } catch (error) {
      console.error(`Failed to update quiz ${id}:`, error);
      throw new Error(`퀴즈 ${id}를 업데이트하는데 실패했습니다.`);
    }
  }

  static async deleteQuiz(id: number): Promise<{ message: string }> {
    try {
      const response = await request<{ message: string }>(`/quizzes/${id}`, {
        method: 'DELETE',
      });
      return { message: response.message };
    } catch (error) {
      console.error(`Failed to delete quiz ${id}:`, error);
      throw new Error(`퀴즈 ${id}를 삭제하는데 실패했습니다.`);
    }
  }

  static async incrementCorrectCount(id: number): Promise<Quiz> {
    try {
      return await request(`/quizzes/${id}/correct`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error(`Failed to increment correct count for quiz ${id}:`, error);
      throw new Error(`퀴즈 ${id}의 정답 횟수를 증가시키는데 실패했습니다.`);
    }
  }

  static async incrementWrongCount(id: number): Promise<Quiz> {
    try {
      return await request(`/quizzes/${id}/wrong`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error(`Failed to increment wrong count for quiz ${id}:`, error);
      throw new Error(`퀴즈 ${id}의 오답 횟수를 증가시키는데 실패했습니다.`);
    }
  }

  static async getQuizzesByIds(quizIds: number[]): Promise<Quiz[]> {
    try {
      const response = await request<Quiz[]>(`/quizzes/by-ids`, {
        method: 'POST',
        data: { quizIds },
      });
      return response;
    } catch (error) {
      console.error('Failed to get quizzes by ids:', error);
      throw new Error('ID로 퀴즈를 가져오는데 실패했습니다.');
    }
  }
  
}