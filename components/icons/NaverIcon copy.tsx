import React from 'react';
import { SvgProps } from 'react-native-svg';
import NaverIconSvg from '@/assets/icons/naver-icon.svg';

const NaverIcon: React.FC<SvgProps> = (props) => {
  return <NaverIconSvg {...props} />;
};

export default NaverIcon;