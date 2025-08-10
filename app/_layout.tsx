import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useAnswerStore } from '@/modules/Answer/store/answerStore';
import { FCMService } from '@/modules/Notification/service/FCMService';
import { notificationService } from '@/modules/Notification/service/NotificationService';
import { useNotificationStore } from '@/modules/Notification/store/useNotificationStore';
import { AuthService } from '@/modules/User/service/authService';
import { useUserStore } from '@/modules/User/store/userStore';

import { queryClient } from '@/config/queryClient';
import { ThemeProvider, useTheme } from '@/modules/Theme/context/ThemeContext';
import {
  QueryClientProvider
} from '@tanstack/react-query';

// Firebase Analytics 디버그 모드 활성화 (개발 환경에서만)
if (__DEV__) {
  (globalThis as any).RNFBDebug = true;
  // Modular API 마이그레이션 경고 로그 끄기
  (globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
  console.log('Firebase Analytics Debug Mode enabled');
}



function ThemedRoot() {
  const { theme } = useTheme();
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/[categoryId]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const { user } = useUserStore();
  const { loadAnswersFromStorage, getAnswersByUserId } = useAnswerStore();
  const { setHasPermission, setFcmToken, setIsSubscribedToServer } = useNotificationStore();
  const [isAppReady, setIsAppReady] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 0. Firebase 초기화
        await FCMService.initialize();

        // 1. 서비스 초기화
        await AuthService.initialize();
        notificationService.setupForegroundHandler();
        FCMService.setupTokenRefreshListener();
        FCMService.setupNotificationListeners();

        // 2. 알림 권한 확인
        const permission = await notificationService.requestPermission();
        setHasPermission(permission);

        // 3. 사용자가 로그인했고, 알림 권한이 있는 경우 FCM 토큰 처리
        if (user?.id && permission) {
          const token = await FCMService.getToken();
          setFcmToken(token);
          if (token && user.pushNotificationsEnabled) {
            await FCMService.sendTokenToBackend(token);
            setIsSubscribedToServer(true);
          }
        }
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [setFcmToken, setHasPermission, setIsSubscribedToServer, user?.id, user?.pushNotificationsEnabled]);

  // 답변 데이터 동기화
  useEffect(() => {
    if (!isAppReady || !user?.id) return;
    const syncAnswerData = async () => {
      try {
        await getAnswersByUserId(user.id);
        await loadAnswersFromStorage(user.id);
      } catch (error) {
        console.error('Failed to sync answer data:', error);
      }
    };

    syncAnswerData();
  }, [isAppReady, user?.id, loadAnswersFromStorage, getAnswersByUserId]);

  if (!loaded || !isAppReady) {
    return null; // 또는 스플래시 스크린
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemedRoot />
          <Toast />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
