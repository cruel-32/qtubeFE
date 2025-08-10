import { z } from 'zod'

export interface Quiz {
  id: number;
  question: string;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  correct: string;
  explanation: string;
  type: number;
  correctCount: number;
  wrongCount: number;
  categoryId: number;
  difficulty: string;
  categoryName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CreateQuizSchema = z.object({
  question: z.string().min(1, '질문은 필수입니다'),
  answer1: z.string().optional(),
  answer2: z.string().optional(),
  answer3: z.string().optional(),
  answer4: z.string().optional(),
  correct: z.string().min(1, '정답은 필수입니다'),
  explanation: z.string().min(1, '해설은 필수입니다'),
  type: z.number().int().min(0).max(1), // 0: 객관식, 1: 주관식
  categoryId: z.number().int().min(1, '카테고리는 필수입니다'),
  difficulty: z.string().min(1, '난이도는 필수입니다'),
})

export const UpdateQuizSchema = CreateQuizSchema.partial()

export const QuizParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)),
})

export const QuizQuerySchema = z.object({
  page: z.string().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().default('10').transform(val => parseInt(val, 10)),
  type: z.string().optional(),
  categoryId: z.string().transform(val => parseInt(val, 10)).optional(),
  difficulty: z.string().optional(),
})

export const CategoryParamsSchema = z.object({
  categoryId: z.string().transform(val => parseInt(val, 10)),
})

export const TypeParamsSchema = z.object({
  type: z.string().transform(val => parseInt(val, 10)),
})

export type CreateQuizRequest = z.infer<typeof CreateQuizSchema>
export type UpdateQuizRequest = z.infer<typeof UpdateQuizSchema>
export type QuizParams = z.infer<typeof QuizParamsSchema>
export type QuizQuery = z.infer<typeof QuizQuerySchema>
export type CategoryParams = z.infer<typeof CategoryParamsSchema>
export type TypeParams = z.infer<typeof TypeParamsSchema>