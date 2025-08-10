import { TimeIcon } from '@/components/icons';
import { ScienceIcon } from '@/components/icons/categories';
import { Header } from '@/components/ui/Header';
import { SubCategoryModal } from '@/components/ui/SubCategoryModal';
import { useCategoriesQuery } from '@/modules/Category/store/useCategoryQuery';
import { Quiz } from '@/modules/Quiz/interfaces/Quiz';
import { useQuizStore } from '@/modules/Quiz/store/quizStore';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useUserStore } from '@/modules/User/store/userStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const { user } = useUserStore();
  const { 
    mainUICategories,
    subCategories,
    getCategoryById,
    getUICategoryById,
    isLoading: areCategoriesLoading,
  } = useCategoriesQuery();
  const { previewQuizzes, getPreviewQuizzes } = useQuizStore();
  const router = useRouter();

  // 서브카테고리 모달 상태
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<{
    id: number;
    name: string;
  }>();

  const categories = mainUICategories;

  useEffect(() => {
    // 카테고리가 로드된 후 서브카테고리 퀴즈들을 가져옴
    if (user && !areCategoriesLoading && subCategories.length > 0) {
      const shuffled = [...subCategories].sort(() => 0.5 - Math.random());
      const selectedSubCategories = shuffled.slice(0, 5);
      const subCategoryIds = selectedSubCategories.map(cat => cat.id);
      getPreviewQuizzes(user.id, subCategoryIds);
    }
  }, [user, areCategoriesLoading, subCategories, getPreviewQuizzes]);

  const handleCategoryPress = (categoryId: string) => {
    const mainCategory = getCategoryById(parseInt(categoryId, 10));
    
    if (mainCategory && mainCategory.parentId === undefined) {
      setSelectedParentCategory({
        id: mainCategory.id,
        name: mainCategory.name
      });
      setIsSubCategoryModalVisible(true);
    }
  };

  const handleSubCategoryPress = (subCategoryId: string) => {
    console.log('Sub category selected:', subCategoryId);
    router.push(`/quiz/${subCategoryId}`);
  };

  const handleCloseModal = () => {
    setIsSubCategoryModalVisible(false);
    setSelectedParentCategory(undefined);
  };

  const handleQuizPreview = (quizId: number) => {
    console.log('Quiz preview selected:', quizId);
    const quiz = previewQuizzes.find(q => q.id === quizId);
    if (quiz) {
      router.push(`/quiz/${quiz.categoryId}?quizIds=${quizId}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: colors.text }]}>오늘의 퀴즈 도전</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>관심있는 카테고리를 선택하여 퀴즈를 시작하세요!</Text>
          </View>

          <View style={styles.categoriesSection}>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: theme === 'dark' ? category.darkBackgroundColor : category.backgroundColor }]}>
                    <category.icon width={screenWidth < 380 ? 24 : 32} height={screenWidth < 380 ? 24 : 32} />
                  </View>
                  <Text style={[styles.categoryText, { color: colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.quizPreviewSection}>
            <Text style={[styles.quizPreviewTitle, { color: colors.text }]}>오늘의 퀴즈 미리보기</Text>
            <View style={styles.quizPreviewList}>
              {previewQuizzes.map((quiz: Quiz) => {
                const uiCategory = getUICategoryById(quiz.categoryId);
                
                let IconComponent = ScienceIcon;
                let backgroundColor = colors.border;
                let categoryName = quiz.categoryName || '기타';
                
                if (uiCategory) {
                  IconComponent = uiCategory.icon;
                  backgroundColor = theme === 'dark' ? uiCategory.darkBackgroundColor : uiCategory.backgroundColor;
                  categoryName = uiCategory.name;
                }

                return (
                  <View key={quiz.id} style={[styles.quizPreviewItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.quizPreviewHeader}>
                      <View style={styles.quizPreviewCategoryContainer}>
                        <View style={[styles.quizPreviewCategoryIcon, { backgroundColor }]}>
                          {React.createElement(IconComponent as any, { width: 16, height: 16 })}
                        </View>
                        <Text style={[styles.quizPreviewCategoryText, { color: colors.primary }]}>
                          {categoryName}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.quizPreviewContent, { color: colors.secondary }]} numberOfLines={1} ellipsizeMode="tail">
                      {quiz.question}
                    </Text>
                    <View style={styles.quizPreviewFooter}>
                      <View style={styles.quizPreviewTimeContainer}>
                        <TimeIcon width={14} height={14} color={colors.secondary} />
                        <Text style={[styles.quizPreviewTime, { color: colors.secondary }]}>예상 난이도 {quiz.difficulty}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.challengeButton}
                        onPress={() => handleQuizPreview(quiz.id)}
                      >
                        <Text style={[styles.challengeButtonText, { color: colors.primary }]}>도전하기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <SubCategoryModal
        visible={isSubCategoryModalVisible}
        parentCategoryId={selectedParentCategory?.id}
        parentCategoryName={selectedParentCategory?.name || ''}
        onClose={handleCloseModal}
        onSubCategoryPress={handleSubCategoryPress}
      />
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
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: screenWidth < 380 ? 18 : 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: screenWidth < 380 ? 14 : 16,
    fontWeight: '400',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: screenWidth < 380 ? 20 : 24,
    fontFamily: 'Roboto',
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryItem: {
    width: (screenWidth - 48) / 3,
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    width: screenWidth < 380 ? 64 : 72,
    height: screenWidth < 380 ? 64 : 72,
    borderRadius: screenWidth < 380 ? 32 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: screenWidth < 380 ? 12 : 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  quizPreviewSection: {
    marginBottom: 32,
  },
  quizPreviewTitle: {
    fontSize: screenWidth < 380 ? 16 : 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  quizPreviewList: {
    gap: 12,
  },
  quizPreviewItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
  },
  quizPreviewHeader: {
    marginBottom: 8,
  },
  quizPreviewCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizPreviewCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  quizPreviewCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  quizPreviewContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  quizPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizPreviewTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizPreviewTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: 4,
    fontFamily: 'Roboto',
  },
  challengeButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  challengeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
    fontFamily: 'Roboto',
  },
});
