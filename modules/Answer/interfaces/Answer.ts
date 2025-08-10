import { z } from 'zod'

export const AnswerSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string(),
  quizId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
  point: z.number().int(),
  bonusPoint: z.number().int(),
  timeTaken: z.number().int().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const SubmitAnswerSchema = z.object({
  userId: z.string(),
  quizId: z.number().int().positive('퀴즈 ID는 양수여야 합니다'),
  categoryId: z.number().int().positive('카테고리 ID는 양수여야 합니다'),
  userAnswer: z.string().min(1, '답안은 필수입니다'),
  point: z.number().int().optional(),
  bonusPoint: z.number().int().optional(),
  timeTaken: z.number().int().optional(),
})

export const UpdateAnswerSchema = z.object({
  userAnswer: z.string().min(1, '답안은 필수입니다').optional(),
  isCorrect: z.boolean().optional(),
  point: z.number().int().optional(),
  bonusPoint: z.number().int().optional(),
  timeTaken: z.number().int().optional(),
})

export const AnswerParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)),
})

export const UserIdParamsSchema = z.object({
  userId: z.string()
})

export const QuizIdParamsSchema = z.object({
  quizId: z.string().transform(val => parseInt(val, 10)),
})

export const UserQuizParamsSchema = z.object({
  userId: z.string(),
  quizId: z.string().transform(val => parseInt(val, 10)),
})

export const GetAnswersResponseSchema = z.object({
    answers: z.array(AnswerSchema),
    syncTimestamp: z.string(),
})

export type Answer = z.infer<typeof AnswerSchema>
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerSchema>
export type UpdateAnswerRequest = z.infer<typeof UpdateAnswerSchema>
export type AnswerParams = z.infer<typeof AnswerParamsSchema>
export type UserIdParams = z.infer<typeof UserIdParamsSchema>
export type QuizIdParams = z.infer<typeof QuizIdParamsSchema>
export type UserQuizParams = z.infer<typeof UserQuizParamsSchema>
export type GetAnswersResponse = z.infer<typeof GetAnswersResponseSchema>;