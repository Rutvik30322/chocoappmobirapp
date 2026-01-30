import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface SettingsIconProps {
  size?: number;
  focused?: boolean;
  color?: string;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({ size = 24, focused = false, color }) => {
  const { colors, theme } = useTheme();
  
  // Use provided color or theme-based color
  const mainColor = color || (focused ? colors.primary : colors.textSecondary);
  
  // Calculate theme-appropriate colors - exactly same as HomeIcon
  const getThemeColors = () => {
    if (theme === 'light') {
      // Light theme - warm browns and creams (same as HomeIcon)
      if (focused) {
        return {
          main: mainColor, // #8B4513 (dark chocolate brown)
          dark: '#5D2E0A', // Darker brown for roof
          medium: '#8B4513', // Primary brown for main structure
          light: '#D4AF37', // Gold/amber accent
          lightest: '#FFF8F0', // Cream background
          white: '#FFFFFF', // Pure white
        };
      } else {
        return {
          main: mainColor, // #6D4C41 (medium brown)
          dark: '#8E8E8F', // Gray for roof
          medium: '#A1887F', // Light brown for structure
          light: '#E6E6E7', // Light gray
          lightest: '#FDFDFD', // Off-white
          white: '#FFFFFF', // Pure white
        };
      }
    } else {
      // Dark theme - white color
      if (focused) {
        return {
          main: '#FFFFFF', // White
          dark: '#FFFFFF', // White
          medium: '#FFFFFF', // White
          light: '#FFFFFF', // White
          lightest: '#FFFFFF', // White
          white: '#FFFFFF', // White
        };
      } else {
        return {
          main: '#FFFFFF', // White
          dark: '#FFFFFF', // White
          medium: '#FFFFFF', // White
          light: '#FFFFFF', // White
          lightest: '#FFFFFF', // White
          white: '#FFFFFF', // White
        };
      }
    }
  };

  const iconColors = getThemeColors();

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G>
        {/* Background panel */}
        <Path
          d="M43,42H5a5.006,5.006,0,0,1-5-5V13A5.006,5.006,0,0,1,5,8H18v2H5a3,3,0,0,0-3,3V37a3,3,0,0,0,3,3H43a3,3,0,0,0,3-3V24h2V37A5.006,5.006,0,0,1,43,42Z"
          fill={iconColors.medium}
        />
        
        {/* Bottom base */}
        <Rect
          x="14"
          y="46"
          width="20"
          height="2"
          fill={iconColors.dark}
        />
        
        {/* Left leg */}
        <Rect
          x="17"
          y="41"
          width="2"
          height="6"
          fill={iconColors.dark}
        />
        
        {/* Right leg */}
        <Rect
          x="29"
          y="41"
          width="2"
          height="6"
          fill={iconColors.dark}
        />
        
        {/* Settings gear icon */}
        <Path
          d="M37,28H31a1,1,0,0,1-1-1V24.247c-.139-.056-.277-.114-.416-.175l-1.948,1.949a1,1,0,0,1-1.414,0l-4.243-4.243a1,1,0,0,1,0-1.414l1.949-1.948c-.061-.139-.119-.277-.175-.416H21a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1h2.753c.056-.139.114-.277.175-.416L21.979,7.636a1,1,0,0,1,0-1.414l4.243-4.243a1,1,0,0,1,1.414,0l1.948,1.949c.139-.061.277-.119.416-.175V1a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1V3.753c.139.056.277.114.416.175l1.948-1.949a1,1,0,0,1,1.414,0l4.243,4.243a1,1,0,0,1,0,1.414L44.072,9.584c.061.139.119.277.175.416H47a1,1,0,0,1,1,1v6a1,1,0,0,1-1,1H44.247c-.056.139-.114.277-.175.416l1.949,1.948a1,1,0,0,1,0,1.414l-4.243,4.243a1,1,0,0,1-1.414,0l-1.948-1.949c-.139.061-.277.119-.416.175V27A1,1,0,0,1,37,28Zm-5-2h4V23.541a1,1,0,0,1,.7-.954,8.934,8.934,0,0,0,1.457-.61,1,1,0,0,1,1.171.179L41.071,23.9,43.9,21.071l-1.743-1.743a1,1,0,0,1-.179-1.171,8.934,8.934,0,0,0,.61-1.457,1,1,0,0,1,.954-.7H46V12H43.541a1,1,0,0,1-.954-.7,8.934,8.934,0,0,0-.61-1.457,1,1,0,0,1,.179-1.171L43.9,6.929,41.071,4.1,39.328,5.844a1,1,0,0,1-1.171.179,8.934,8.934,0,0,0-1.457-.61,1,1,0,0,1-.7-.954V2H32V4.459a1,1,0,0,1-.7.954,8.934,8.934,0,0,0-1.457.61,1,1,0,0,1-1.171-.179L26.929,4.1,24.1,6.929l1.743,1.743a1,1,0,0,1,.179,1.171,8.934,8.934,0,0,0-.61,1.457,1,1,0,0,1-.954.7H22v4h2.459a1,1,0,0,1,.954.7,8.934,8.934,0,0,0,.61,1.457,1,1,0,0,1-.179,1.171L24.1,21.071,26.929,23.9l1.743-1.743a1,1,0,0,1,1.171-.179,8.934,8.934,0,0,0,1.457.61,1,1,0,0,1,.7.954Z"
          fill={iconColors.dark}
        />
        
        {/* Center circle */}
        <Path
          d="M34,19a5,5,0,1,1,5-5A5.006,5.006,0,0,1,34,19Zm0-8a3,3,0,1,0,3,3A3,3,0,0,0,34,11Z"
          fill={iconColors.white}
        />
        
        {/* Checkmark */}
        <Path
          d="M23,35a1,1,0,0,1-.707-.293L13,25.414,9.707,28.707A1,1,0,0,1,9,29H5V27H8.586l3.707-3.707a1,1,0,0,1,1.414,0L23,32.586l4.293-4.293,1.414,1.414-5,5A1,1,0,0,1,23,35Z"
          fill={iconColors.light}
        />
        
        {/* Small detail */}
        <Path
          d="M6,17H4V15a3,3,0,0,1,3-3H9v2H7a1,1,0,0,0-1,1Z"
          fill={iconColors.medium}
        />
        
        {/* Small square detail */}
        <Rect
          x="11"
          y="12"
          width="2"
          height="2"
          fill={iconColors.light}
        />
      </G>
    </Svg>
  );
};

export default SettingsIcon;
