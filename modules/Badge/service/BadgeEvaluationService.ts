import { useAnswerStore } from '../../Answer/store/answerStore';
import { Badge, BadgeCondition, BadgeConditionType } from '../interfaces/Badge';
import { BadgeService } from './BadgeService';
import { CategoryService } from '../../Category/service/CategoryService';
import { Category } from '../../Category/interfaces/Category';

function getAllSubCategoryIds(categoryId: number, categories: Category[]): number[] {
    const subCategoryIds: number[] = [];
    const queue: number[] = [categoryId];
    const visited: Set<number> = new Set();

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!visited.has(currentId)) {
            visited.add(currentId);
            subCategoryIds.push(currentId);

            const children = categories.filter(c => c.parentId === currentId);
            for (const child of children) {
                if (!visited.has(child.id)) {
                    queue.push(child.id);
                }
            }
        }
    }
    return subCategoryIds;
}


export const BadgeEvaluationService = {
  evaluateNewBadges: async (_playedCategoryId: number): Promise<Badge[]> => {
    try {
      const allBadges = await BadgeService.getAllBadges();
      const myBadges = await BadgeService.getMyBadges();
      const myBadgeIds = new Set(myBadges.map(b => b.badgeId));
      const allCategories = await CategoryService.getAllCategories();

      const newBadges = allBadges.filter(badge => {
        if (myBadgeIds.has(badge.id)) {
          return false; // Already have this badge
        }

        try {
          if (!badge.condition) {
            return false;
          }

          // condition is now directly an object (jsonb from backend), no need to parse
          const condition: BadgeConditionType = badge.condition;

          const check = (cond: BadgeCondition): boolean => {
            const { categoryId } = cond;
            let statsCategoryIds: number[] = [];

            if (categoryId) {
                // Badge is for a specific category, get stats for it and all its sub-categories
                statsCategoryIds = getAllSubCategoryIds(categoryId, allCategories);
            }
            // If categoryId is not present, it's a global badge, and getStats will be called with an empty array, getting all stats.
            
            const userStats = useAnswerStore.getState().getStats(statsCategoryIds);
            return checkCondition(userStats, cond);
          };

          if ('logicalOperator' in condition) {
            if (condition.logicalOperator === 'AND') {
              return condition.conditions.every(check);
            } else { // OR
              return condition.conditions.some(check);
            }
          } else {
            return check(condition);
          }
        } catch (error) {
          console.error(`Error processing badge with id: ${badge.id}. Skipping.`, error);
          console.error('Invalid badge condition was:', JSON.stringify(badge.condition));
          return false;
        }
      });

      return newBadges;
    } catch (error) {
      console.error('Error evaluating new badges:', error);
      return [];
    }
  },
};

function checkCondition(userStats: any, condition: any): boolean {
  const { type, value, operator } = condition;
  let userValue;

  switch (type) {
    case 'CONSECUTIVE_CORRECT_ANSWERS':
      userValue = userStats.consecutiveCorrect;
      break;
    case 'TOTAL_QUIZZES_SOLVED':
      userValue = userStats.totalSolved;
      break;
    case 'TOTAL_CORRECT_ANSWERS':
      userValue = userStats.totalCorrect;
      break;
    case 'CORRECT_ANSWER_RATE':
      userValue = userStats.correctRate;
      break;
    default:
      return false;
  }

  switch (operator) {
    case 'GTE':
      return userValue >= value;
    case 'LTE':
      return userValue <= value;
    case 'EQ':
      return userValue === value;
    default:
      return false;
  }
}
