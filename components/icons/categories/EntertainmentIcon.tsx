import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CategoryIconProps } from './types';
import EntertainmentSvg from '@/assets/icons/category/7.svg';

const EntertainmentIcon: React.FC<CategoryIconProps> = ({ 
  width = 80,
  height = 80,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <EntertainmentSvg 
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

export default EntertainmentIcon;