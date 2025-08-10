import { GoogleIcon, KakaoIcon, NaverIcon } from '@/components/icons';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { FCMService } from '@/modules/Notification/service/FCMService';
import { UserDetails } from '@/modules/User/interfaces/User';
import { AuthService, GoogleSignInResult } from '@/modules/User/service/authService';
import { TokenService } from '@/modules/User/service/tokenService';
import { useUserStore } from '@/modules/User/store/userStore';
import { request } from '@/utils/apiClient';
import { getAnalytics, logEvent, logScreenView } from '@react-native-firebase/analytics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { toastError, toastInfo, toastSuccess } from '@/utils/toast';
import { SafeAreaView } from 'react-native-safe-area-context';

// 백엔드 Auth API 응답 타입 정의
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDetails;
}

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  // 화면 진입 시 이벤트 로깅
  useEffect(() => {
    const logScreenViewEvent = async () => {
      const analytics = getAnalytics();
      await logScreenView(analytics, {
        screen_name: 'LoginScreen',
        screen_class: 'LoginScreen'
      });
    };
    logScreenViewEvent();
  }, []);

  const handleKakaoLogin = async () => {
    toastInfo('카카오 로그인은 준비 중입니다. 구글아이디로 로그인 하세요');
    
    // if (isLoading) return;

    // try {
    //   setIsLoading(true);
    //   console.log('🚀 카카오 로그인 시작...');

    //   // 1. Kakao Sign-In 실행하여 accessToken 획득
    //   const result: KakaoSignInResult = await AuthService.signInWithKakao();

    //   console.log('✅ 카카오 Sign-In 성공!');
    //   console.log('📝 accessToken:', result.accessToken);
    //   console.log('👤 사용자 정보:', result.user);

    //   // 2. 백엔드 /auth/kakao API 호출하여 JWT 토큰들과 사용자 정보 받기
    //   console.log('🔐 백엔드 인증 시작...');
    //   const authResponse = await request<AuthResponse>('/auth/kakao', {
    //     method: 'POST',
    //     data: { accessToken: result.accessToken },
    //   });

    //   console.log('✅ 백엔드 인증 성공!');
    //   console.log('🔑 JWT 토큰들 수신:', {
    //     accessToken: authResponse.accessToken,
    //     refreshToken: authResponse.refreshToken,
    //   });

    //   // 3. JWT 토큰들을 안전한 저장소에 저장
    //   console.log('💾 토큰 저장 중...');
    //   await TokenService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
    //   console.log('✅ 토큰 저장 완료!');

    //   // 4. 사용자 정보를 앱 상태에 저장
    //   console.log('👤 사용자 상태 저장 중...');
    //   setUser(authResponse.user);
    //   console.log('✅ 사용자 상태 저장 완료!');

    //   // 5. FCM 초기화 및 토큰 설정
    //   console.log('🔔 FCM 설정 시작...');
    //   await setupFCMAfterLogin();

    //   // 6. 성공 메시지 표시 후 메인 화면으로 이동
    //   Alert.alert(
    //     '로그인 성공!',
    //     `환영합니다, ${authResponse.user.name}님!\n\n로그인이 완료되었습니다.`, // Corrected newline escape here
    //     [
    //       {
    //         text: '확인',
    //         onPress: () => {
    //           console.log('📱 메인 화면으로 이동...');
    //           router.replace('/(tabs)');
    //         }
    //       }
    //     ]
    //   );
    // } catch (error) {
    //   console.error('❌ 카카오 로그인 실패:', error);
    //   Alert.alert(
    //     '로그인 실패',
    //     error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    //     [{ text: '확인' }]
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleNaverLogin = async () => {
    if (isLoading) return; // 로딩 중이면 실행하지 않음
    
    try {
      setIsLoading(true);
      const analytics = getAnalytics();
      await logEvent(analytics, 'login_attempt', {
        method: 'naver',
        timestamp: new Date().toISOString()
      });
      
      // TODO: Implement Naver login
      console.log('Naver login pressed');
      
      // 임시로 2초 대기 (실제 구현 시 제거)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toastInfo('네이버 로그인은 준비 중입니다. 구글아이디로 로그인 하세요');
    } catch (error) {
      console.error('Naver login analytics error:', error);
      toastError('네이버 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return; // 로딩 중이면 실행하지 않음
    
    try {
      setIsLoading(true);
      console.log('🚀 구글 로그인 시작...');
      
      // 1. Google Sign-In 실행하여 idToken 획득
      const result: GoogleSignInResult = await AuthService.signInWithGoogle();
      
      console.log('✅ 구글 Sign-In 성공!');
      console.log('📝 idToken:', result.idToken);
      console.log('👤 사용자 정보:', result.user);
      
      // 2. 백엔드 /auth/google API 호출하여 JWT 토큰들과 사용자 정보 받기
      console.log('🔐 백엔드 인증 시작...');
      const authResponse = await request<AuthResponse>('/auth/google', {
        method: 'POST',
        data: { idToken: result.idToken },
      });
      
      console.log('✅ 백엔드 인증 성공!');
      console.log('🔑 JWT 토큰들 수신:', {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      });
      
      // 3. JWT 토큰들을 안전한 저장소에 저장
      console.log('💾 토큰 저장 중...');
      await TokenService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
      console.log('✅ 토큰 저장 완료!');
      
      // 4. 사용자 정보를 앱 상태에 저장
      console.log('👤 사용자 상태 저장 중...');
      setUser(authResponse.user);
      console.log('✅ 사용자 상태 저장 완료!');
      
      // 5. FCM 초기화 및 토큰 설정
      console.log('🔔 FCM 설정 시작...');
      await setupFCMAfterLogin();
      
      // 6. 성공 메시지 표시 후 메인 화면으로 이동
      toastSuccess(`환영합니다, ${authResponse.user.name}님! 로그인에 성공했습니다.`);
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('❌ 구글 로그인 실패:', error);
      
      toastError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.', '로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 로그인 성공 후 FCM 설정
   */
  const setupFCMAfterLogin = async (): Promise<void> => {
    try {
      // FCM 초기화 및 토큰 획득
      console.log('🔔 FCM 초기화 중...');
      await FCMService.initialize();
      const fcmToken = await FCMService.getToken();
      
      if (fcmToken) {
        console.log('✅ FCM 토큰 획득 성공:', fcmToken);
        
        // 백엔드에 FCM 토큰 전송
        try {
          console.log('📤 FCM 토큰 백엔드 전송 중...');
          await FCMService.sendTokenToBackend(fcmToken);
          console.log('✅ FCM 토큰 백엔드 전송 완료');
        } catch (tokenError) {
          console.error('❌ FCM 토큰 전송 실패:', tokenError);
          // 토큰 전송 실패는 로그인을 방해하지 않음
        }
        
        // 알림 설정 기본값(활성화) 백엔드 전송
        try {
          console.log('📤 알림 설정 기본값 전송 중...');
          await FCMService.updateNotificationSettings(true);
          console.log('✅ 알림 설정 기본값 전송 완료');
        } catch (settingsError) {
          console.error('❌ 알림 설정 전송 실패:', settingsError);
          // 설정 전송 실패는 로그인을 방해하지 않음
        }
      } else {
        console.log('⚠️ FCM 토큰 획득 실패 (권한 거부 또는 오류)');
        // FCM 토큰 획득 실패는 로그인을 방해하지 않음
      }
      
      console.log('✅ FCM 설정 완료');
    } catch (error) {
      console.error('❌ FCM 설정 중 오류:', error);
      // FCM 설정 실패는 로그인을 방해하지 않음
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>logo</Text>
        </View>

        {/* Title and Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>퀴즈로 즐기는 새로운 학습</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>나만의 학습 여정을 시작하세요</Text>
        </View>

        {/* Terms Text */}
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: colors.secondary }]}>
            계정을 만들거나 로그인함으로써{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>서비스 약관</Text>
            과{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>개인정보 처리방침</Text>
            에 동의합니다.
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          {/* Kakao Login */}
          <TouchableOpacity 
            style={[styles.kakaoButton, isLoading && styles.disabledButton]} 
            onPress={handleKakaoLogin}
            disabled={isLoading}
          >
            <KakaoIcon width={24} height={24} />
            <Text style={[styles.kakaoButtonText, isLoading && styles.disabledButtonText]}>카카오로 시작하기</Text>
          </TouchableOpacity>

          {/* Naver Login */}
          <TouchableOpacity 
            style={[styles.naverButton, isLoading && styles.disabledButton]}
            onPress={handleNaverLogin}
            disabled={isLoading}
          >
            <NaverIcon width={24} height={24} />
            <Text style={[styles.naverButtonText, isLoading && styles.disabledButtonText]}>네이버로 시작하기</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity 
            style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }, isLoading && styles.disabledButton]} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon width={24} height={24} />
            <Text style={[styles.googleButtonText, { color: colors.text }, isLoading && styles.disabledButtonText]}>구글로 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>로그인 중...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  termsContainer: {
    marginBottom: 32,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
  },
  buttonContainer: {
    gap: 16,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    height: 48,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c1e1e',
  },
  naverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#03c75a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    height: 48,
  },
  naverButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    height: 48,
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Loading 관련 스타일
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
