import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ExpandIconProps {
  color?: string;
  size?: number;
}

const ExpandIcon: React.FC<ExpandIconProps> = ({ color = 'currentColor', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 9L12 16L5 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default ExpandIcon;
