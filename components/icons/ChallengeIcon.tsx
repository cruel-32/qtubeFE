import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChallengeIcon = ({ width = 24, height = 24, color = '#4f46e5' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5l7 7-7 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChallengeIcon;
