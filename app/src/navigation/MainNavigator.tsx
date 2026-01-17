import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatbotScreen from '../screens/ChatbotScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createStackNavigator();

const MainNavigator: React.FC = () => {
  const { colors, theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="HomeTabs" 
          component={BottomTabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Chatbot" 
          component={ChatbotScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AllProducts" 
          component={AllProductsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;