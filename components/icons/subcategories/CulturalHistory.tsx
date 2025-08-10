import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryIconProps } from '../categories/types';
import CulturalHistorySvg from '@/assets/icons/subcategories/23.svg';

const CulturalHistory: React.FC<CategoryIconProps> = ({ 
  width = 80,
  height = 80,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <CulturalHistorySvg 
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

export default CulturalHistory;