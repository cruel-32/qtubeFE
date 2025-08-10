import React from 'react';
import { SvgProps } from 'react-native-svg';
import SvgComponent from '@/assets/logo.svg';

const LogoIcon = (props: SvgProps) => (
  <SvgComponent {...props} />
);

export default LogoIcon;