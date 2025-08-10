import { request } from '@/utils/apiClient';
import { Answer, SubmitAnswerRequest, GetAnswersResponse } from '@/modules/Answer/interfaces/Answer';
export interface SubmitAnswerResponse {
  answer: Answer;
  correctAnswer: string;
}

export class AnswerService {
  static async getAnswersByQuizIds(quizIds: number[]): Promise<Answer[]> {
    try {
      const response = await request<Answer[]>(`/answers/by-quiz-ids`, {
        method: 'POST',
        data: { quizIds },
      });
      return response;
    } catch (error) {
      console.error('Failed to get answers by quiz ids:', error);
      throw new Error('퀴즈 ID로 답변을 가져오는데 실패했습니다.');
    }
  }

  static async submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    try {
      return await request<SubmitAnswerResponse>('/answers/submit', {
        method: 'POST',
        data,
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw new Error('답변 제출에 실패했습니다.');
    }
  }

  static async getAnswersByUserId(userId: string, since?: string | null): Promise<GetAnswersResponse> {
    try {
      const params = since ? { since } : {};
      const response = await request<GetAnswersResponse>(`/answers/user/${userId}`, {
        params,
      });
      return response;
    } catch (error) {
      console.error('Failed to get answers by user ID:', error);
      throw new Error('사용자 답변을 가져오는데 실패했습니다.');
    }
  }
}
