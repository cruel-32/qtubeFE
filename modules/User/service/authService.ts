import { firebaseAuth, GOOGLE_WEB_CLIENT_ID } from '@/config/firebase';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getProfile as getKakaoProfile, KakaoProfile, login } from '@react-native-seoul/kakao-login';

export interface GoogleSignInResult {
  idToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
}

export interface KakaoSignInResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
}

export class AuthService {
  private static isInitialized = false;

  /**
   * Google Sign-In 초기화
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });

      this.isInitialized = true;
      console.log('Google Sign-In initialized successfully');
    } catch (error) {
      console.error('Google Sign-In initialization failed:', error);
      throw error;
    }
  }

  /**
   * Google Sign-In 수행
   */
  static async signInWithGoogle(): Promise<GoogleSignInResult> {
    try {
      await this.initialize();

      // Google Sign-In 수행
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log('Google Sign-In 성공:', userInfo);

      // idToken 확인
      if (!userInfo.data?.idToken) {
        throw new Error('Google Sign-In에서 ID 토큰을 받지 못했습니다.');
      }

      // Google 자격 증명 생성
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);

      // Firebase에 로그인
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = firebaseUserCredential.user;

      console.log('Firebase 로그인 성공:', firebaseUser.uid);

      // Firebase ID 토큰 획득 (중요: 이것이 백엔드에서 기대하는 토큰)
      const firebaseIdToken = await firebaseUser.getIdToken();

      console.log('Firebase ID 토큰 획득 성공');

      return {
        idToken: firebaseIdToken, // Firebase ID 토큰 사용
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || userInfo.data?.user?.name || '',
          email: firebaseUser.email || userInfo.data?.user?.email || '',
          photo: firebaseUser.photoURL || userInfo.data?.user?.photo || undefined,
        },
      };
    } catch (error) {
      console.error('Google Sign-In 실패:', error);
      throw new Error('구글 로그인에 실패했습니다.');
    }
  }

  /**
   * Kakao Sign-In 수행
   */
  static async signInWithKakao(): Promise<KakaoSignInResult> {
    try {
      console.log('Kakao Sign-In start');
      const token = await login();
      console.log('Kakao Sign-In token:', token);
      const profile: KakaoProfile = await getKakaoProfile();
      console.log('Kakao Sign-In 성profile공:', profile);

      return {
        accessToken: token.accessToken,
        user: {
          id: profile.id,
          name: profile.nickname,
          email: profile.email,
          photo: profile.profileImageUrl,
        },
      };
    } catch (error) {
      console.error('Kakao Sign-In 실패:', error);
      throw new Error('카카오 로그인에 실패했습니다.');
    }
  }

  /**
   * 완전한 로그아웃 (백엔드 API 호출 + 로컬 정리)
   */
  static async logout(): Promise<void> {
    try {
      // 동적 import로 순환 참조 방지
      const { TokenService } = await import('@/modules/User/service/tokenService');
      const { request } = await import('@/utils/apiClient');
      const { useUserStore } = await import('@/modules/User/store/userStore');

      // 1. 현재 refreshToken 가져오기
      const refreshToken = await TokenService.getRefreshToken();
      
      // 2. 백엔드 로그아웃 API 호출 (토큰이 있는 경우만)
      if (refreshToken) {
        try {
          await request('/auth/logout', {
            method: 'POST',
            data: { refreshToken },
          });
          console.log('✅ 백엔드 로그아웃 완료');
        } catch (error) {
          console.warn('⚠️ 백엔드 로그아웃 실패 (계속 진행):', error);
        }
      }

      // 3. Firebase에서 로그아웃
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
        console.log('✅ Firebase 로그아웃 완료');
      }

      // 4. Google Sign-In에서 로그아웃
      try {
        const currentGoogleUser = await GoogleSignin.getCurrentUser();
        if (currentGoogleUser) {
          await GoogleSignin.signOut();
          console.log('✅ Google Sign-In 로그아웃 완료');
        }
      } catch (error) {
        console.warn('⚠️ Google Sign-In 로그아웃 실패 (계속 진행):', error);
      }

      // 5. 로컬 토큰 삭제
      await TokenService.clearTokens();
      console.log('✅ 로컬 토큰 삭제 완료');

      // 6. FCM 토큰 정리
      try {
        const { FCMService } = await import('@/modules/Notification/service/FCMService');
        await FCMService.clearToken();
        console.log('✅ FCM 토큰 정리 완료');
      } catch (error) {
        console.warn('⚠️ FCM 토큰 정리 실패 (계속 진행):', error);
      }

      // 7. 앱 상태 초기화
      const { clearAuth } = useUserStore.getState();
      clearAuth();
      console.log('✅ 앱 상태 초기화 완료');

    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw new Error('로그아웃에 실패했습니다.');
    }
  }

  /**
   * 강제 로그아웃 (토큰 만료 시 사용)
   */
  static async forceSignOut(router?: any): Promise<void> {
    try {
      // 동적 import로 순환 참조 방지
      const { TokenService } = await import('@/modules/User/service/tokenService');
      const { useUserStore } = await import('@/modules/User/store/userStore');

      console.log('🔄 강제 로그아웃 시작...');

      // 1. Firebase에서 로그아웃
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
        console.log('✅ Firebase 강제 로그아웃 완료');
      }

      // 2. Google Sign-In에서 로그아웃
      try {
        const currentGoogleUser = await GoogleSignin.getCurrentUser();
        if (currentGoogleUser) {
          await GoogleSignin.signOut();
          console.log('✅ Google Sign-In 강제 로그아웃 완료');
        }
      } catch (error) {
        console.warn('⚠️ Google Sign-In 강제 로그아웃 실패 (계속 진행):', error);
      }

      // 3. 로컬 토큰 삭제
      await TokenService.clearTokens();
      console.log('✅ 로컬 토큰 강제 삭제 완료');

      // 4. 앱 상태 초기화
      const { clearAuth } = useUserStore.getState();
      clearAuth();
      console.log('✅ 앱 상태 강제 초기화 완료');

      // 5. 로그인 화면으로 리다이렉트
      if (router) {
        router.replace('/login');
        console.log('🔄 로그인 화면으로 리다이렉트');
      }

      console.log('✅ 강제 로그아웃 완료');
    } catch (error) {
      console.error('❌ 강제 로그아웃 실패:', error);
    }
  }

  /**
   * Google Sign-In과 Firebase Auth만 로그아웃 (내부 사용)
   */
  static async signOut(): Promise<void> {
    try {
      // Google Sign-In 로그아웃
      await GoogleSignin.signOut();
      
      // Firebase Auth 로그아웃
      await firebaseAuth.signOut();

      console.log('Sign-Out successful');
    } catch (error) {
      console.error('Sign-Out failed:', error);
      throw error;
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const user = firebaseAuth.currentUser;
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return undefined;
    }
  }

  /**
   * 로그인 상태 확인
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      const user = firebaseAuth.currentUser;
      return user !== undefined;
    } catch (error) {
      console.error('Failed to check sign-in status:', error);
      return false;
    }
  }
} 