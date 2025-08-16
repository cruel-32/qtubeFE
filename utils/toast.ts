import Toast from 'react-native-toast-message';

export type ToastKind = 'success' | 'error' | 'info';

interface ShowToastOptions {
  title?: string;
  message?: string;
  type?: ToastKind;
  visibilityTime?: number;
  autoHide?: boolean;
}

export function showToast({ title, message, type = 'info', visibilityTime = 2500, autoHide = true }: ShowToastOptions) {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime,
    autoHide,
    text1Style: {
      fontSize: 20, // 제목 폰트 크기 1.5배 증가
    },
    text2Style: {
      fontSize: 16, // 메시지 폰트 크기 1.5배 증가
    },
  });
}

export function toastSuccess(message: string, title = '알림') {
  showToast({ type: 'success', title, message });
}

export function toastError(message: string, title = '오류') {
  showToast({ type: 'error', title, message });
}

export function toastInfo(message: string, title = '알림') {
  showToast({ type: 'info', title, message });
}
