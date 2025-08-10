import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getAuth } from '@react-native-firebase/auth';
import { Platform } from 'react-native';

// React Native Firebase는 네이티브 설정 파일을 자동으로 읽어옵니다
// (google-services.json, GoogleService-Info.plist)

// Firebase 인스턴스 초기화 및 내보내기
export const firebaseAuth = getAuth();
export const firebaseAnalytics = getAnalytics();

// Analytics 초기화 함수 (Modular API)
export const initializeAnalytics = async () => {
  try {
    const analytics = getAnalytics();
    await setAnalyticsCollectionEnabled(analytics, true);
    console.log('Firebase Analytics initialized (Modular API)');
  } catch (error) {
    console.error('Firebase Analytics initialization failed:', error);
  }
};

// Google Sign-In 설정 - 플랫폼별 Client ID (환경변수 사용)
// iOS: iOS Client ID (GoogleService-Info.plist와 일치)
// Android: Web Client ID (google-services.json의 client_type: 3)
export const GOOGLE_WEB_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
});

export default {
  auth: firebaseAuth,
  analytics: firebaseAnalytics,
  initializeAnalytics,
  GOOGLE_WEB_CLIENT_ID,
};