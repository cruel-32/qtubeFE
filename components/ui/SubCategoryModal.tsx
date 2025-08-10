import { CloseIcon } from '@/components/icons';
import { useCategoriesQuery } from '@/modules/Category/store/useCategoryQuery';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface SubCategoryModalProps {
  visible: boolean;
  parentCategoryId?: number;
  parentCategoryName: string;
  onClose: () => void;
  onSubCategoryPress: (categoryId: string) => void;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({
  visible,
  parentCategoryId,
  parentCategoryName,
  onClose,
  onSubCategoryPress,
}) => {
  const { colors, theme } = useTheme();
  const { getUISubCategoriesByParentId } = useCategoriesQuery();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 서브카테고리 가져오기
  const subCategories = parentCategoryId 
    ? getUISubCategoriesByParentId(parentCategoryId)
    : [];

  useEffect(() => {
    if (visible) {
      // 모달이 열릴 때 초기값으로 리셋
      slideAnim.setValue(screenHeight);
      opacityAnim.setValue(0);
      
      // 모달 열기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 모달 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleSubCategoryPress = (categoryId: string) => {
    onSubCategoryPress(categoryId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Dimmed Background */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: colors.card
                }
              ]}
            >
              {/* Modal Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>{parentCategoryName} 세부 카테고리</Text>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.background }]} onPress={onClose}>
                  <CloseIcon width={24} height={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Sub Categories Grid */}
              <ScrollView 
                style={styles.subCategoriesContainer}
                contentContainerStyle={styles.subCategoriesGrid}
                showsVerticalScrollIndicator={true}
                indicatorStyle="default"
                bounces={true}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                {subCategories.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.subCategoryItem,
                      index < 3 && styles.firstRowItem // 첫 번째 줄 아이템에만 추가 간격
                    ]}
                    onPress={() => handleSubCategoryPress(category.id)}
                  >
                    <View style={[styles.subCategoryIcon, { backgroundColor: theme === 'dark' ? category.darkBackgroundColor : category.backgroundColor }]}>
                      {React.createElement(category.icon as any, { width: 24, height: 24 })}
                    </View>
                    <Text style={[styles.subCategoryText, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: screenHeight * 0.85, // 화면 높이의 85%까지 확장 가능
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexShrink: 0, // 헤더는 고정 크기 유지
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Roboto',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  subCategoriesContainer: {
    paddingHorizontal: 16,
    flexGrow: 0, // 콘텐츠만큼만 높이 차지
    flexShrink: 1, // 필요시 축소 가능
  },
  subCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: 12, // 상단 패딩 더 축소
    paddingBottom: 12, // 하단 패딩 더 축소
    flexGrow: 0, // 콘텐츠 크기만큼만 차지
  },
  subCategoryItem: {
    width: (screenWidth - 32) / 3, // 3열 그리드, 좌우 패딩만 고려
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4, // 아이템 간 간격 더욱 축소
  },
  firstRowItem: {
    marginTop: 16, // 첫 번째 줄 아이템 상단 간격 더 확장
  },
  subCategoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4, // 아이콘과 텍스트 간격 더 축소
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subCategoryText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Roboto',
    lineHeight: 16, // 라인 높이 더 축소
    minHeight: 28, // 텍스트 영역 최소 높이 더 축소
  },
}); 