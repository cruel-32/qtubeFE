import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { toastError } from '@/utils/toast';
import { useThemeStore } from '@/modules/Theme/store/useThemeStore';
import { useTheme } from '@/modules/Theme/context/ThemeContext';

type ThemePreferenceType = 'light' | 'dark' | 'system';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ThemeOptionProps {
  icon: string;
  title: string;
  subtitle: string;
  value: ThemePreferenceType;
  isSelected: boolean;
  onSelect: (value: ThemePreferenceType) => void;
  disabled?: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  icon,
  title,
  subtitle,
  value,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { 
          borderColor: isSelected ? colors.primary : colors.border,
          backgroundColor: isSelected ? colors.card : colors.background
        },
        disabled && styles.themeOptionDisabled,
      ]}
      onPress={() => !disabled && onSelect(value)}
      disabled={disabled}
    >
      <View style={styles.themeIconContainer}>
        <Text style={styles.themeIcon}>{icon}</Text>
      </View>
      <View style={styles.themeContent}>
        <Text style={[styles.themeTitle, { color: colors.text }, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.themeSubtitle, { color: colors.secondary }, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>
      {isSelected && (
        <View style={[styles.checkIconContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { theme, setTheme } = useThemeStore();
  const { colors } = useTheme();
  const [isChanging, setIsChanging] = React.useState(false);

  const handleThemeChange = async (newTheme: ThemePreferenceType) => {
    setIsChanging(true);
    try {
      await setTheme(newTheme);
      setTimeout(() => {
        setIsChanging(false);
        onClose();
      }, 150);
    } catch {
      setIsChanging(false);
      toastError('테마 설정 변경에 실패했습니다.');
    }
  };

  const themeOptions = [
    {
      icon: '☀️',
      title: '라이트 모드',
      subtitle: '밝은 테마',
      value: 'light' as ThemePreferenceType,
    },
    {
      icon: '🌙',
      title: '다크 모드',
      subtitle: '어두운 테마',
      value: 'dark' as ThemePreferenceType,
    },
    {
      icon: '⚙️',
      title: '시스템 설정',
      subtitle: '시스템 테마에 따라 자동 변경',
      value: 'system' as ThemePreferenceType,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>앱 테마</Text>
            
            <View style={styles.themeOptionsContainer}>
              {themeOptions.map((option) => (
                <ThemeOption
                  key={option.value}
                  icon={option.icon}
                  title={option.title}
                  subtitle={option.subtitle}
                  value={option.value}
                  isSelected={theme === option.value}
                  onSelect={handleThemeChange}
                  disabled={isChanging}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={onClose}
                disabled={isChanging}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>닫기</Text>
              </TouchableOpacity>
            </View>

            {isChanging && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  테마 변경 중...
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  themeOptionsContainer: {
    marginBottom: 24,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  themeOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  themeOptionDisabled: {
    opacity: 0.6,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeIcon: {
    fontSize: 24,
  },
  themeContent: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  themeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  disabledText: {
    color: '#9ca3af',
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Roboto',
  },
});