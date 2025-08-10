import { useAnswerStore } from '../../Answer/store/answerStore';
import { Badge, BadgeConditionType } from '../interfaces/Badge';
import { BadgeService } from './BadgeService';

export const BadgeEvaluationService = {
  evaluateNewBadges: async (categoryId: number): Promise<Badge[]> => {
    try {
      const allBadges = await BadgeService.getAllBadges();
      console.log('allBadges.length', allBadges.length);
      const myBadges = await BadgeService.getMyBadges();
      console.log('myBadges', myBadges);
      const myBadgeIds = new Set(myBadges.map(b => b.badgeId));
      console.log('myBadgeIds', myBadgeIds);

      const userStats = useAnswerStore.getState().getStats(categoryId);
      console.log('userStats', userStats);

      const newBadges = allBadges.filter(badge => {
        if (myBadgeIds.has(badge.id)) {
          return false; // Already have this badge
        }

        try {
          if (!badge.condition || badge.condition.trim() === '') {
            return false;
          }

          let conditionStr = badge.condition.trim();

          // Clean up the string before parsing
          // 1. Remove comments, which are not valid in JSON
          conditionStr = conditionStr.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');

          // 2. Remove extra wrapping quotes if they exist
          if ((conditionStr.startsWith("'") && conditionStr.endsWith("'")) ||
              (conditionStr.startsWith('"') && conditionStr.endsWith('"'))) {
            conditionStr = conditionStr.substring(1, conditionStr.length - 1);
          }

          const condition: BadgeConditionType = JSON.parse(conditionStr);

          if ('logicalOperator' in condition) {
            // Composite condition
            if (condition.logicalOperator === 'AND') {
              return condition.conditions.every(c => {
                if (c.categoryId && c.categoryId !== categoryId) {
                  return true; // This condition is for a different category, so we ignore it (treat as passed for 'AND')
                }
                return checkCondition(userStats, c);
              });
            } else { // OR
              return condition.conditions.some(c => {
                if (c.categoryId && c.categoryId !== categoryId) {
                  return false; // This condition is for a different category, so we ignore it (treat as failed for 'OR')
                }
                return checkCondition(userStats, c);
              });
            }
          } else {
            // Single condition
            if (condition.categoryId && condition.categoryId !== categoryId) {
              return false; // Not for this category
            }
            return checkCondition(userStats, condition);
          }
        } catch (error) {
          console.error(`Error processing badge with id: ${badge.id}. Skipping.`, error);
          console.error('Invalid badge condition was:', badge.condition);
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