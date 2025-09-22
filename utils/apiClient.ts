import { AuthService } from '@/modules/User/service/authService';
import { TokenService } from '@/modules/User/service/tokenService';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// 플랫폼별 API 주소 설정 (상용 API 우선)
const API_BASE_URL = process.env.EXPO_PUBLIC_PROD_API_URL || Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_API_URL_IOS : process.env.EXPO_PUBLIC_API_URL_ANDROID  ;

console.log(`🌐 API Base URL (${Platform.OS}):`, API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// BE 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

// 토큰 갱신 중인지 추적하는 변수
let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// 요청 인터셉터: 액세스 토큰을 헤더에 추가 (guide.md 워크플로 3.2번)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 인증이 필요 없는 경로 목록
    const publicPaths = ['/auth/google', '/auth/refresh', '/auth/test-login'];

    // 현재 요청 경로가 인증이 필요 없는 경로인지 확인
    if (config.url && publicPaths.includes(config.url)) {
      console.log(`인증이 필요 없는 경로: ${config.method?.toUpperCase()} ${config.url}`);
      return config; // 토큰 추가 없이 바로 반환
    }

    const accessToken = await TokenService.getAccessToken();
    
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
      // console.log(`API 요청에 토큰 추가: ${config.method?.toUpperCase()} ${config.url} - 토큰: ${accessToken}`);
    } else {
      console.log(`API 요청 토큰 없음: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 시 토큰 갱신 시도 (guide.md 워크플로 3.5번)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 인증이 필요 없는 경로 목록 (요청 인터셉터와 동일)
    const publicPaths = ['/auth/google', '/auth/refresh', '/auth/test-login'];
    
    // 401 Unauthorized이고 아직 재시도하지 않았다면 (단, public 경로와 /auth/refresh 요청은 제외)
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url !== '/auth/refresh' &&
        !publicPaths.includes(originalRequest.url || '')) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가하고 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await TokenService.getRefreshToken();
        
        if (!refreshToken) {
          // 리프레시 토큰이 없으면 즉시 로그아웃 처리 및 로그인 화면으로 이동
          console.log('리프레시 토큰 없음, 강제 로그아웃 실행');
          processQueue(new Error('로그인이 필요합니다.'), undefined);
          await AuthService.forceSignOut();
          return Promise.reject(new Error('로그인이 필요합니다.'));
        }

        // 토큰 갱신 시도
        const refreshResponse = await TokenService.refreshToken(refreshToken);
        
        // 새 토큰 저장
        await TokenService.storeTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
        
        // 대기 중인 요청들 처리
        processQueue(undefined, refreshResponse.accessToken);
        
        // 원래 요청에 새 토큰 추가하여 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 실패3:', refreshError);
        await TokenService.clearTokens();
        processQueue(refreshError, undefined);
        await AuthService.forceSignOut();
        return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);


// AxiosRequestConfig를 확장하여 requireAuth 옵션 추가
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
}

export async function request<T>(endpoint: string, options: CustomAxiosRequestConfig = {}): Promise<T> {
  const { requireAuth = false, ...axiosOptions } = options;

  try {
    if (requireAuth) {
      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        console.warn(`[Auth Required] ${endpoint} 요청은 인증 토큰이 필요하지만, 토큰이 없어 요청을 보내지 않습니다.`);
        throw new Error('로그인이 필요합니다.');
      }
    }

    const response: AxiosResponse<ApiResponse<T>> = await apiClient(endpoint, axiosOptions);
    const { success, data, error, message } = response.data;

    if (success && data) {
      return data;
    } else {
      throw new Error(error || message || 'API 요청에 실패했습니다.');
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        router.replace('/login');
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      console.error(`API Error for ${endpoint}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });
      
      const errorData = error.response?.data as ApiResponse<any>;
      const errorMessage = errorData?.error || errorData?.message || `서버 오류 (${error.response?.status})`;
      
      if (error.response) {
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        throw new Error(`요청 설정 오류: ${error.message}`);
      }
    } else {
      console.error(`An unexpected error occurred for ${endpoint}:`, error);
      if (error instanceof Error) {
        if (error.message.includes('로그인이 필요합니다') || error.message.includes('세션이 만료되었습니다')) {
          router.replace('/login');
        }
        throw error;
      } else {
        throw new Error('알 수 없는 오류가 발생했습니다.');
      }
    }
  }
}

export { apiClient };
