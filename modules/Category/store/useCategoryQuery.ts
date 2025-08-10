import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  ScienceIcon,
  HistoryIcon,
  SocietyIcon,
  EconomyIcon,
  EntertainmentIcon,
  GameIcon,
  MovieIcon,
  AnimeIcon,
  SportsIcon,
  LanguageIcon,
} from '@/components/icons/categories';
import { CategoryIconProps } from '@/components/icons/categories/types';
import {
  Physics,
  Chemistry,
  Biology,
  EarthScience,
  Astronomy,
  Medicine,
  Mathematics,
  KoreanHistory,
  WorldHistory,
  AncientHistory,
  ModernHistory,
  WarHistory,
  CulturalHistory,
  Politics,
  Law,
  Education,
  SocialSystem,
  HumanRights,
  Environment,
  Geography,
  EconomicTheory,
  Finance,
  BusinessManagement,
  InternationalTrade,
  RealEstate,
  Cryptocurrency,
  Kpop,
  Idol,
  Actor,
  Variety,
  Music,
  InternationalEntertainment,
  PcGame,
  MobileGame,
  ConsoleGame,
  Esports,
  GameHistory,
  IndieGame,
  KoreanMovie,
  Hollywood,
  AsianMovie,
  EuropeanMovie,
  GenreMovie,
  FilmFestival,
  JapaneseAnime,
  KoreanAnime,
  WesternAnime,
  AnimeMovie,
  AnimeTvSeries,
  WebtoonAdaptation,
  Soccer,
  Baseball,
  Basketball,
  Volleyball,
  Olympics,
  EsportsCategory,
  ExtremeSports,
  English,
  Japanese,
  Chinese,
  French,
  German,
  Spanish,
  OtherLanguages,
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
  // 메인 카테고리 (1-10)
  1: { icon: ScienceIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '과학' },
  2: { icon: HistoryIcon, backgroundColor: '#fefce8', darkBackgroundColor: '#422006', name: '역사' },
  3: { icon: SocietyIcon, backgroundColor: '#f0fdf4', darkBackgroundColor: '#14532d', name: '사회' },
  4: { icon: EconomyIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '경제' },
  5: { icon: EntertainmentIcon, backgroundColor: '#fdf2f8', darkBackgroundColor: '#581c87', name: '연예' },
  6: { icon: GameIcon, backgroundColor: '#faf5ff', darkBackgroundColor: '#3b0764', name: '게임' },
  7: { icon: MovieIcon, backgroundColor: '#fff1f2', darkBackgroundColor: '#7f1d1d', name: '영화' },
  8: { icon: AnimeIcon, backgroundColor: '#fefce8', darkBackgroundColor: '#422006', name: '애니' },
  9: { icon: SportsIcon, backgroundColor: '#eff6ff', darkBackgroundColor: '#1e3a8a', name: '스포츠' },
  10: { icon: LanguageIcon, backgroundColor: '#f0fdfa', darkBackgroundColor: '#0c4a6e', name: '외국어' },

  // 과학 서브카테고리 (11-17)
  11: { icon: Physics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '물리학' },
  12: { icon: Chemistry, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '화학' },
  13: { icon: Biology, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '생물학' },
  14: { icon: EarthScience, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '지구과학' },
  15: { icon: Astronomy, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '천문학' },
  16: { icon: Medicine, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '의학' },
  17: { icon: Mathematics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '수학' },

  // 역사 서브카테고리 (18-23)
  18: { icon: KoreanHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국사' },
  19: { icon: WorldHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '세계사' },
  20: { icon: AncientHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '고대사' },
  21: { icon: ModernHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '근현대사' },
  22: { icon: WarHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '전쟁사' },
  23: { icon: CulturalHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '문화사' },

  // 사회 서브카테고리 (24-30)
  24: { icon: Politics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '정치' },
  25: { icon: Law, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '법률' },
  26: { icon: Education, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '교육' },
  27: { icon: SocialSystem, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '사회제도' },
  28: { icon: HumanRights, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '인권' },
  29: { icon: Environment, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '환경' },
  30: { icon: Geography, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '지리' },

  // 경제 서브카테고리 (31-36)
  31: { icon: EconomicTheory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '경제이론' },
  32: { icon: Finance, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '금융' },
  33: {
    icon: BusinessManagement,
    backgroundColor: '#f8fafc',
    darkBackgroundColor: '#374151',
    name: '기업경영',
  },
  34: {
    icon: InternationalTrade,
    backgroundColor: '#f8fafc',
    darkBackgroundColor: '#374151',
    name: '국제무역',
  },
  35: { icon: RealEstate, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '부동산' },
  36: { icon: Cryptocurrency, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '암호화폐' },

  // 연예 서브카테고리 (37-42)
  37: { icon: Kpop, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'K-POP' },
  38: { icon: Idol, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '아이돌' },
  39: { icon: Actor, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '배우' },
  40: { icon: Variety, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '예능' },
  41: { icon: Music, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '음악' },
  42: {
    icon: InternationalEntertainment,
    backgroundColor: '#f8fafc',
    darkBackgroundColor: '#374151',
    name: '해외연예',
  },

  // 게임 서브카테고리 (43-48)
  43: { icon: PcGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'PC게임' },
  44: { icon: MobileGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '모바일게임' },
  45: { icon: ConsoleGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '콘솔게임' },
  46: { icon: Esports, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'e스포츠' },
  47: { icon: GameHistory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '게임역사' },
  48: { icon: IndieGame, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '인디게임' },

  // 영화 서브카테고리 (49-54)
  49: { icon: KoreanMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국영화' },
  50: { icon: Hollywood, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '할리우드' },
  51: { icon: AsianMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '아시아영화' },
  52: { icon: EuropeanMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '유럽영화' },
  53: { icon: GenreMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '장르별' },
  54: { icon: FilmFestival, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '영화제' },

  // 애니 서브카테고리 (55-60)
  55: { icon: JapaneseAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '일본애니' },
  56: { icon: KoreanAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '한국애니' },
  57: { icon: WesternAnime, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '서양애니' },
  58: { icon: AnimeMovie, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '극장판' },
  59: { icon: AnimeTvSeries, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'TV시리즈' },
  60: { icon: WebtoonAdaptation, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '웹툰' },

  // 스포츠 서브카테고리 (61-67)
  61: { icon: Soccer, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '축구' },
  62: { icon: Baseball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '야구' },
  63: { icon: Basketball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '농구' },
  64: { icon: Volleyball, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '배구' },
  65: { icon: Olympics, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '올림픽' },
  66: { icon: EsportsCategory, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: 'e스포츠' },
  67: { icon: ExtremeSports, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '극한스포츠' },

  // 외국어 서브카테고리 (68-74)
  68: { icon: English, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '영어' },
  69: { icon: Japanese, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '일본어' },
  70: { icon: Chinese, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '중국어' },
  71: { icon: French, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '프랑스어' },
  72: { icon: German, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '독일어' },
  73: { icon: Spanish, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '스페인어' },
  74: { icon: OtherLanguages, backgroundColor: '#f8fafc', darkBackgroundColor: '#374151', name: '기타언어' },
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
