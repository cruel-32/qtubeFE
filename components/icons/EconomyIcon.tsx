import React from 'react';
import { SvgProps } from 'react-native-svg';
import { Platform } from 'react-native';
import SvgComponent from '@/assets/icons/categories/economy.svg';

const EconomyIcon = (props: SvgProps) => (
  <SvgComponent 
    key={Platform.OS === 'web' ? 'economy-icon-web' : 'economy-icon'} 
    {...props} 
  />
);

EconomyIcon.displayName = 'EconomyIcon';

export default EconomyIcon;