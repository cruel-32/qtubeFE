import { request } from '@/utils/apiClient';
import { CreateReportRequest, UpdateReportRequest, ReportQuery, Report } from '@/modules/Report/interfaces/Report';

// BE API 응답 타입 정의
interface GetAllReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ReportService {
  static async createReport(data: CreateReportRequest): Promise<Report> {
    try {
      return await request('/reports', {
        method: 'POST',
        data,
      });
    } catch (error) {
      console.error('Failed to create report:', error);
      throw new Error('신고 생성에 실패했습니다.');
    }
  }

  static async getAllReports(query?: ReportQuery): Promise<GetAllReportsResponse> {
    try {
      const queryString = query ? `?${new URLSearchParams(query as any).toString()}` : '';
      return await request<GetAllReportsResponse>(`/reports${queryString}`);
    } catch (error) {
      console.error('Failed to get all reports:', error);
      throw new Error('신고 목록 조회에 실패했습니다.');
    }
  }

  static async getReportById(id: number): Promise<Report> {
    try {
      return await request(`/reports/${id}`);
    } catch (error) {
      console.error(`Failed to get report by ID ${id}:`, error);
      throw new Error(`ID ${id}의 신고 조회에 실패했습니다.`);
    }
  }

  static async updateReport(id: number, data: UpdateReportRequest): Promise<Report> {
    try {
      return await request(`/reports/${id}`, {
        method: 'PUT',
        data,
      });
    } catch (error) {
      console.error(`Failed to update report ${id}:`, error);
      throw new Error(`신고 ${id} 수정에 실패했습니다.`);
    }
  }

  static async deleteReport(id: number): Promise<{ message: string }> {
    try {
      const response = await request<{ message: string }>(`/reports/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete report ${id}:`, error);
      throw new Error(`신고 ${id} 삭제에 실패했습니다.`);
    }
  }

  static async getReportsByUserId(userId: string, query?: Omit<ReportQuery, 'userId'>): Promise<GetAllReportsResponse> {
    try {
      const queryParams = query ? { ...query, userId } : { userId };
      const queryString = `?${new URLSearchParams(queryParams as any).toString()}`;
      return await request<GetAllReportsResponse>(`/reports${queryString}`);
    } catch (error) {
      console.error(`Failed to get reports by user ID ${userId}:`, error);
      throw new Error(`사용자 ${userId}의 신고 조회에 실패했습니다.`);
    }
  }

  static async getReportsByQuizId(quizId: number, query?: Omit<ReportQuery, 'quizId'>): Promise<GetAllReportsResponse> {
    try {
      const queryParams = query ? { ...query, quizId: quizId.toString() } : { quizId: quizId.toString() };
      const queryString = `?${new URLSearchParams(queryParams as any).toString()}`;
      return await request<GetAllReportsResponse>(`/reports${queryString}`);
    } catch (error) {
      console.error(`Failed to get reports by quiz ID ${quizId}:`, error);
      throw new Error(`퀴즈 ${quizId}의 신고 조회에 실패했습니다.`);
    }
  }
}