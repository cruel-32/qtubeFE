import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { HomeIcon, PersonalIcon, RankingIcon } from '@/components/icons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/modules/Theme/context/ThemeContext';

function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              height: 85,
              paddingTop: 12,
              paddingBottom: 28,
              backgroundColor: colors.card,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 5,
            },
            android: {
              height: 85,
              paddingTop: 12,
              paddingBottom: 28,
              backgroundColor: colors.card,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              elevation: 5,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Roboto',
            fontWeight: '400',
            marginTop: 4,
            marginBottom: Platform.OS === 'ios' ? 4 : 0,
          },
          tabBarIconStyle: {
            marginTop: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '홈',
            tabBarIcon: ({ color }) => <HomeIcon width={24} height={24} fill={color} />,
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: '랭킹',
            tabBarIcon: ({ color }) => <RankingIcon width={24} height={24} fill={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '마이페이지',
            tabBarIcon: ({ color}) => <PersonalIcon width={24} height={24} fill={color} />,
          }}
        />
      </Tabs>
  );  
}

export default TabLayout;
