import { request } from '../../../utils/apiClient';
import { Badge, UserBadge } from '../interfaces/Badge';

export const BadgeService = {
  getAllBadges: async (): Promise<Badge[]> => {
    return request<Badge[]>('badges', { method: 'GET' });
  },

  getMyBadges: async (): Promise<UserBadge[]> => {
    return request<UserBadge[]>('user-badges/me', { method: 'GET', requireAuth: true });
  },

  awardBadge: async (badgeId: number): Promise<UserBadge> => {
    return request<UserBadge>('user-badges', {
      method: 'POST',
      data: { badgeId },
      requireAuth: true,
    });
  },
};