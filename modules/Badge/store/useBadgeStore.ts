import { create } from 'zustand';
import { Badge, UserBadge } from '../interfaces/Badge';
import { BadgeService } from '../service/BadgeService';

interface BadgeState {
  myBadges: UserBadge[];
  allBadges: Badge[];
  equippedBadgeIds: number[];
  isLoading: boolean;
  fetchMyBadges: () => Promise<void>;
  fetchAllBadges: () => Promise<void>;
  fetchEquippedBadges: () => Promise<void>;
  updateEquippedBadges: (badgeIds: number[]) => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  myBadges: [],
  allBadges: [],
  equippedBadgeIds: [],
  isLoading: false,
  fetchMyBadges: async () => {
    set({ isLoading: true });
    try {
      const myBadges = await BadgeService.getMyBadges();
      set({ myBadges, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my badges:', error);
      set({ isLoading: false });
    }
  },
  fetchAllBadges: async () => {
    set({ isLoading: true });
    try {
      const allBadges = await BadgeService.getAllBadges();
      set({ allBadges, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch all badges:', error);
      set({ isLoading: false });
    }
  },
  fetchEquippedBadges: async () => {
    set({ isLoading: true });
    try {
      const equippedBadgeIds = await BadgeService.getEquippedBadges();
      set({ equippedBadgeIds, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch equipped badges:', error);
      set({ isLoading: false });
    }
  },
  updateEquippedBadges: async (badgeIds: number[]) => {
    set({ isLoading: true });
    try {
      await BadgeService.updateEquippedBadges(badgeIds);
      set({ equippedBadgeIds: badgeIds, isLoading: false });
    } catch (error) {
      console.error('Failed to update equipped badges:', error);
      set({ isLoading: false });
    }
  },
}));
