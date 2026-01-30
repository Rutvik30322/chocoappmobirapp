import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface MoonIconProps {
  size?: number;
  color?: string;
}

const MoonIcon: React.FC<MoonIconProps> = ({ size = 24, color }) => {
  const { colors } = useTheme();
  
  // Use provided color or theme primary color
  const iconColor = color || colors.primary;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G>
        {/* Main moon shape */}
        <Path
          d="M49,36.49A15.5,15.5,0,0,1,27.51,15.05a1,1,0,0,0-1.07-1.52,20,20,0,1,0,24,24A1,1,0,0,0,49,36.49ZM31,51a18,18,0,0,1-6.39-34.83c-6.82,14.67,8.55,30,23.22,23.22A17.91,17.91,0,0,1,31,51Z"
          fill={iconColor}
        />
        
        {/* Shadow overlay */}
        <Path
          d="M47.83,39.39A18,18,0,1,1,24.61,16.17C17.79,30.85,33.16,46.21,47.83,39.39Z"
          fill={iconColor}
          opacity="0.2"
        />
        
        {/* Stars */}
        <Path
          d="M9,21a1,1,0,0,0-1-1,1,1,0,0,1,0-2,1,1,0,0,0,1-1,1,1,0,0,1,2,0,1,1,0,0,0,1,1,1,1,0,0,1,0,2,1,1,0,0,0-1,1A1,1,0,0,1,9,21Z"
          fill={iconColor}
        />
        <Path
          d="M50,17a1,1,0,0,0-1-1,1,1,0,0,1,0-2,1,1,0,0,0,1-1,1,1,0,0,1,2,0,1,1,0,0,0,1,1,1,1,0,0,1,0,2,1,1,0,0,0-1,1A1,1,0,0,1,50,17Z"
          fill={iconColor}
        />
        <Path
          d="M14,53a1,1,0,0,0-1-1,1,1,0,0,1,0-2,1,1,0,0,0,1-1,1,1,0,0,1,2,0,1,1,0,0,0,1,1,1,1,0,0,1,0,2,1,1,0,0,0-1,1A1,1,0,0,1,14,53Z"
          fill={iconColor}
        />
        <Path d="M8,39a1,1,0,0,1-2,0A1,1,0,0,1,8,39Z" fill={iconColor} />
        <Path d="M58,26a1,1,0,0,1-2,0A1,1,0,0,1,58,26Z" fill={iconColor} />
        <Path d="M9,26a1,1,0,0,1-2,0A1,1,0,0,1,9,26Z" fill={iconColor} />
        <Path d="M45,22a1,1,0,0,1-2,0A1,1,0,0,1,45,22Z" fill={iconColor} />
        <Path d="M33,58a1,1,0,0,1-2,0A1,1,0,0,1,33,58Z" fill={iconColor} />
        <Path d="M52,32a1,1,0,0,1-2,0A1,1,0,0,1,52,32Z" fill={iconColor} />
        <Path d="M33,18a1,1,0,0,1-2,0A1,1,0,0,1,33,18Z" fill={iconColor} />
        <Path d="M45,10a1,1,0,0,1-2,0A1,1,0,0,1,45,10Z" fill={iconColor} />
        <Path d="M56,43a1,1,0,0,1-2,0A1,1,0,0,1,56,43Z" fill={iconColor} />
        <Path d="M21,11a1,1,0,0,1-2,0A1,1,0,0,1,21,11Z" fill={iconColor} />
        <Path d="M48,48V47a1,1,0,0,1,2,0v1A1,1,0,0,1,48,48Z" fill={iconColor} />
        <Path d="M52,51H51a1,1,0,0,1,0-2h1A1,1,0,0,1,52,51Z" fill={iconColor} />
        <Path d="M47,51H46a1,1,0,0,1,0-2h1A1,1,0,0,1,47,51Z" fill={iconColor} />
        <Path d="M48,53V52a1,1,0,0,1,2,0v1A1,1,0,0,1,48,53Z" fill={iconColor} />
        <Path d="M34,27V26a1,1,0,0,1,2,0v1A1,1,0,0,1,34,27Z" fill={iconColor} />
        <Path d="M38,30H37a1,1,0,0,1,0-2h1A1,1,0,0,1,38,30Z" fill={iconColor} />
        <Path d="M33,30H32a1,1,0,0,1,0-2h1A1,1,0,0,1,33,30Z" fill={iconColor} />
        <Path d="M34,32V31a1,1,0,0,1,2,0v1A1,1,0,0,1,34,32Z" fill={iconColor} />
        <Path d="M31,6V5a1,1,0,0,1,2,0V6A1,1,0,0,1,31,6Z" fill={iconColor} />
        <Path d="M35,9H34a1,1,0,0,1,0-2h1A1,1,0,0,1,35,9Z" fill={iconColor} />
        <Path d="M30,9H29a1,1,0,0,1,0-2h1A1,1,0,0,1,30,9Z" fill={iconColor} />
        <Path d="M31,11V10a1,1,0,0,1,2,0v1A1,1,0,0,1,31,11Z" fill={iconColor} />
      </G>
    </Svg>
  );
};

export default MoonIcon;
