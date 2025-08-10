export const KAKAO_CONFIG = {
  // 카카오 개발자 콘솔에서 발급받은 네이티브 앱 키 (환경변수 사용)
  APP_KEY: process.env.EXPO_PUBLIC_KAKAO_APP_KEY || 'fcfa6ed9fbddfa9109a50007303d2764',
  
  // 카카오 로그인 리다이렉트 URI (선택사항)
  REDIRECT_URI: 'kakaolink://oauth',
};

// 환경변수에서 값을 가져오는 설정 (권장)
export const getKakaoAppKey = () => {
  // 환경변수를 우선적으로 사용하고, 없으면 기본값 사용
  return process.env.EXPO_PUBLIC_KAKAO_APP_KEY || KAKAO_CONFIG.APP_KEY;
};