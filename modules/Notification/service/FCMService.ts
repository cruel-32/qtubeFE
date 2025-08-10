import firebase from '@react-native-firebase/app';
import { request } from '@/utils/apiClient';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class FCMService {
  private static fcmToken: string | null = null;

  // Firebase 앱 초기화 (React Native Firebase는 자동 초기화됨)
  static async initialize(): Promise<void> {
    // React Native Firebase는 네이티브 SDK와 자동 연결되므로 수동 초기화 불필요
    if (firebase.apps.length > 0) {
      console.log('Firebase already initialized');
    } else {
      console.log('Firebase auto-initialization failed');
    }
  }

  // iOS에서 알림 권한 요청 및 APNS 토큰 대기
  static async requestPermissionAndWaitForAPNS(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      try {
        // 1. 먼저 알림 권한 요청
        const authStatus = await messaging().requestPermission();
        const enabled = 
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('알림 권한이 거부되었습니다.');
          return false;
        }

        // 2. APNS 토큰이 설정될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
      } catch (error) {
        console.error('권한 요청 중 오류:', error);
        return false;
      }
    }
    return true; // Android는 별도 처리 불필요
  }

  // FCM 토큰 획득
  static async getToken(): Promise<string | null> {
    try {
      console.log('FCM Token 획득 시작');
      
      // iOS에서는 먼저 권한 요청 및 APNS 토큰 대기
      if (Platform.OS === 'ios') {
        const hasPermission = await this.requestPermissionAndWaitForAPNS();
        if (!hasPermission) {
          console.log('알림 권한이 없어 FCM 토큰을 가져올 수 없습니다.');
          return null;
        }
      }

      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('FCM Token 획득 성공:', token);
      return token;
    } catch (error) {
      console.error('FCM 토큰 획득 실패:', error);
      return null;
    }
  }

  // 토큰 갱신 리스너 설정
  static setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM 토큰 갱신됨:', token);
      this.fcmToken = token;
      try {
        await this.sendTokenToBackend(token);
      } catch (error) {
        console.error('갱신된 FCM 토큰 전송 실패:', error);
      }
    });
  }

  // FCM 토큰을 백엔드에 전송
  static async sendTokenToBackend(token: string): Promise<void> {
    try {
      await request('/users/me/fcm-token', {
        method: 'PUT',
        data: { fcmToken: token },
        requireAuth: true,
      });
      console.log('FCM 토큰 백엔드 전송 성공');
    } catch (error) {
      console.error('FCM 토큰 백엔드 전송 실패:', error);
      throw error;
    }
  }

  // 사용자 알림 설정을 백엔드에 전송
  static async updateNotificationSettings(enabled: boolean): Promise<void> {
    try {
      await request('/users/me/notification-settings', {
        method: 'PUT',
        data: { pushNotificationsEnabled: enabled },
        requireAuth: true,
      });
      console.log('알림 설정 업데이트 성공:', enabled);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      throw error;
    }
  }

  // FCM 토큰 삭제 (로그아웃 시 사용)
  static async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.fcmToken = null;
      console.log('FCM 토큰 삭제 완료');
    } catch (error) {
      console.error('FCM 토큰 삭제 실패:', error);
    }
  }

  // 백그라운드/종료 상태 메시지 처리
  static setupNotificationListeners() {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });

    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      Notifications.presentNotificationAsync({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });
    });
  }
}
