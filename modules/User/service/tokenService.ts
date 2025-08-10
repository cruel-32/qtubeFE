import { request } from '@/utils/apiClient';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'qtube_auth_accessToken';
const REFRESH_TOKEN_KEY = 'qtube_auth_refreshToken';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}
export class TokenService {
  /**
   * 액세스 토큰과 리프레시 토큰을 저장소에 저장
   */
  static async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);

      console.log('✅ 토큰이 저장소에 저장되었습니다');
    } catch (error) {
      console.error('❌ 토큰 저장 실패:', error);
      throw new Error('토큰 저장에 실패했습니다.');
    }
  }

  /**
   * 저장소에서 액세스 토큰 조회
   */
  static async getAccessToken(): Promise<string | undefined> {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      return accessToken ?? undefined;
    } catch (error) {
      console.error('❌ 액세스 토큰 조회 실패:', error);
      return undefined;
    }
  }

  /**
   * 저장소에서 리프레시 토큰 조회
   */
  static async getRefreshToken(): Promise<string | undefined> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return refreshToken ?? undefined;
    } catch (error) {
      console.error('❌ 리프레시 토큰 조회 실패:', error);
      return undefined;
    }
  }

  /**
   * 저장소에서 모든 토큰 조회
   */
  static async getStoredTokens(): Promise<StoredTokens | undefined> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return undefined;
    } catch (error) {
      console.error('❌ 저장된 토큰 조회 실패:', error);
      return undefined;
    }
  }

  /**
   * 저장소에서 모든 토큰 삭제
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);

      console.log('✅ 모든 토큰이 삭제되었습니다');
    } catch (error) {
      console.error('❌ 토큰 삭제 실패:', error);
      throw new Error('토큰 삭제에 실패했습니다.');
    }
  }

  /**
   * 리프레시 토큰만 업데이트
   */
  static async updateRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      console.log('✅ 리프레시 토큰이 업데이트되었습니다');
    } catch (error) {
      console.error('❌ 리프레시 토큰 업데이트 실패:', error);
      throw new Error('리프레시 토큰 업데이트에 실패했습니다.');
    }
  }

  /**
   * 액세스 토큰만 업데이트
   */
  static async updateAccessToken(accessToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      console.log('✅ 액세스 토큰이 업데이트되었습니다');
    } catch (error) {
      console.error('❌ 액세스 토큰 업데이트 실패:', error);
      throw new Error('액세스 토큰 업데이트에 실패했습니다.');
    }
  }

    /**
   * 리프레시 토큰으로 새 액세스 토큰 요청
   */
    static async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
      console.log('토큰 갱신 요청 시작:', refreshToken);
      
      try {
        const result = await request<TokenRefreshResponse>('/auth/refresh', {
          method: 'POST',
          data: { refreshToken }
        });
        console.log('토큰 갱신 성공');
        return result;
      } catch (error) {
        console.error('토큰 갱신 실패1:', error);
        throw error;
      }
    }
}