import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Lottie from 'lottie-react-native';

import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import OrdersScreen from '../screens/OrdersScreen';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { getTotalItems } = useCart();

  // Function to get themed icons
  const getThemedIcon = (iconType: string, focused: boolean) => {
    switch (iconType) {
      case 'home':
        return theme === 'light' ? (focused ? '🏠' : '🏡') : (focused ? '🏡' : '🏠');
      case 'cart':
        return theme === 'light' ? (focused ? '🛍️' : '🛒') : (focused ? '🛒' : '🛍️');
      case 'orders':
        return theme === 'light' ? (focused ? '📦' : '📋') : (focused ? '📋' : '📦');
      // chatbot icon handled separately with Lottie animation
      case 'settings':
        return theme === 'light' ? (focused ? '⚙️' : '🔧') : (focused ? '🔧' : '⚙️');
      default:
        return '❓';
    }
  };
  
  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            height: 75, // Increased height to accommodate more space
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <Text style={{ fontSize: size, color: color }}>{getThemedIcon('home', focused)}</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            tabBarLabel: 'Cart',
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ position: 'relative' }}>
                <Text style={{ fontSize: size, color: color }}>{getThemedIcon('cart', focused)}</Text>
                {getTotalItems() > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                  }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {getTotalItems()}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: focused ? 'transparent' : 'transparent',
                borderRadius: 25,
                padding: 5,
                width: size + 10,
                height: size + 10,
              }}>
                <Lottie
                  source={require('../assets/hello animation.json')}
                  autoPlay
                  loop
                  style={{ width: size + 30, height: size + 30 }}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ focused, color, size }) => (
              <Text style={{ fontSize: size, color: color }}>{getThemedIcon('orders', focused)}</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused, color, size }) => (
              <Text style={{ fontSize: size, color: color }}>{getThemedIcon('settings', focused)}</Text>
            ),
          }}
        />
      </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default BottomTabNavigator;