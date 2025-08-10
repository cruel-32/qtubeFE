export interface BadgeCondition {
  type:
    | 'CONSECUTIVE_CORRECT_ANSWERS'
    | 'TOTAL_QUIZZES_SOLVED'
    | 'TOTAL_CORRECT_ANSWERS'
    | 'CORRECT_ANSWER_RATE'
    | 'TOTAL_SCORE_EARNED'
    | 'ACCOUNT_AGE_DAYS';
  categoryId?: number;
  value: number;
  operator: 'GTE' | 'LTE' | 'EQ';
}

export interface CompositeBadgeCondition {
  logicalOperator: 'AND' | 'OR';
  conditions: BadgeCondition[];
}

export type BadgeConditionType = BadgeCondition | CompositeBadgeCondition;

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: string;
  condition: string; // JSON string of BadgeConditionType
  grade: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER';
  createdAt: string;
  updatedAt: string;
}

export interface UserBadge {
  id: number;
  userId: string;
  badgeId: number;
  createdAt: string;
}