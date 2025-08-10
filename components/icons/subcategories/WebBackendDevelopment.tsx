import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SubCategoryIconProps } from './types';
import SvgIcon from '@/assets/icons/subcategories/65.svg';

const WebBackendDevelopment: React.FC<SubCategoryIconProps> = ({ width = 80, height = 80 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <SvgIcon width={width} height={height} />
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

export default WebBackendDevelopment;