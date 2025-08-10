import { z } from 'zod';

export interface Report {
  id: number;
  title: string;
  contents: string;
  category?: string;
  isPrivate: boolean;
  userId: string;
  quizId: number;
  parentId?: number;
  stateId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ReportSchema = z.object({
  id: z.number(),
  title: z.string(),
  contents: z.string(),
  category: z.enum(['정답 오류', '부적절한 내용', '기타']),
  isPrivate: z.boolean(),
  userId: z.string(),
  quizId: z.number(),
  parentId: z.number().optional(),
  stateId: z.number(),
});

export const CreateReportSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  contents: z.string().min(1, '내용은 필수입니다'),
  category: z.enum(['정답 오류', '부적절한 내용', '기타']),
  isPrivate: z.boolean().default(false),
  userId: z.string().min(1, '사용자 ID는 필수입니다'),
  quizId: z.number().min(1, '퀴즈 ID는 필수입니다'),
  parentId: z.number().optional(),
});

export const UpdateReportSchema = CreateReportSchema.partial();

export const ReportParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)),
});

export const ReportQuerySchema = z.object({
  page: z.string().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().default('10').transform(val => parseInt(val, 10)),
  userId: z.string().optional(),
  quizId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

export type ReportType = z.infer<typeof ReportSchema>;
export type CreateReportRequest = z.infer<typeof CreateReportSchema>;
export type UpdateReportRequest = z.infer<typeof UpdateReportSchema>;
export type ReportParams = z.infer<typeof ReportParamsSchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
