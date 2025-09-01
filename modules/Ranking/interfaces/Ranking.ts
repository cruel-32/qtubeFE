import { z } from 'zod';
import { Badge } from '../../Badge/interfaces/Badge';

export interface RankingUser {
  id: string;
  nickName: string;
  picture: string;
  userBadges?: {
    id: number;
    badge: Badge;
    createdAt: string;
  }[];
  equippedBadgeIds?: number[];
}

export interface RankingItem {
  rank?: number;
  user: RankingUser;
  score: number;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
}

export interface DailyRankingResponse {
  rankings: RankingItem[];
}

export interface WeeklyRankingResponse {
  rankings: RankingItem[];
}

export interface MonthlyRankingResponse {
  rankings: RankingItem[];
}

export interface MyRankingResponse {
  rank?: number;
  user: RankingUser;
  score: number;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
}

export enum RankingType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum RankingScope {
  ALL = 'all',
  MY = 'my'
}

export interface RankingQueryParams {
  date?: string;
  wYear?: number;
  mYear?: number;
  week?: number;
  month?: number;
}

// Validation schemas (필요시 사용)
export const RankingUserSchema = z.object({
  id: z.string(),
  nickName: z.string(),
  picture: z.string(),
  userBadges: z.array(z.object({
    id: z.number(),
    badge: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      imageUrl: z.string(),
      type: z.string(),
      grade: z.string(),
    }),
    createdAt: z.string(),
  })).optional(),
  equippedBadgeIds: z.array(z.number()).optional(),
})

export const RankingItemSchema = z.object({
  rank: z.number().optional(),
  user: RankingUserSchema,
  score: z.number(),
  totalAttempts: z.number(),
  correctAnswers: z.number(),
  accuracy: z.number(),
})

export const MyRankingResponseSchema = z.object({
  rank: z.number().optional(),
  user: RankingUserSchema,
  score: z.number(),
  totalAttempts: z.number(),
  correctAnswers: z.number(),
  accuracy: z.number(),
})

export type CreateRankingRequest = z.infer<typeof RankingItemSchema>
export type MyRankingRequest = z.infer<typeof MyRankingResponseSchema>