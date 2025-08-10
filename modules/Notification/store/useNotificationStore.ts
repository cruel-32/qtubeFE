import { create } from 'zustand';

interface NotificationState {
  fcmToken: string | null;
  hasPermission: boolean | null;
  isSubscribedToServer: boolean;
  isLoading: boolean;
  setFcmToken: (token: string | null) => void;
  setHasPermission: (hasPermission: boolean) => void;
  setIsSubscribedToServer: (isSubscribed: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  fcmToken: null,
  hasPermission: null,
  isSubscribedToServer: false,
  isLoading: false,
  setFcmToken: (token) => set({ fcmToken: token }),
  setHasPermission: (hasPermission) => set({ hasPermission }),
  setIsSubscribedToServer: (isSubscribed) => set({ isSubscribedToServer: isSubscribed }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
