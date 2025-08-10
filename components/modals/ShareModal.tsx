import { CopyIcon, FacebookIcon, KakaoIcon, TwitterIcon } from '@/components/icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { toastError, toastInfo, toastSuccess } from '@/utils/toast';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  shareUrl: string;
}

export const ShareModal = ({ visible, onClose, shareUrl }: ShareModalProps) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 모달이 나타날 때
      Animated.parallel([
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 모달이 사라질 때
      Animated.parallel([
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnimation, slideAnimation]);

  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareUrl);
      toastSuccess('클립보드에 링크가 복사되었습니다.', '링크 복사 완료');
    } catch {
      toastError('링크 복사에 실패했습니다.');
    }
  };

  const handleKakaoShare = () => {
    toastInfo('카카오톡 공유 기능을 준비 중입니다.', '카카오톡 공유');
  };

  const handleFacebookShare = () => {
    toastInfo('페이스북 공유 기능을 준비 중입니다.', '페이스북 공유');
  };

  const handleTwitterShare = () => {
    toastInfo('트위터 공유 기능을 준비 중입니다.', '트위터 공유');
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareUrl,
        url: shareUrl,
      });
    } catch {
      toastError('공유에 실패했습니다.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnimation }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>공유하기</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shareOptionsContainer}>
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <View style={[styles.shareIconContainer, styles.copyIconContainer]}>
                <CopyIcon width={20} height={20} color="#6247FF" />
              </View>
              <Text style={styles.shareOptionText}>링크 복사</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleKakaoShare}>
              <View style={[styles.shareIconContainer, styles.kakaoIconContainer]}>
                <KakaoIcon width={20} height={20} color="#000000" />
              </View>
              <Text style={styles.shareOptionText}>카카오톡</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleFacebookShare}>
              <View style={[styles.shareIconContainer, styles.facebookIconContainer]}>
                <FacebookIcon width={20} height={20} color="#ffffff" />
              </View>
              <Text style={styles.shareOptionText}>페이스북</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleTwitterShare}>
              <View style={[styles.shareIconContainer, styles.twitterIconContainer]}>
                <TwitterIcon width={20} height={20} color="#ffffff" />
              </View>
              <Text style={styles.shareOptionText}>트위터</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.shareOption} onPress={handleNativeShare}>
                <View style={styles.shareIconContainer}>
                  <Text style={styles.moreIcon}>⋯</Text>
                </View>
                <Text style={styles.shareOptionText}>더보기</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>링크</Text>
            <Text style={styles.linkText} numberOfLines={2}>{shareUrl}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Roboto',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9ca3af',
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    flex: 1,
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  copyIconContainer: {
    backgroundColor: '#e0e7ff',
    borderColor: '#c7d2fe',
  },
  kakaoIconContainer: {
    backgroundColor: '#fee500',
    borderColor: '#facc15',
  },
  facebookIconContainer: {
    backgroundColor: '#1877F2',
    borderColor: '#1d4ed8',
  },
  twitterIconContainer: {
    backgroundColor: '#1DA1F2',
    borderColor: '#0284c7',
  },
  shareOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  linkContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  linkText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Roboto',
    lineHeight: 20,
  },
});