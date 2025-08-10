import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryIconProps } from './types';
import ITSvg from '@/assets/icons/category/13.svg';

const ITIcon: React.FC<CategoryIconProps> = ({ width = 80, height = 80 }) => {
  return (
    <View style={[styles.container, { width, height, backgroundColor: '#CCCCCC' }]}>
      <ITSvg 
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

export default ITIcon;
