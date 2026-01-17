import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import DeliveryAddressScreen from '../screens/DeliveryAddressScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();

const SettingsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="DeliveryAddress" 
        component={DeliveryAddressScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddAddress" 
        component={AddAddressScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;