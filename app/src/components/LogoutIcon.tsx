import React from 'react';
import Svg, { G, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface LogoutIconProps {
  size?: number;
  color?: string;
}

const LogoutIcon: React.FC<LogoutIconProps> = ({ size = 24, color }) => {
  const { colors } = useTheme();
  
  // Use provided color or theme error color
  const iconColor = color || colors.error || '#DC2626';

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <G>
        {/* Door frame */}
        <Polygon
          points="10.95 15.84 -0.05 15.84 -0.05 0.17 10.95 0.17 10.95 4.05 9.95 4.05 9.95 1.17 0.95 1.17 0.95 14.84 9.95 14.84 9.95 12.01 10.95 12.01 10.95 15.84"
          fill={iconColor}
        />
        
        {/* Horizontal line (door handle area) */}
        <Rect
          x="5"
          y="8"
          width="6"
          height="1"
          fill={iconColor}
        />
        
        {/* Arrow pointing right */}
        <Polygon
          points="11 5.96 15.4 8.5 11 11.04 11 5.96"
          fill={iconColor}
        />
      </G>
    </Svg>
  );
};

export default LogoutIcon;
