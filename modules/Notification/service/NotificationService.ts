import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';
import { toastError, toastInfo, toastSuccess } from '@/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_QUIZ_ENABLED_KEY = 'dailyQuizEnabled';
const DAILY_QUIZ_TIME_KEY = 'dailyQuizTime';

class NotificationService {

  // 앱이 포그라운드에 있을 때 알림 처리 핸들러 설정
  setupForegroundHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: Platform.OS === 'android',
        shouldShowBanner: Platform.OS === 'ios',
        shouldShowList: Platform.OS === 'ios',
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert(
          '알림 권한 필요',
          '퀴즈 알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    } else {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          '알림 권한 필요',
          '퀴즈 알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  }

  // 일일 퀴즈 알림 스케줄링 (로컬 알림)
  async scheduleDailyReminder(time: Date): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    await this.cancelAllScheduledNotifications();

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '오늘의 퀴즈 풀 시간! 🚀',
          body: '새로운 퀴즈들이 당신을 기다리고 있어요. 지금 바로 도전해보세요!',
        },
        trigger: {
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });
      toastSuccess(`매일 ${time.getHours()}시 ${String(time.getMinutes()).padStart(2, '0')}분에 퀴즈 알림을 보내드려요.`, '알림 설정 완료');
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      toastError('알림을 설정하는 중 문제가 발생했습니다.');
    }
  }

  // 모든 스케줄된 알림 취소
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // 로컬 저장소에서 설정 불러오기
  async loadSettings(): Promise<{ enabled: boolean; time: Date }> {
    try {
      const enabled = await AsyncStorage.getItem(DAILY_QUIZ_ENABLED_KEY);
      const time = await AsyncStorage.getItem(DAILY_QUIZ_TIME_KEY);
      return {
        enabled: enabled ? JSON.parse(enabled) : false,
        time: time ? new Date(JSON.parse(time)) : new Date(),
      };
    } catch (e) {
      console.error('Failed to load notification settings.', e);
      return { enabled: false, time: new Date() };
    }
  }

  // 로컬 저장소에 설정 저장하기
  async saveSettings(enabled: boolean, time: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(DAILY_QUIZ_ENABLED_KEY, JSON.stringify(enabled));
      await AsyncStorage.setItem(DAILY_QUIZ_TIME_KEY, JSON.stringify(time));
    } catch (e) {
      console.error('Failed to save notification settings.', e);
    }
  }
}

export const notificationService = new NotificationService();