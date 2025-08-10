import { TokenService } from '@/modules/User/service/tokenService';
import { useUserStore } from '@/modules/User/store/userStore';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { setLoading, getCurrentUser } = useUserStore();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setLoading(true);
      const analytics = getAnalytics();
      
      // 인증 체크 시작 이벤트
      await logEvent(analytics, 'auth_check_started', {
        timestamp: new Date().toISOString()
      });

      const refreshToken = await TokenService.getRefreshToken();
      
      if (refreshToken) {
        console.log('🔑 저장된 토큰 발견, 사용자 정보 로드 중...');
        
        try {
          // AuthStore의 getCurrentUser 액션을 통해 사용자 정보 가져오기 및 저장
          const userInfo = await getCurrentUser();
          
          // 자동 로그인 성공 이벤트
          await logEvent(analytics, 'auto_login_success', {
            platform: userInfo.platform,
            timestamp: new Date().toISOString()
          });
          
          console.log('✅ 자동 로그인 성공! 홈 화면으로 이동');
          router.replace('/(tabs)');
        } catch (error) {
          console.error('❌ 사용자 정보 로드 실패:', error);
          
          // 사용자 정보 로드 실패 이벤트
          await logEvent(analytics, 'auto_login_failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
          
          // 토큰이 유효하지 않으면 삭제하고 로그인 페이지로
          await TokenService.clearTokens();
          router.replace('/login');
        }
      } else {
        console.log('🔓 저장된 토큰 없음, 로그인 페이지로 이동');
        
        // 토큰 없음 이벤트
        await logEvent(analytics, 'no_token_found', {
          timestamp: new Date().toISOString()
        });
        
        router.replace('/login');
      }
    } catch (error) {
      console.error('❌ 인증 체크 중 오류 발생:', error);
      
      // 인증 체크 오류 이벤트
      const analytics = getAnalytics();
      await logEvent(analytics, 'auth_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 