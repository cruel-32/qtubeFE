import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  AnimeIcon,
  ArtIcon,
  EconomyIcon,
  EntertainmentIcon,
  GameIcon,
  HistoryIcon,
  HumanitiesIcon,
  ITIcon,
  LanguageIcon,
  MovieIcon,
  ScienceIcon,
  SocietyIcon,
  SportsIcon,
} from '@/components/icons/categories';
import { CategoryIconProps } from '@/components/icons/categories/types';
import {
  Actor,
  FineArt,
  AncientHistory,
  AsianMovie,
  Astronomy,
  Baseball,
  Basketball,
  Biology,
  BusinessManagement,
  Chemistry,
  Chinese,
  ConsoleGame,
  EarthScience,
  EconomicTheory,
  English,
  Environment,
  Esports,
  Finance,
  GameDevelopment,
  Geography,
  Hollywood,
  HumanRights,
  Idol,
  InternationalEntertainment,
  InternationalTrade,
  Investment,
  Japanese,
  JapaneseAnime,
  InternationalMovie,
  Kpop,
  KoreanAnime,
  KoreanHistory,
  KoreanMovie,
  Law,
  Literature,
  Mathematics,
  Medicine,
  MobileGame,
  ModernHistory,
  Music,
  PcGame,
  Philosophy,
  Physics,
  Politics,
  SocialSystem,
  Soccer,
  Variety,
  Volleyball,
  WesternAnime,
  WorldHistory,
  WebFrontendDevelopment,
WebBackendDevelopment,
MobileAppDevelopment,
  Webtoon,

} from '@/components/icons/subcategories';
import { Category } from '../interfaces/Category';
import { CategoryService } from '../service/CategoryService';

// UI용 카테고리 인터페이스
export interface UICategory {
  id: string;
  name: string;
  icon: React.FC<CategoryIconProps>;
  backgroundColor: string;
  darkBackgroundColor: string;
  parentId?: number;
}

// 카테고리 ID와 아이콘, 배경색, 이름 매핑
const categoryMapping: Record<
  number,
  { icon: React.FC<CategoryIconProps>; backgroundColor: string; darkBackgroundColor: string; name: string }
> = {
  // 메인 카테고리
  1: { icon: ScienceIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '과학' },
  2: { icon: HistoryIcon, backgroundColor: '#fefce8', darkBackgroundColor: '#422006', name: '역사' },
  3: { icon: SocietyIcon, backgroundColor: '#f0fdf4', darkBackgroundColor: '#14532d', name: '사회' },
  4: { icon: HumanitiesIcon, backgroundColor: '#fefce8', darkBackgroundColor: '#422006', name: '인문' },
  5: { icon: ArtIcon, backgroundColor: '#fdf2f8', darkBackgroundColor: '#581c87', name: '예술' },
  6: { icon: EconomyIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '경제' },
  7: { icon: EntertainmentIcon, backgroundColor: '#fdf2f8', darkBackgroundColor: '#581c87', name: '연예' },
  8: { icon: GameIcon, backgroundColor: '#faf5ff', darkBackgroundColor: '#3b0764', name: '게임' },
  9: { icon: MovieIcon, backgroundColor: '#fff1f2', darkBackgroundColor: '#7f1d1d', name: '영화' },
  10: { icon: AnimeIcon, backgroundColor: '#fefce8', darkBackgroundColor: '#422006', name: '애니' },
  11: { icon: SportsIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '스포츠' },
  12: { icon: LanguageIcon, backgroundColor: '#f0fdfa', darkBackgroundColor: '#0c4a6e', name: '외국어' },
  13: { icon: ITIcon, backgroundColor: '#faf5ff', darkBackgroundColor: '#3b0764', name: 'IT' },

  // 과학 서브카테고리 (14-20)
  14: { icon: Physics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '물리학' },
  15: { icon: Chemistry, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '화학' },
  16: { icon: Biology, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '생물학' },
  17: { icon: EarthScience, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '지구과학' },
  18: { icon: Astronomy, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '천문학' },
  19: { icon: Medicine, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '의학' },
  20: { icon: Mathematics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '수학' },

  // 역사 서브카테고리 (21-24)
  21: { icon: KoreanHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국사' },
  22: { icon: WorldHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '세계사' },
  23: { icon: AncientHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '고대사' },
  24: { icon: ModernHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '근현대사' },

  // 사회 서브카테고리 (25-30)
  25: { icon: Politics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '정치' },
  26: { icon: Law, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '법률' },
  27: { icon: SocialSystem, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '사회제도' },
  28: { icon: HumanRights, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '인권' },
  29: { icon: Environment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '환경' },
  30: { icon: Geography, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '지리' },

  // 인문 서브카테고리 (31-32)
  31: { icon: Philosophy, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '철학' },
  32: { icon: Literature, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '문학' },

  // 예술 서브카테고리 (33-34)
  33: { icon: FineArt, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '미술' },
  34: { icon: Music, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '음악' },

  // 경제 서브카테고리 (35-39)
  35: { icon: EconomicTheory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '경제이론' },
  36: { icon: Finance, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '금융' },
  37: { icon: BusinessManagement, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '기업경영' },
  38: { icon: InternationalTrade, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '국제무역' },
  39: { icon: Investment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '투자' },

  // 연예 서브카테고리 (40-44)
  40: { icon: Kpop, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'K-POP' },
  41: { icon: Idol, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '아이돌' },
  42: { icon: Actor, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '배우' },
  43: { icon: Variety, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '예능' },
  44: { icon: InternationalEntertainment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '해외연예' },

  // 게임 서브카테고리 (45-48)
  45: { icon: PcGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'PC게임' },
  46: { icon: MobileGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '모바일게임' },
  47: { icon: ConsoleGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '콘솔게임' },
  48: { icon: Esports, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'e스포츠' },

  // 영화 서브카테고리 (49-52)
  49: { icon: KoreanMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국영화' },
  50: { icon: Hollywood, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '할리우드' },
  51: { icon: AsianMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '아시아영화' },
  52: { icon: InternationalMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '해외영화' },

  // 애니 서브카테고리 (53-56)
  53: { icon: JapaneseAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '일본애니' },
  54: { icon: KoreanAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국애니' },
  55: { icon: WesternAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '서양애니' },
  56: { icon: Webtoon, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '웹툰' },

  // 스포츠 서브카테고리 (57-60)
  57: { icon: Soccer, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '축구' },
  58: { icon: Baseball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '야구' },
  59: { icon: Basketball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '농구' },
  60: { icon: Volleyball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '배구' },

  // 외국어 서브카테고리 (61-63)
  61: { icon: English, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '영어' },
  62: { icon: Japanese, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '일본어' },
  63: { icon: Chinese, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '중국어' },

  // IT 서브카테고리 (64-67)
  64: { icon: WebFrontendDevelopment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '웹 프론트엔드 개발' },
  65: { icon: WebBackendDevelopment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '웹 백엔드 개발' },
  66: { icon: MobileAppDevelopment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '모바일앱 개발' },
  67: { icon: GameDevelopment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '게임개발' },
};

const mapCategoryToUI = (category: Category): UICategory => {
  const mapping = categoryMapping[category.id] || {
    icon: ScienceIcon, // 기본 아이콘
    backgroundColor: '#f3f4f6', // 기본 배경색
    darkBackgroundColor: '#374151',
    name: category.name, // 기본 이름
  };

  return {
    id: category.id.toString(),
    name: mapping.name,
    icon: mapping.icon,
    backgroundColor: mapping.backgroundColor,
    darkBackgroundColor: mapping.darkBackgroundColor,
    parentId: category.parentId,
  };
};

export const useCategoriesQuery = () => {
  const {
    data: categories = [],
    isLoading,
    error,
    ...rest
  } = useQuery<Category[]>({
    queryKey: ['categories', 'all'],
    queryFn: () => CategoryService.getAllCategories(),
    staleTime: Infinity, // 캐시를 계속 사용
    gcTime: Infinity, // 캐시를 계속 사용
  });

  const mainCategories = useMemo(
    () =>
      categories
        .filter((c) => c.parentId === undefined)
        .sort((a, b) => a.id - b.id),
    [categories],
  );

  const subCategories = useMemo(
    () =>
      categories
        .filter((c) => c.parentId !== undefined)
        .sort((a, b) => a.id - b.id),
    [categories],
  );

  const mainUICategories = useMemo(
    () => mainCategories.map(mapCategoryToUI),
    [mainCategories],
  );

  const getSubCategoriesByParentId = (parentId: number) => {
    return categories
      .filter(
        (category) => category.parentId === parentId && category.isActive,
      )
      .sort((a, b) => a.id - b.id);
  };

  const getUISubCategoriesByParentId = (parentId: number) => {
    return getSubCategoriesByParentId(parentId).map(mapCategoryToUI);
  };

  const getCategoryById = (id: number) => {
    return categories.find((c) => c.id === id);
  };

  const getUICategoryById = (id: number) => {
    const category = getCategoryById(id);
    return category ? mapCategoryToUI(category) : undefined;
  };

  return {
    // Original query results
    categories,
    isLoading,
    error,
    ...rest,

    // Derived data
    mainCategories,
    subCategories,
    mainUICategories,

    // Helper functions
    getSubCategoriesByParentId,
    getUISubCategoriesByParentId,
    getCategoryById,
    getUICategoryById,
    categoryMapping,
  };
};
