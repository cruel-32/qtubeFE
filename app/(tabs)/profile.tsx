import { BadgeSelectorModal } from '@/components/modals/BadgeSelectorModal';
import { ThemeModal } from '@/components/modals/ThemeModal';
import { Header } from '@/components/ui/Header';
import { useBadgeStore } from '@/modules/Badge/store/useBadgeStore';
import { FCMService } from '@/modules/Notification/service/FCMService';
import { notificationService } from '@/modules/Notification/service/NotificationService';
import { useNotificationStore } from '@/modules/Notification/store/useNotificationStore';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useThemeStore } from '@/modules/Theme/store/useThemeStore';
import { AuthService } from '@/modules/User/service/authService';
import { UserService } from '@/modules/User/service/UserService';
import { useUserStore } from '@/modules/User/store/userStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { toastError, toastInfo, toastSuccess } from '@/utils/toast';
import { Badge } from '@/modules/Badge/interfaces/Badge';

interface SettingItemProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  isDestructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  isDestructive = false,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={showToggle}
      activeOpacity={showToggle ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBgColor }]}>
        <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: isDestructive ? colors.destructive : colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.secondary }]}>{subtitle}</Text>
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: '#e5e7eb', true: colors.primary }}
          thumbColor="#ffffff"
        />
      ) : (
        <Text style={[styles.arrowIcon, { color: colors.secondary }]}>›</Text>
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { user, updateUser } = useUserStore();
  const { colors } = useTheme();
  const { theme: themePreference, setTheme } = useThemeStore();
  const router = useRouter();
  const { equippedBadgeIds, allBadges, setEquippedBadges, fetchMyBadges, fetchAllBadges, fetchEquippedBadges, updateEquippedBadges } = useBadgeStore();
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);

  const equippedBadges = useMemo(() => {
    if (!equippedBadgeIds || !allBadges) return [];
    return equippedBadgeIds.map(id => allBadges.find(b => b.id === id)).filter((b): b is Badge => b !== undefined);
  }, [equippedBadgeIds, allBadges]);

  const {
    isSubscribedToServer,
    isLoading,
    setIsSubscribedToServer,
    setIsLoading,
    setHasPermission,
  } = useNotificationStore();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [_fontSizeModalVisible, _setFontSizeModalVisible] = useState(false);
  const [_helpModalVisible, _setHelpModalVisible] = useState(false);
  const [_contactModalVisible, _setContactModalVisible] = useState(false);
  const [_appInfoModalVisible, _setAppInfoModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  // Profile edit state
  const [editNickName, setEditNickName] = useState(user?.nickName || '퀴즈러버');
  const [editBio, setEditBio] = useState(user?.introduction || '');

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Daily quiz notification state
  const [dailyQuizEnabled, setDailyQuizEnabled] = useState(false);
    const [dailyQuizTime, setDailyQuizTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [soundEffects, setSoundEffects] = useState(true);

  useEffect(() => {
    if (user) {
      setEditNickName(user.nickName);
      setEditBio(user.introduction || '');
      setIsSubscribedToServer(user.pushNotificationsEnabled ?? false);
    }
    notificationService.loadSettings().then(({ enabled, time }) => {
      setDailyQuizEnabled(enabled);
      setDailyQuizTime(time);
    });
  }, [user, setIsSubscribedToServer]);

  useEffect(() => {
    fetchMyBadges();
    fetchAllBadges();
    fetchEquippedBadges();
  }, [fetchMyBadges, fetchAllBadges, fetchEquippedBadges]);

  const handleSaveBadges = (selectedBadges: Badge[]) => {
    const badgeIds = selectedBadges.map(b => b.id);
    updateEquippedBadges(badgeIds);
    toastSuccess('칭호가 성공적으로 업데이트되었습니다.');
  };

  const handleDailyQuizToggle = async (value: boolean) => {
    setDailyQuizEnabled(value);
    await notificationService.saveSettings(value, dailyQuizTime);
    if (value) {
      await notificationService.scheduleDailyReminder(dailyQuizTime);
    } else {
      await notificationService.cancelAllScheduledNotifications();
    }
  };

  const handlePushNotificationToggle = async (value: boolean) => {
    const originalState = isSubscribedToServer;
    setIsSubscribedToServer(value); // Optimistic update

    try {
      if (value) {
        const permission = await notificationService.requestPermission();
        setHasPermission(permission);
        if (!permission) {
          toastError('알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.', '권한 필요');
          setIsSubscribedToServer(originalState); // Revert
          return;
        }

        const token = await FCMService.getToken();
        if (token) {
          await FCMService.sendTokenToBackend(token);
          await FCMService.updateNotificationSettings(true);
          toastSuccess('새로운 퀴즈와 이벤트 알림을 받을 수 있습니다!', '알림 활성화');
        } else {
          throw new Error('FCM 토큰을 가져오지 못했습니다.');
        }
      } else {
        await FCMService.updateNotificationSettings(false);
        toastInfo('푸시 알림이 비활성화되었습니다.', '알림 비활성화');
      }
    } catch (error) {
      console.error('FCM 알림 설정 변경 실패:', error);
      toastError('알림 설정 변경에 실패했습니다. 다시 시도해주세요.', '설정 변경 실패');
      // Revert on error
      setIsSubscribedToServer(originalState);
    }
  };

  const onTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDailyQuizTime(selectedTime);
      await notificationService.saveSettings(dailyQuizEnabled, selectedTime);
      if (dailyQuizEnabled) {
        await notificationService.scheduleDailyReminder(selectedTime);
      }
    }
  };

  

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            Alert.alert('알림', '로그아웃되었습니다.');
            router.push('/login');
          } catch (error) {
            console.error('로그아웃 실패:', error);
            toastError('로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까?\n\n계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '계속 진행', 
          style: 'destructive',
          onPress: () => setDeleteAccountModalVisible(true)
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id) return;

    if (deleteConfirmText !== '계정을 삭제합니다') {
      toastError('정확한 문구를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    
    try {
      await UserService.deleteUser(user.id);
      await AuthService.logout();
      toastSuccess('계정이 성공적으로 삭제되었습니다.');
      setDeleteAccountModalVisible(false);
      router.push('/login');
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      Alert.alert('오류', '계정 삭제 중 문제가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setDeleteConfirmText('');
    setDeleteAccountModalVisible(false);
  };

  const handleSaveProfile = async () => {
    // TODO: 프로필 저장 로직 구현
    if (!user?.id) return;
    await updateUser(user?.id, {
      nickName: editNickName,
      introduction: editBio,
    })
    setProfileModalVisible(false);
    toastSuccess('프로필이 성공적으로 업데이트되었습니다.');
  };

  const handleThemeModalClose = () => {
    setThemeModalVisible(false);
  };

  const getThemeDisplay = () => {
    if (themePreference === 'light') return '라이트 모드';
    if (themePreference === 'dark') return '다크 모드';
    return '시스템 설정';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.picture || 'https://via.placeholder.com/100' }}
                  style={[styles.avatar, { borderColor: colors.primary }]}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || '퀴즈러버'}</Text>
                <Text style={[styles.profileEmail, { color: colors.secondary }]}>{user?.email || 'quizlover@email.com'}</Text>
                <View style={styles.badgeContainer}>
                  <TouchableOpacity onPress={() => setIsBadgeModalVisible(true)} style={[styles.manageBadgeButton, { backgroundColor: colors.border }]}>
                    <Text style={[styles.manageBadgeText, { color: colors.text }]}>칭호 관리</Text>
                  </TouchableOpacity>
                  {equippedBadges.slice(0, 5).map(badge => (
                    <View key={badge.id} style={[styles.titleBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.titleText, { color: colors.primary }]}>{badge.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setProfileModalVisible(true)}
              >
                <Text style={[styles.editIcon, { color: colors.secondary }]}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>프로필 설정</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="👤"
                iconColor="#2563EB"
                iconBgColor="#EBF4FF"
                title="프로필 편집"
                subtitle="닉네임, 프로필 사진 변경"
                onPress={() => setProfileModalVisible(true)}
              />
            </View>
          </View>

          

          {/* Notification Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>알림 설정</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="🔔"
                iconColor="#16a34a"
                iconBgColor="#dcfce7"
                title="새 메시지 알림"
                subtitle={isSubscribedToServer ? "새로운 퀴즈와 이벤트 알림을 받습니다" : "푸시 알림이 비활성화됨"}
                showToggle
                toggleValue={isSubscribedToServer}
                onToggleChange={handlePushNotificationToggle}
              />
              <SettingItem
                icon="📅"
                iconColor="#8b5cf6"
                iconBgColor="#F3E8FF"
                title="일일 퀴즈 알림"
                subtitle={dailyQuizEnabled ? `매일 ${dailyQuizTime.getHours()}:${String(dailyQuizTime.getMinutes()).padStart(2, '0')}에 알림` : "설정 안함"}
                showToggle
                toggleValue={dailyQuizEnabled}
                onToggleChange={handleDailyQuizToggle}
              />
              {dailyQuizEnabled && (
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
                  <Text style={{color: colors.primary}}>시간 변경</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* App Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>앱 설정</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="🎨"
                iconColor="#6366f1"
                iconBgColor="#EEF2FF"
                title="앱 테마"
                subtitle={getThemeDisplay()}
                onPress={() => setThemeModalVisible(true)}
              />
              <SettingItem
                icon="🔤"
                iconColor="#f59e0b"
                iconBgColor="#FEF3C7"
                title="폰트 크기"
                subtitle="보통 (추후 구현 예정)"
                onPress={() => _setFontSizeModalVisible(true)}
              />
              <SettingItem
                icon="🔊"
                iconColor="#06b6d4"
                iconBgColor="#E0F7FA"
                title="효과음"
                subtitle="정답/오답 효과음 (추후 구현 예정)"
                showToggle
                toggleValue={soundEffects}
                onToggleChange={setSoundEffects}
              />
            </View>
          </View>

          {/* Account Management */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>계정 관리</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="🚪"
                iconColor="#d97706"
                iconBgColor="#FEF3C7"
                title="로그아웃"
                subtitle="현재 계정에서 로그아웃"
                onPress={handleLogout}
              />
              <SettingItem
                icon="🗑️"
                iconColor="#ef4444"
                iconBgColor="#FEE2E2"
                title="계정 삭제"
                subtitle="모든 데이터가 영구 삭제됩니다"
                onPress={handleDeleteAccount}
                isDestructive
              />
            </View>
          </View>

          {/* Customer Support */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>고객 지원</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="❓"
                iconColor="#10b981"
                iconBgColor="#ECFDF5"
                title="도움말 및 FAQ"
                subtitle="자주 묻는 질문"
                onPress={() => _setHelpModalVisible(true)}
              />
              <SettingItem
                icon="💬"
                iconColor="#ec4899"
                iconBgColor="#FDF2F8"
                title="문의하기"
                subtitle="1:1 문의 및 피드백"
                onPress={() => _setContactModalVisible(true)}
              />
              <SettingItem
                icon="ℹ️"
                iconColor="#8b5cf6"
                iconBgColor="#F3E8FF"
                title="앱 정보"
                subtitle="버전 1.2.3"
                onPress={() => _setAppInfoModalVisible(true)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Badge Selector Modal */}
      <BadgeSelectorModal
        visible={isBadgeModalVisible}
        onClose={() => setIsBadgeModalVisible(false)}
        onSave={handleSaveBadges}
        currentlyEquipped={equippedBadges}
      />

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>프로필 편집</Text>
              
              <View style={styles.modalAvatarContainer}>
                <Image
                  source={{ uri: user?.picture || 'https://via.placeholder.com/100' }}
                  style={[styles.modalAvatar, { borderColor: colors.primary }]}
                />
                {/* <TouchableOpacity style={styles.cameraButton}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </TouchableOpacity> */}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>이메일</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={user?.email}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>이름</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={user?.name}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>닉네임</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={editNickName}
                  onChangeText={setEditNickName}
                  placeholder="닉네임을 입력하세요"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>소개</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="자기소개를 입력하세요"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={resetDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>계정 삭제</Text>
              
              <View style={styles.deleteWarningContainer}>
                <Text style={styles.deleteWarningTitle}>⚠️ 경고</Text>
                <Text style={styles.deleteWarningText}>
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </Text>
                <Text style={styles.deleteDataText}>
                  삭제되는 데이터:{'\n'}
                  • 퀴즈 기록 및 점수{'\n'}
                  • 프로필 정보{'\n'}
                  • 설정 및 환경설정{'\n'}
                  • 모든 개인 데이터
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.deleteConfirmLabel, { color: colors.secondary }]}>
                  계속 진행하려면 아래에 정확히 입력하세요:
                </Text>
                <Text style={styles.deleteConfirmPhrase}>계정을 삭제합니다</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: colors.text, borderColor: colors.border },
                    deleteConfirmText === '계정을 삭제합니다' && styles.textInputValid
                  ]}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="위 문구를 정확히 입력하세요"
                  autoComplete="off"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                  onPress={resetDeleteModal}
                  disabled={isDeleting}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.deleteButton,
                    (deleteConfirmText !== '계정을 삭제합니다' || isDeleting) && styles.deleteButtonDisabled
                  ]}
                  onPress={confirmDeleteAccount}
                  disabled={deleteConfirmText !== '계정을 삭제합니다' || isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.deleteButtonText}>계정 삭제</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <ThemeModal
        visible={themeModalVisible}
        onClose={handleThemeModalClose}
      />

      {showTimePicker && (
        <DateTimePicker
          value={dailyQuizTime}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      {/* TODO: Other modals (Font Size, Help, Contact, App Info) can be added here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f9f9fc',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: 16,
  },
  
  // Profile Section
  profileSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  manageBadgeButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  manageBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  levelBadge: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
    fontFamily: 'Roboto',
  },
  titleBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  editButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 16,
    color: '#9ca3af',
  },
  
  // Section Styles
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    fontFamily: 'Roboto',
  },
  sectionContent: {
    backgroundColor: '#ffffff',
  },
  
  // Setting Item Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '300',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60, // 상하 여백 증가
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '100%', // 화면 높이를 넘지 않도록
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalScrollView: {
    borderRadius: 16,
  },
  modalContent: {
    padding: 24,
    paddingBottom: 32, // 하단 여백 증가
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Roboto',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  
  // Delete Modal Styles
  deleteWarningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  deleteWarningText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
    fontFamily: 'Roboto',
    lineHeight: 20,
  },
  deleteDataText: {
    fontSize: 13,
    color: '#7F1D1D',
    fontFamily: 'Roboto',
    lineHeight: 18,
  },
  deleteConfirmLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  deleteConfirmPhrase: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    fontFamily: 'Roboto',
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 4,
  },
  textInputValid: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  timePickerButton: {
    padding: 16,
    alignItems: 'center',
  },
}); 