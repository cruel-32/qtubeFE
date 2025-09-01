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

  getEquippedBadges: async (): Promise<number[]> => {
    return request<number[]>('user-badges/equipped', { method: 'GET', requireAuth: true });
  },

  updateEquippedBadges: async (badgeIds: number[]): Promise<{ equippedBadgeIds: number[] }> => {
    return request<{ equippedBadgeIds: number[] }>('user-badges/equipped', {
      method: 'PUT',
      data: { badgeIds },
      requireAuth: true,
    });
  },
};