import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface DeleteIconProps {
  size?: number;
  color?: string;
}

const DeleteIcon: React.FC<DeleteIconProps> = ({ size = 24, color }) => {
  const { colors } = useTheme();
  
  // Use provided color or theme error color
  const iconColor = color || colors.error || '#DC2626';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"
        fill={iconColor}
      />
    </Svg>
  );
};

export default DeleteIcon;
