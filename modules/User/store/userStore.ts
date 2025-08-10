
import { create } from 'zustand';
import { CreateUserRequest, UserDetails } from '../interfaces/User';
import { UserService } from '../service/UserService';

// 통합된 User Store
export interface UserState {
  // 상태
  user?: UserDetails;
  isLoading: boolean;
  
  // 액션
  setUser: (user?: UserDetails) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  getCurrentUser: () => Promise<UserDetails>;
  updateUser: (id: string, userData: Partial<CreateUserRequest>) => Promise<UserDetails>;
}

export const useUserStore = create<UserState>((set, get) => ({
  // 상태 초기값
  user: undefined,
  isLoading: false,
  
  // 상태 관리 액션
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: undefined, isLoading: false }),
  
  // API 액션
  getCurrentUser: async () => {
    try {
      const userInfo = await UserService.getCurrentUser();
      set({ user: userInfo });
      return userInfo;
    } catch (error) {
      console.error('❌ 사용자 정보 로드 실패:', error);
      throw error;
    }
  },
  
  updateUser: async (id: string, userData: Partial<CreateUserRequest>) => {
    try {
      const updatedUser = await UserService.updateUser(id, userData);
      // 현재 로그인된 사용자 정보를 업데이트한 경우 상태도 업데이트
      const currentUser = get().user;
      if (currentUser && currentUser.id === id) {
        set({ user: updatedUser });
      }
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },
}));
