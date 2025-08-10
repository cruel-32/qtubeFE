import React from 'react';
import { SvgProps } from 'react-native-svg';
import { Platform } from 'react-native';
import SvgComponent from '@/assets/icons/sports.svg';

const SportsIcon = (props: SvgProps) => (
  <SvgComponent 
    key={Platform.OS === 'web' ? 'sports-icon-web' : 'sports-icon'} 
    {...props} 
  />
);

SportsIcon.displayName = 'SportsIcon';

export default SportsIcon;