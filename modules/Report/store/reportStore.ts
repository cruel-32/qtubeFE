import { create } from 'zustand';
import { CreateReportRequest, Report, ReportQuery, UpdateReportRequest } from '../interfaces/Report';
import { ReportService } from '../service/ReportService';

// Service response types
interface GetAllReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ReportState {
  reports: Report[];
  currentReport?: Report;
  userReports: Report[];
  quizReports: Report[];
  pagination?: GetAllReportsResponse['pagination'];
  loading: boolean;
  error?: string;
  
  // State setters
  setReports: (reports: Report[]) => void;
  setCurrentReport: (report?: Report) => void;
  setUserReports: (reports: Report[]) => void;
  setQuizReports: (reports: Report[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Actions (API calls)
  createReport: (data: CreateReportRequest) => Promise<Report>;
  getAllReports: (query?: ReportQuery) => Promise<void>;
  getReportById: (id: number) => Promise<void>;
  updateReport: (id: number, data: UpdateReportRequest) => Promise<Report>;
  deleteReport: (id: number) => Promise<{ message: string }>;
  getReportsByUserId: (userId: string, query?: Omit<ReportQuery, 'userId'>) => Promise<void>;
  getReportsByQuizId: (quizId: number, query?: Omit<ReportQuery, 'quizId'>) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  currentReport: undefined,
  userReports: [],
  quizReports: [],
  pagination: undefined,
  loading: false,
  error: undefined,
  
  // State setters
  setReports: (reports: Report[]) => set({ reports, loading: false, error: undefined }),
  setCurrentReport: (report?: Report) => set({ currentReport: report, loading: false, error: undefined }),
  setUserReports: (reports: Report[]) => set({ userReports: reports, loading: false, error: undefined }),
  setQuizReports: (reports: Report[]) => set({ quizReports: reports, loading: false, error: undefined }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  
  // Actions
  createReport: async (data: CreateReportRequest) => {
    try {
      set({ loading: true, error: undefined });
      const report = await ReportService.createReport(data);
      set({ loading: false });
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getAllReports: async (query?: ReportQuery) => {
    try {
      set({ loading: true, error: undefined });
      const response = await ReportService.getAllReports(query);
      set({ 
        reports: response.reports, 
        pagination: response.pagination, 
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reports';
      set({ error: errorMessage, loading: false });
    }
  },

  getReportById: async (id: number) => {
    try {
      set({ loading: true, error: undefined });
      const report = await ReportService.getReportById(id);
      set({ currentReport: report, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report';
      set({ error: errorMessage, loading: false });
    }
  },

  updateReport: async (id: number, data: UpdateReportRequest) => {
    try {
      set({ loading: true, error: undefined });
      const report = await ReportService.updateReport(id, data);
      set({ loading: false });
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteReport: async (id: number) => {
    try {
      set({ loading: true, error: undefined });
      const result = await ReportService.deleteReport(id);
      set({ loading: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete report';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getReportsByUserId: async (userId: string, query?: Omit<ReportQuery, 'userId'>) => {
    try {
      set({ loading: true, error: undefined });
      const response = await ReportService.getReportsByUserId(userId, query);
      set({ 
        userReports: response.reports, 
        pagination: response.pagination, 
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user reports';
      set({ error: errorMessage, loading: false });
    }
  },

  getReportsByQuizId: async (quizId: number, query?: Omit<ReportQuery, 'quizId'>) => {
    try {
      set({ loading: true, error: undefined });
      const response = await ReportService.getReportsByQuizId(quizId, query);
      set({ 
        quizReports: response.reports, 
        pagination: response.pagination, 
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz reports';
      set({ error: errorMessage, loading: false });
    }
  },
}));