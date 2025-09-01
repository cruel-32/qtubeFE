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
    // Toast 컨테이너 크기 조정
    style: {
      height: 'auto',
      minHeight: 80,
      maxHeight: 150,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginBottom: 50,
    },
    text1Style: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 4,
      flexWrap: 'wrap',
    },
    text2Style: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      flexWrap: 'wrap',
      maxWidth: '100%',
    },
    text1NumberOfLines: 2, // 제목 최대 2줄
    text2NumberOfLines: 4, // 메시지 최대 4줄
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
