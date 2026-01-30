import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface OrdersIconProps {
  size?: number;
  focused?: boolean;
  color?: string;
}

const OrdersIcon: React.FC<OrdersIconProps> = ({ size = 24, focused = false, color }) => {
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
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <G>
        {/* Top handle/strap */}
        <Path
          d="M96.624,21.856h-4C92.624,12.01,84.515,4,74.546,4h-7.808c-9.971,0-18.082,8.01-18.082,17.856h-4
          C44.656,9.805,54.562,0,66.738,0h7.808C86.72,0,96.624,9.805,96.624,21.856z"
          fill={iconColors.dark}
        />
        
        {/* Main clipboard body */}
        <Path
          d="M98.313,127.948H8.745V26.743h89.567V127.948z M12.745,123.948h81.567V30.743H12.745V123.948z"
          fill={iconColors.medium}
        />
        
        {/* Inner clipboard handle */}
        <Path
          d="M83.578,41.119h-4V21.856C79.578,12.01,71.467,4,61.497,4H53.69c-9.969,0-18.08,8.01-18.08,17.856v19.263
          h-4V21.856C31.61,9.805,41.515,0,53.69,0h7.807c12.176,0,22.081,9.805,22.081,21.856V41.119z"
          fill={iconColors.dark}
        />
        
        {/* Right side clip */}
        <Path
          d="M119.255,127.948H94.152V26.743h25.103V127.948z M98.152,123.948h17.103V30.743H98.152V123.948z"
          fill={iconColors.medium}
        />
        
        {/* Clip top detail */}
        <Rect
          x="104.493"
          y="28.743"
          width="4"
          height="1.968"
          fill={iconColors.dark}
        />
        
        {/* Clip lines/details */}
        <Path
          d="M108.493,121.297h-4v-4.121h4V121.297z M108.493,113.056h-4v-4.12h4V113.056z M108.493,104.814h-4v-4.12
          h4V104.814z M108.493,96.573h-4v-4.12h4V96.573z M108.493,88.333h-4v-4.121h4V88.333z M108.493,80.092h-4v-4.121h4V80.092z
          M108.493,71.851h-4v-4.12h4V71.851z M108.493,63.609h-4v-4.12h4V63.609z M108.493,55.369h-4v-4.121h4V55.369z M108.493,47.127
          h-4v-4.12h4V47.127z M108.493,38.887h-4v-4.121h4V38.887z"
          fill={iconColors.light}
        />
        
        {/* Clip bottom detail */}
        <Rect
          x="104.493"
          y="123.979"
          width="4"
          height="1.969"
          fill={iconColors.dark}
        />
        
        {/* Clip top arrow/indicator */}
        <Path
          d="M116.82,128h-19.85l-1.328-3.496l9.926-8.812h2.656l9.924,8.812L116.82,128z M102.236,124h9.318
          l-4.658-4.138L102.236,124z"
          fill={iconColors.dark}
        />
        
        {/* Checkmark elements */}
        <Rect
          x="41.707"
          y="55.167"
          width="4"
          height="8.546"
          fill={iconColors.dark}
        />
        <Rect
          x="27.517"
          y="64.803"
          transform="matrix(0.8685 0.4957 -0.4957 0.8685 37.3018 -6.9917)"
          width="8.621"
          height="4"
          fill={iconColors.dark}
        />
        <Rect
          x="30.335"
          y="76.349"
          transform="matrix(0.4961 0.8682 -0.8682 0.4961 86.3241 12.5664)"
          width="4"
          height="8.619"
          fill={iconColors.dark}
        />
        <Rect
          x="42.724"
          y="82.879"
          width="4"
          height="8.548"
          fill={iconColors.dark}
        />
        <Rect
          x="54.098"
          y="61.623"
          transform="matrix(0.4956 0.8686 -0.8686 0.4956 85.5653 -15.4661)"
          width="4"
          height="8.619"
          fill={iconColors.dark}
        />
        
        {/* Document/paper icon */}
        <Rect
          x="64.744"
          y="94.944"
          transform="matrix(0.7111 0.7031 -0.7031 0.7111 88.9634 -22.62)"
          width="14.526"
          height="4"
          fill={iconColors.medium}
        />
        <Path
          d="M60.558,106.179L45.303,70.526l36.082,15.092l-14.519,6.274L60.558,106.179z M52.861,78.024
          l7.754,18.121l3.225-7.303l7.321-3.164L52.861,78.024z"
          fill={iconColors.medium}
        />
      </G>
    </Svg>
  );
};

export default OrdersIcon;
