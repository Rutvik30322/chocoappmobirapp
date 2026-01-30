import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface SunIconProps {
  size?: number;
  color?: string;
}

const SunIcon: React.FC<SunIconProps> = ({ size = 24, color }) => {
  const { colors } = useTheme();
  
  // Use provided color or theme primary color
  const iconColor = color || colors.primary;

  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <G>
        {/* Main sun circle */}
        <Path
          d="M64,45.364c-10.34,0-18.72,8.38-18.72,18.72c0,10.34,8.38,18.72,18.72,18.72
          s18.72-8.38,18.72-18.72C82.72,53.744,74.34,45.364,64,45.364z M64,49.084c-8.27,0-15,6.73-15,15h-1c0-8.82,7.18-16,16-16V49.084z"
          fill={iconColor}
        />
        
        {/* Sun rays - top */}
        <Path
          d="M68.01,41.191H59.99L64,32L68.01,41.191z"
          fill={iconColor}
        />
        
        {/* Sun rays - bottom */}
        <Path
          d="M64,96l4.01-9.191H59.99L64,96z"
          fill={iconColor}
        />
        
        {/* Sun rays - right */}
        <Path
          d="M86.809,68.01V59.99L96,64L86.809,68.01z"
          fill={iconColor}
        />
        
        {/* Sun rays - left */}
        <Path
          d="M32,64l9.191,4.01V59.99L32,64z"
          fill={iconColor}
        />
        
        {/* Sun rays - top right */}
        <Path
          d="M82.964,50.707l-5.672-5.672l9.335-3.663L82.964,50.707z"
          fill={iconColor}
        />
        
        {/* Sun rays - bottom left */}
        <Path
          d="M41.373,86.627l9.335-3.663l-5.672-5.672L41.373,86.627z"
          fill={iconColor}
        />
        
        {/* Sun rays - bottom right */}
        <Path
          d="M77.293,82.964l5.672-5.672l3.663,9.335L77.293,82.964z"
          fill={iconColor}
        />
        
        {/* Sun rays - top left */}
        <Path
          d="M41.373,41.373l3.663,9.335l5.672-5.672L41.373,41.373z"
          fill={iconColor}
        />
      </G>
    </Svg>
  );
};

export default SunIcon;
