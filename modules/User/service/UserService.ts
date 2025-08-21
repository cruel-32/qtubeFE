import { CreateUserRequest, UserDetails } from '@/modules/User/interfaces/User';
import { Platform } from '@/types/Platform';
import { request } from '@/utils/apiClient';

export class UserService {
  static async findOrCreateUser(userData: CreateUserRequest): Promise<UserDetails> {
    try {
      const response = await request<UserDetails>('/users/find-or-create', {
        method: 'POST',
        data: userData,
      });

      return response;
    } catch (error) {
      console.error('Find or create user failed:', error);
      throw new Error('사용자 정보 처리에 실패했습니다.');
    }
  }

  static async handleFirebaseGoogleLogin(idToken: string): Promise<UserDetails> {
    try {
      const response = await request<UserDetails>('/users/google-login', {
        method: 'POST',
        data: { idToken },
      });

      return response
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error('구글 로그인에 실패했습니다.');
    }
  }


  static async getCurrentUser(): Promise<UserDetails> {
    try {
      const response = await request<UserDetails>('/users/me');
      return response;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw new Error('현재 사용자 정보 조회에 실패했습니다.');
    }
  }

  static async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<UserDetails> {
    try {
      const response = await request<UserDetails>(`/users/${id}`, {
        method: 'PUT',
        data: userData,
      });
      return response
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw new Error(`사용자 ${id}를 업데이트하는데 실패했습니다.`);
    }
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await request<{ message: string }>(`/users/${id}`, {
        method: 'DELETE',
      });
      return { message: response.message };
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw new Error(`사용자 ${id}를 삭제하는데 실패했습니다.`);
    }
  }
}