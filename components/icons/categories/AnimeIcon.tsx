import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryIconProps } from './types';
import AnimeSvg from '@/assets/icons/category/8.svg';

const AnimeIcon: React.FC<CategoryIconProps> = ({ 
  width = 80,
  height = 80,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <AnimeSvg 
        width={width}
        height={height}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default AnimeIcon;