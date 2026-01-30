import React from 'react';
import Svg, { G, Path, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface CartIconProps {
  size?: number;
  focused?: boolean;
  color?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ size = 24, focused = false, color }) => {
  const { colors, theme } = useTheme();
  
  // Use provided color or theme-based color
  const mainColor = color || (focused ? colors.primary : colors.textSecondary);
  
  // Calculate theme-appropriate colors - same as HomeIcon
  const getThemeColors = () => {
    if (theme === 'light') {
      // Light theme - warm browns and creams
      if (focused) {
        return {
          main: mainColor, // #8B4513 (dark chocolate brown)
          dark: '#5D2E0A', // Darker brown for roof
          medium: '#8B4513', // Primary brown for main structure
          light: '#D4AF37', // Gold/amber accent
          lightest: '#FFF8F0', // Cream background
          white: '#FFFFFF', // Pure white
          gray: '#8B4513', // Same as medium for cart basket (matches HomeIcon)
        };
      } else {
        return {
          main: mainColor, // #6D4C41 (medium brown)
          dark: '#8E8E8F', // Gray for roof
          medium: '#A1887F', // Light brown for structure
          light: '#E6E6E7', // Light gray
          lightest: '#FDFDFD', // Off-white
          white: '#FFFFFF', // Pure white
          gray: '#A1887F', // Same as medium for cart basket (matches HomeIcon)
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
          gray: '#FFFFFF', // White
        };
      } else {
        return {
          main: '#FFFFFF', // White
          dark: '#FFFFFF', // White
          medium: '#FFFFFF', // White
          light: '#FFFFFF', // White
          lightest: '#FFFFFF', // White
          white: '#FFFFFF', // White
          gray: '#FFFFFF', // White
        };
      }
    }
  };

  const iconColors = getThemeColors();

  return (
    <Svg width={size} height={size} viewBox="0 0 2048 2048">
      <G>
        {/* Main cart body */}
        <Path
          d="M1421.44 578.493c71.9717,-157.339 182.943,-163.908 316.987,-171.843 16.6347,-0.989765 33.6792,-1.99843 53.5725,-3.60591l0 63.4689c-15.7654,1.20473 -33.0047,2.2252 -49.8662,3.22087 -113.329,6.71339 -207.162,12.2669 -263.301,134.982l-360.612 793.822 -523.367 -0.347244 0.0755906 -62.6812 480.447 -0.302362 56.7248 -123.957 -536.63 0 -195.571 -337.618 -0.0944883 0.056693 -35.4 -61.3323 -55.4575 -95.7355 0.126378 -0.126378 -53.0752 -91.9359 73.3973 0 2.15551 4.48229 27.8858 48.3473 1016.78 0 45.2209 -98.895z"
          fill={iconColors.medium}
        />
        
        {/* Cart basket inner */}
        <Polygon
          points="896.003,1211.25 595.472,1211.25 399.901,873.631 399.807,873.688 364.407,812.356 308.949,716.62 309.076,716.494 256.001,624.558 329.398,624.558 331.553,629.04 359.439,677.388 896.003,677.388"
          fill={iconColors.gray}
        />
        
        {/* Cart bottom */}
        <Polygon
          points="896.003,1398.39 594.854,1398.19 594.93,1335.51 896.003,1335.32"
          fill={iconColors.gray}
        />
        
        {/* Cart body shadow/highlight */}
        <Path
          d="M1421.44 578.493c71.9717,-157.339 182.943,-163.908 316.987,-171.843 16.6347,-0.989765 33.6792,-1.99843 53.5725,-3.60591l0 63.4689c-15.7654,1.20473 -33.0047,2.2252 -49.8662,3.22087 -113.329,6.71339 -207.162,12.2669 -263.301,134.982l-360.612 793.822 -222.078 -0.147638 -0.140551 0 0 -63.0697 0.205512 -0.0011811 179.169 -0.112205 56.7248 -123.957 -235.766 0 -0.333071 0 0 -533.862 0.879922 0 479.338 0 45.2209 -98.895z"
          fill={iconColors.light}
        />
        
        {/* Left wheel */}
        <Path
          d="M647.084 1417.73c31.3654,0 59.7756,12.7193 80.3304,33.2811 20.5618,20.5559 33.2823,48.965 33.2823,80.3316 0,31.3725 -12.7205,59.7756 -33.2823,80.3375 -20.5547,20.5547 -48.965,33.2752 -80.3304,33.2752 -31.3725,0 -59.7756,-12.7205 -80.3304,-33.2752 -20.5618,-20.5618 -33.2823,-48.965 -33.2823,-80.3375 0,-31.3666 12.7205,-59.7756 33.2823,-80.3316 20.5547,-20.5618 48.9579,-33.2811 80.3304,-33.2811zm35.5512 78.0615c-9.09568,-9.09568 -21.665,-14.7248 -35.5512,-14.7248 -13.8862,0 -26.4555,5.62914 -35.5512,14.7248 -9.09568,9.09568 -14.7248,21.6709 -14.7248,35.5512 0,13.8862 5.62914,26.4614 14.7248,35.5571 9.09568,9.09568 21.665,14.7189 35.5512,14.7189 13.8862,0 26.4555,-5.62323 35.5512,-14.7189 9.09568,-9.09568 14.7248,-21.6709 14.7248,-35.5571 0,-13.8803 -5.62914,-26.4555 -14.7248,-35.5512z"
          fill={iconColors.dark}
        />
        
        {/* Right wheel */}
        <Path
          d="M1073.81 1417.73c31.3725,0 59.7756,12.7193 80.3304,33.2811 20.5618,20.5559 33.2823,48.965 33.2823,80.3316 0,31.3725 -12.7205,59.7756 -33.2823,80.3375 -20.5547,20.5547 -48.9579,33.2752 -80.3304,33.2752 -31.3725,0 -59.7756,-12.7205 -80.3375,-33.2752 -20.5547,-20.5618 -33.2752,-48.965 -33.2752,-80.3375 0,-31.3666 12.7205,-59.7756 33.2752,-80.3316 20.5618,-20.5618 48.965,-33.2811 80.3375,-33.2811zm35.5512 78.0615c-9.09568,-9.09568 -21.665,-14.7248 -35.5512,-14.7248 -13.8862,0 -26.4614,5.62914 -35.5583,14.7248 -9.09568,9.09568 -14.7177,21.6709 -14.7177,35.5512 0,13.8862 5.62205,26.4614 14.7177,35.5571 9.09686,9.09568 21.6721,14.7189 35.5583,14.7189 13.8862,0 26.4555,-5.62323 35.5512,-14.7189 9.09568,-9.09568 14.7248,-21.6709 14.7248,-35.5571 0,-13.8803 -5.62914,-26.4555 -14.7248,-35.5512z"
          fill={iconColors.dark}
        />
        
        {/* Cart lines/separators */}
        <Polygon
          points="775.752,809.06 775.752,1097.06 711.751,1097.06 711.751,809.06"
          fill={iconColors.gray}
        />
        <Polygon
          points="935.749,809.06 935.749,1097.06 871.748,1097.06 871.748,809.06"
          fill={iconColors.gray}
        />
        <Polygon
          points="1095.75,809.06 1095.75,1097.06 1031.74,1097.06 1031.74,809.06"
          fill={iconColors.gray}
        />
        
        {/* Cart highlights */}
        <Polygon
          points="927.999,800 927.999,1088 863.997,1088 863.997,800"
          fill={iconColors.white}
        />
        <Polygon
          points="1088,800 1088,1088 1023.99,1088 1023.99,800"
          fill={iconColors.white}
        />
        <Polygon
          points="768.002,800 768.002,1088 704,1088 704,800"
          fill={iconColors.white}
        />
      </G>
    </Svg>
  );
};

export default CartIcon;
