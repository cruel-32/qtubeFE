import { getAnalytics, logScreenView } from '@react-native-firebase/analytics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/assets/logo.svg';
import {
  AppleIcon,
  BeakerIcon,
  ChallengeIcon,
  GoogleIcon,
  RankingIcon,
} from '@/components/icons';
import { FCMService } from '@/modules/Notification/service/FCMService';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { UserDetails } from '@/modules/User/interfaces/User';
import {
  AuthService,
  GoogleSignInResult,
  AppleSignInResult,
} from '@/modules/User/service/authService';
import { TokenService } from '@/modules/User/service/tokenService';
import { useUserStore } from '@/modules/User/store/userStore';
import { request } from '@/utils/apiClient';
import { toastError, toastSuccess } from '@/utils/toast';

// 백엔드 Auth API 응답 타입 정의
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDetails;
}

const FeatureItem = ({
  icon,
  title,
  description,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: any;
}) => (
  <View style={[styles.featureItem, { backgroundColor: colors.cardSecondary }]}>
    <View
      style={[
        styles.featureIconContainer,
        { backgroundColor: `${colors.primary}1A` },
      ]}>
      {icon}
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.secondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const logScreenViewEvent = async () => {
      const analytics = getAnalytics();
      await logScreenView(analytics, {
        screen_name: 'LoginScreen',
        screen_class: 'LoginScreen',
      });
    };
    logScreenViewEvent();
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const result: GoogleSignInResult = await AuthService.signInWithGoogle();
      const authResponse = await request<AuthResponse>('/auth/google', {
        method: 'POST',
        data: { idToken: result.idToken },
      });
      await TokenService.storeTokens(
        authResponse.accessToken,
        authResponse.refreshToken
      );
      setUser(authResponse.user);
      await setupFCMAfterLogin();
      toastSuccess(
        `환영합니다, ${authResponse.user.name}님! 로그인에 성공했습니다.`
      );
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ 구글 로그인 실패:', error);
      toastError(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
        '로그인 실패'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const result: AppleSignInResult = await AuthService.signInWithApple();
      const authResponse = await request<AuthResponse>('/auth/apple', {
        method: 'POST',
        data: { 
          idToken: result.idToken,
          fullName: result.fullName 
        },
      });
      await TokenService.storeTokens(
        authResponse.accessToken,
        authResponse.refreshToken
      );
      setUser(authResponse.user);
      await setupFCMAfterLogin();
      toastSuccess(
        `환영합니다, ${authResponse.user.name}님! 로그인에 성공했습니다.`
      );
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Apple 로그인 실패:', error);
      toastError(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
        '로그인 실패'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setupFCMAfterLogin = async (): Promise<void> => {
    try {
      await FCMService.initialize();
      const fcmToken = await FCMService.getToken();
      if (fcmToken) {
        await FCMService.sendTokenToBackend(fcmToken);
        await FCMService.updateNotificationSettings(true);
      }
    } catch (error) {
      console.error('❌ FCM 설정 중 오류:', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo width={88} height={88} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              퀴즈로 즐기는 새로운 학습
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              나만의 학습 여정을 시작하세요
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon={<ChallengeIcon color={colors.primary} width={24} height={24} />}
              title="게임처럼 재미있는 학습"
              description="퀴즈를 풀며 게임하듯 즐겁게 배우세요"
              colors={colors}
            />
            <FeatureItem
              icon={<RankingIcon color={colors.primary} width={24} height={24} />}
              title="실시간 경쟁과 보상"
              description="다른 사용자들과 경쟁하며 성장하세요"
              colors={colors}
            />
            <FeatureItem
              icon={<BeakerIcon color={colors.primary} width={24} height={24} />}
              title="맞춤형 학습 경험"
              description="나만의 학습 속도와 방식으로 공부하세요"
              colors={colors}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.googleButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading}>
              <GoogleIcon width={24} height={24} />
              <Text
                style={[
                  styles.googleButtonText,
                  { color: colors.text },
                  isLoading && styles.disabledButtonText,
                ]}>
                구글로 시작하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.appleButton,
                { backgroundColor: '#000000' },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleAppleLogin}
              disabled={isLoading}>
              <AppleIcon width={24} height={24} color="#FFFFFF" />
              <Text
                style={[
                  styles.appleButtonText,
                  isLoading && styles.disabledButtonText,
                ]}>
                Apple로 시작하기
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.tertiary }]}>
              계정을 만들거나 로그인함으로써{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                서비스 약관
              </Text>
              과{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                개인정보 처리방침
              </Text>
              에 동의합니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              로그인 중...
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
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
  featuresContainer: {
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 24,
    gap: 12,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#FFFFFF',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  termsContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
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


