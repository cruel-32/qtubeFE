import React from 'react';
import {
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useCategoriesQuery } from '@/modules/Category/store/useCategoryQuery';

interface CharacterInfoModalProps {
  visible: boolean;
  categoryId: string;
  onClose: () => void;
}

export const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({
  visible,
  categoryId,
  onClose,
}) => {
  const { colors } = useTheme();
  const { getCategoryById } = useCategoriesQuery();

  // Get character info based on category
  const getCharacterInfo = (categoryId: string) => {
    const id = parseInt(categoryId);
    switch (id) {
      case 1: // 과학
        return {
          name: '닥터 Q',
          fullName: '닥터 퀘스천 (Dr. Question)',
          image: require('@/assets/characters/1.png'),
          greeting: '과학의 신비로운 세계로 떠나볼까요?',
          description: '세계적인 과학자이자 연구원. 복잡한 과학 개념을 쉽고 재미있게 설명하는 것을 좋아합니다.',
          specialty: '물리학, 화학, 생물학',
          experience: '15년간 과학 교육 및 연구',
          motto: '호기심이 모든 발견의 시작입니다!'
        };
      case 2: // 역사
        return {
          name: '시간 여행자 미스 김',
          fullName: '김시간 (Kim Sigan)',
          image: require('@/assets/characters/2.png'),
          greeting: '자, 모두 타임머신에 탑승하세요!',
          description: '역사를 사랑하는 시간 여행 전문가. 과거와 현재를 연결하여 역사의 교훈을 전달합니다.',
          specialty: '한국사, 세계사, 문화사',
          experience: '12년간 역사 연구 및 교육',
          motto: '역사를 알면 미래가 보입니다.'
        };
      case 3: // 사회
        return {
          name: '냉철한 분석가 셜록',
          fullName: '셜록 애널리시스 (Sherlock Analysis)',
          image: require('@/assets/characters/3.png'),
          greeting: '데이터와 논리로 세상을 분석해보죠!',
          description: '사회 현상을 논리적으로 분석하는 전문가. 복잡한 사회 문제를 명쾌하게 해석합니다.',
          specialty: '사회학, 정치학, 경제학',
          experience: '20년간 사회 분석 및 컨설팅',
          motto: '진실은 항상 데이터 속에 있습니다.'
        };
      case 4: // 문학
        return {
          name: '문학 소믈리에 앨리스',
          fullName: '앨리스 리터러리 (Alice Literary)',
          image: require('@/assets/characters/4.png'),
          greeting: '아름다운 언어의 세계로 초대합니다!',
          description: '문학의 깊이와 아름다움을 전하는 문학 전문가. 고전부터 현대문학까지 해박한 지식을 보유합니다.',
          specialty: '한국문학, 세계문학, 시 분석',
          experience: '18년간 문학 연구 및 비평',
          motto: '좋은 문학은 영혼을 풍요롭게 합니다.'
        };
      case 5: // 예술
        return {
          name: '아방가르드 마스터 M',
          fullName: '마스터 모던 (Master Modern)',
          image: require('@/assets/characters/5.png'),
          greeting: '예술의 경계를 함께 넘어보아요!',
          description: '현대 예술과 전통 예술을 아우르는 예술 전문가. 창의적 사고와 미적 감각을 기릅니다.',
          specialty: '현대미술, 전통예술, 디자인',
          experience: '20년간 예술 창작 및 교육',
          motto: '예술은 세상을 바꾸는 힘입니다.'
        };
      case 6: // 경제
        return {
          name: '월스트리트의 여우 레이븐',
          fullName: '레이븐 이코노미 (Raven Economy)',
          image: require('@/assets/characters/6.png'),
          greeting: '시장의 흐름을 읽어봅시다!',
          description: '글로벌 경제 트렌드를 꿰뚫는 경제 전문가. 복잡한 경제 개념을 실생활과 연결하여 설명합니다.',
          specialty: '거시경제, 금융시장, 투자전략',
          experience: '22년간 금융 분석 및 투자',
          motto: '경제를 알면 미래를 준비할 수 있습니다.'
        };
      case 7: // 연예
        return {
          name: '예능 장인 프로듀서 Y',
          fullName: '와이 엔터테인먼트 (Y Entertainment)',
          image: require('@/assets/characters/7.png'),
          greeting: '오늘도 재미있는 연예계 이야기를 준비했어요!',
          description: '연예계의 모든 것을 알고 있는 엔터테인먼트 전문가. 최신 트렌드부터 숨겨진 이야기까지 전합니다.',
          specialty: 'K-POP, 드라마, 예능프로그램',
          experience: '16년간 방송 제작 및 기획',
          motto: '즐거움이 있는 곳에 사람이 모입니다.'
        };
      case 8: // 게임
        return {
          name: '게임의 신 제우스',
          fullName: '제우스 게이머 (Zeus Gamer)',
          image: require('@/assets/characters/8.png'),
          greeting: '게임은 하나의 우주입니다. 함께 탐험해봐요!',
          description: '게임 산업의 베테랑이자 프로게이머 출신. 게임의 재미와 전략을 동시에 추구합니다.',
          specialty: 'e스포츠, 게임 개발, 게임 문화',
          experience: '20년간 게임 업계 종사',
          motto: '모든 게임에는 인생의 교훈이 있습니다.'
        };
      case 9: // 영화
        return {
          name: '비평가 K',
          fullName: '김크리틱 (Kim Critic)',
          image: require('@/assets/characters/9.png'),
          greeting: '영화의 깊은 의미를 함께 찾아보겠습니다!',
          description: '영화의 예술적 가치와 사회적 메시지를 분석하는 영화 비평가. 장르를 넘나드는 해박한 지식을 보유합니다.',
          specialty: '영화 비평, 시나리오 분석, 연출론',
          experience: '14년간 영화 비평 및 연구',
          motto: '좋은 영화는 인생을 바꿉니다.'
        };
      case 10: // 애니
        return {
          name: '덕후 오빠 조이',
          fullName: '조이 오타쿠 (Joy Otaku)',
          image: require('@/assets/characters/10.png'),
          greeting: '최애 애니메이션 이야기를 들려드릴게요!',
          description: '애니메이션과 만화 문화의 전도사. 일본 애니메이션부터 웹툰까지 모든 것을 섭렵한 진정한 덕후입니다.',
          specialty: '일본 애니메이션, 웹툰, 만화 문화',
          experience: '10년간 애니메이션 업계 활동',
          motto: '덕질은 인생을 풍요롭게 합니다!'
        };
      case 11: // 스포츠
        return {
          name: '중계석의 전설 캐스터 S',
          fullName: '스포츠 캐스터 (Sports Caster)',
          image: require('@/assets/characters/11.png'),
          greeting: '스포츠의 열정을 함께 느껴보세요!',
          description: '모든 스포츠를 사랑하는 베테랑 스포츠 캐스터. 선수들의 숨겨진 이야기와 경기의 전술을 생생하게 전달합니다.',
          specialty: '축구, 야구, 농구, 올림픽',
          experience: '30년간 스포츠 중계 및 해설',
          motto: '스포츠는 인생의 축소판입니다.'
        };
      case 12: // 외국어
        return {
          name: '언어 마법사 리오',
          fullName: '리오 폴리글롯 (Rio Polyglot)',
          image: require('@/assets/characters/12.png'),
          greeting: '언어는 마법과 같아요. 새로운 세상을 열어드릴게요!',
          description: '10개국어를 구사하는 언어 천재. 각 언어의 문화적 배경까지 함께 가르치는 언어 교육 전문가입니다.',
          specialty: '영어, 중국어, 일본어, 스페인어',
          experience: '15년간 언어 교육 및 번역',
          motto: '언어 하나를 배우면 세계가 하나씩 넓어집니다.'
        };
      case 13: // IT
        return {
          name: '해커톤의 전설 에이든',
          fullName: '에이든 코더 (Aiden Coder)',
          image: require('@/assets/characters/13.png'),
          greeting: '코딩의 세계로 함께 여행해보죠!',
          description: 'IT 업계의 신화적 존재. 프로그래밍부터 최신 기술 트렌드까지 모든 것을 아우르는 테크 구루입니다.',
          specialty: '프로그래밍, AI, 블록체인, 클라우드',
          experience: '20년간 소프트웨어 개발',
          motto: '코드로 세상을 바꿀 수 있습니다.'
        };
      default:
        return {
          name: 'QTube 선생님',
          fullName: 'QTube 마스터 (QTube Master)',
          image: require('@/assets/characters/1.png'),
          greeting: '즐거운 퀴즈 시간입니다!',
          description: 'QTube의 모든 분야를 아우르는 퀴즈 전문가. 학습자들이 즐겁게 공부할 수 있도록 도와줍니다.',
          specialty: '종합 교육, 퀴즈 기획',
          experience: '교육 서비스 전반',
          motto: '배움은 즐거운 여행입니다!'
        };
    }
  };

  // Get main category ID for character info
  const getMainCategoryId = (subCategoryId: string): string => {
    const subCategory = getCategoryById(parseInt(subCategoryId));
    if (subCategory?.parentId) {
      return subCategory.parentId.toString();
    }
    // If it's already a main category or not found, return as is
    return subCategoryId;
  };

  const character = getCharacterInfo(getMainCategoryId(categoryId));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.characterModalOverlay}>
        <View style={[styles.characterModalContainer, { backgroundColor: colors.card }]}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.characterModalCloseButton}
            onPress={onClose}
          >
            <Text style={[styles.characterModalCloseText, { color: colors.secondary }]}>✕</Text>
          </TouchableOpacity>

          {/* Character Image */}
          <ImageBackground 
            source={character.image}
            style={styles.characterModalImageContainer}
            resizeMode="cover"
            imageStyle={styles.characterModalImageStyle}
          >
            {/* 그라데이션 오버레이 (선택사항) */}
            <View style={styles.characterModalImageOverlay} />
          </ImageBackground>

          {/* Character Info */}
          <ScrollView 
            style={styles.characterModalContent} 
            contentContainerStyle={styles.characterModalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.characterModalName, { color: colors.text }]}>
              {character.name}
            </Text>
            <Text style={[styles.characterModalFullName, { color: colors.secondary }]}>
              {character.fullName}
            </Text>
            
            <Text style={[styles.characterModalGreeting, { color: colors.primary }]}>
              &ldquo;{character.greeting}&rdquo;
            </Text>

            <View style={styles.characterModalSection}>
              <Text style={[styles.characterModalSectionTitle, { color: colors.text }]}>소개</Text>
              <Text style={[styles.characterModalSectionContent, { color: colors.secondary }]}>
                {character.description}
              </Text>
            </View>

            <View style={styles.characterModalSection}>
              <Text style={[styles.characterModalSectionTitle, { color: colors.text }]}>전문 분야</Text>
              <Text style={[styles.characterModalSectionContent, { color: colors.secondary }]}>
                {character.specialty}
              </Text>
            </View>

            <View style={styles.characterModalSection}>
              <Text style={[styles.characterModalSectionTitle, { color: colors.text }]}>경력</Text>
              <Text style={[styles.characterModalSectionContent, { color: colors.secondary }]}>
                {character.experience}
              </Text>
            </View>

            <View style={styles.characterModalSection}>
              <Text style={[styles.characterModalSectionTitle, { color: colors.text }]}>좌우명</Text>
              <Text style={[styles.characterModalMotto, { color: colors.primary }]}>
                &ldquo;{character.motto}&rdquo;
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  characterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterModalContainer: {
    width: '92%',
    maxWidth: 420,
    height: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  characterModalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  characterModalCloseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  characterModalImageContainer: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  characterModalImageStyle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  characterModalImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // 약간의 어두운 오버레이로 텍스트 가독성 향상
  },
  characterModalContent: {
    flex: 1,
  },
  characterModalContentContainer: {
    padding: 20,
    paddingBottom: 40, // 하단 여백 추가
  },
  characterModalName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  characterModalFullName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  characterModalGreeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4f46e5',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 28,
    paddingHorizontal: 16,
    fontFamily: 'Roboto',
  },
  characterModalSection: {
    marginBottom: 24,
  },
  characterModalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  characterModalSectionContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  characterModalMotto: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4f46e5',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: 'Roboto',
    marginBottom: 0, // 마지막 요소이므로 하단 여백 제거
  },
});
