import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
import MainNavigator from './src/navigation/MainNavigator';
import Toast from 'react-native-toast-message';
import toastConfig from './src/utils/ToastConfig';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <CartProvider>
            <MainNavigator />
            <Toast
              config={toastConfig}
              position="top"
              visibilityTime={3000}
              autoHide={true}
              topOffset={30}
            />
          </CartProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;