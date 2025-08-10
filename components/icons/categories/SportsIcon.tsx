import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryIconProps } from './types';
import SportsSvg from '@/assets/icons/category/9.svg';

const SportsIcon: React.FC<CategoryIconProps> = ({ 
  width = 80,
  height = 80,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <SportsSvg 
        width={width}
        height={height}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SportsIcon;