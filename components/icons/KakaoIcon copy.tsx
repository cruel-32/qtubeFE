import React from 'react';
import { SvgProps } from 'react-native-svg';
import KakaoIconSvg from '@/assets/icons/kakao-icon.svg';

const KakaoIcon: React.FC<SvgProps> = (props) => {
  return <KakaoIconSvg {...props} />;
};

export default KakaoIcon;