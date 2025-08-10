import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryIconProps } from './types';
import SocietySvg from '@/assets/icons/category/3.svg';

const SocietyIcon: React.FC<CategoryIconProps> = ({ 
  width = 80,
  height = 80,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <SocietySvg 
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

export default SocietyIcon;