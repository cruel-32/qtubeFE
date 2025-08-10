import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/modules/Theme/context/ThemeContext';

export default function TabBarBackground() {
  const { colors } = useTheme();
  return (
    <View 
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
