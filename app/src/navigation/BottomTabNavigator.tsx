import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Lottie from 'lottie-react-native';
import HomeIcon from '../components/HomeIcon';
import CartIcon from '../components/CartIcon';
import OrdersIcon from '../components/OrdersIcon';
import SettingsIcon from '../components/SettingsIcon';

import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get('window').width;

const BottomTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { getTotalItems } = useCart();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} colors={colors} theme={theme} getTotalItems={getTotalItems} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, colors, theme, getTotalItems }: any) => {
  return (
      <View style={[styles.tabBarContainer, { backgroundColor: colors.surface }]}>
      {/* Top border for classic design */}
      <View style={[styles.topBorder, { borderTopColor: colors.textSecondary + (theme === 'dark' ? '30' : '20') }]} />
      
      <View style={styles.tabBarContent}>
        {/* Left side tabs */}
        <View style={styles.leftTabs}>
          {state.routes.slice(0, 2).map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === index;
            const iconColor = isFocused ? colors.primary : colors.textSecondary;
            const iconSize = 24;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            let icon;
            switch (route.name) {
              case 'Home':
                icon = <HomeIcon size={iconSize} focused={isFocused} color={iconColor} />;
                break;
              case 'Cart':
                icon = (
                  <View style={{ position: 'relative' }}>
                    <CartIcon size={iconSize} focused={isFocused} color={iconColor} />
                    {getTotalItems() > 0 && (
                      <View style={[styles.badge, { backgroundColor: colors.error || 'red' }]}>
                        <Text style={styles.badgeText}>{getTotalItems()}</Text>
                      </View>
                    )}
                  </View>
                );
                break;
              default:
                icon = null;
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <View style={styles.tabIconContainer}>
                  {icon}
                </View>
                {label && (
                  <Text style={[
                    styles.tabLabel,
                    { color: iconColor },
                    isFocused && styles.tabLabelFocused
                  ]}>
                    {label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center Chatbot Button */}
        {state.routes[2] && (() => {
          const route = state.routes[2];
          const { options } = descriptors[route.key];
          const isFocused = state.index === 2;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <View style={styles.chatbotContainer}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.chatbotButton}
                activeOpacity={0.7}
              >
                {/* Outer circle ring */}
                <View style={[styles.chatbotOuterRing, { 
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                }]}>
                  {/* Middle circle ring */}
                  <View style={[styles.chatbotMiddleRing, { 
                    borderColor: colors.primary + '40',
                  }]}>
                    {/* Inner circle with background */}
                    <View style={[styles.chatbotInnerCircle, { 
                      backgroundColor: isFocused ? colors.primary : colors.primary + '15',
                    }]}>
                      <Lottie
                        source={require('../assets/hello animation.json')}
                        autoPlay
                        loop
                        style={styles.chatbotAnimation}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Right side tabs */}
        <View style={styles.rightTabs}>
          {state.routes.slice(3).map((route: any, index: number) => {
            const actualIndex = index + 3;
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === actualIndex;
            const iconColor = isFocused ? colors.primary : colors.textSecondary;
            const iconSize = 24;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            let icon;
            switch (route.name) {
              case 'Orders':
                icon = <OrdersIcon size={iconSize} focused={isFocused} color={iconColor} />;
                break;
              case 'Settings':
                icon = <SettingsIcon size={iconSize} focused={isFocused} color={iconColor} />;
                break;
              default:
                icon = null;
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <View style={styles.tabIconContainer}>
                  {icon}
                </View>
                {label && (
                  <Text style={[
                    styles.tabLabel,
                    { color: iconColor },
                    isFocused && styles.tabLabelFocused
                  ]}>
                    {label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  topBorder: {
    height: 1,
    borderTopWidth: 1,
    width: '100%',
  },
  tabBarContent: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 5,
    position: 'relative',
  },
  leftTabs: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },
  rightTabs: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    minWidth: 60,
  },
  tabIconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
  chatbotContainer: {
    position: 'absolute',
    bottom: 12,
    left: screenWidth / 2 - 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  chatbotButton: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatbotOuterRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  chatbotMiddleRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  chatbotInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chatbotAnimation: {
    width: 50,
    height: 50,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -15,
    borderRadius: 10,
    minWidth: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;
