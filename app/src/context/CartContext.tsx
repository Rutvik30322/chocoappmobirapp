import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../store/hooks';
import cartService from '../services/cartService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantityToAdd?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = '@cart_items';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?._id;

  // Load cart from storage on mount
  React.useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);

  // Sync cart with backend when user logs in or out
  useEffect(() => {
    if (userId && isInitialized) {
      // Load user's cart from backend
      loadCartFromBackend();
    }
  }, [userId, isInitialized]);

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      const response = await cartService.getCart();
      if (response.data && response.data.cart) {
        // Convert backend cart items to local cart format
        const localCartItems = response.data.cart.map((item: any) => ({

          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));
        
        setItems(localCartItems);
        // Also save to local storage
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCartItems));
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
    }
  };

  // Save cart to storage whenever items change
  React.useEffect(() => {
    if (isInitialized) {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
          console.error('Failed to save cart to storage:', error);
        }
      };
      
      saveCart();
    }
  }, [items, isInitialized]);

  const addToCart = React.useCallback(async (item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: quantityToAdd }];
      }
    });
    
    // If user is logged in, sync with backend
    if (userId) {
      try {
        await cartService.addToCart(item.id, quantityToAdd);
      } catch (error) {
        console.error('Failed to add item to backend cart:', error);
        // Revert the local cart change if backend sync fails
        setItems(prevItems => {
          const existingItem = prevItems.find(i => i.id === item.id);
          if (existingItem && existingItem.quantity === quantityToAdd) {
            // Remove item if quantity matches what we tried to add
            return prevItems.filter(i => i.id !== item.id);
          } else {
            // Decrease quantity by the amount we tried to add
            return prevItems.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity - quantityToAdd } : i
            );
          }
        });
      }
    }
  }, [userId]);

  const removeFromCart = React.useCallback(async (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    // If user is logged in, sync with backend
    if (userId) {
      try {
        await cartService.removeFromCart(id);
      } catch (error) {
        console.error('Failed to remove item from backend cart:', error);
        // We could revert the local change here, but it might be confusing to users
      }
    }
  }, [userId]);

  const updateQuantity = React.useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
    
    // If user is logged in, sync with backend
    if (userId) {
      try {
        await cartService.updateCartItemQuantity(id, quantity);
      } catch (error) {
        console.error('Failed to update item quantity in backend cart:', error);
        // Revert the local change if backend sync fails
        setItems(prevItems =>
          prevItems.map(item => (item.id === id ? { ...item, quantity: item.quantity } : item))
        );
      }
    }
  }, [removeFromCart, userId]);

  const clearCart = React.useCallback(async () => {
    setItems([]);
    
    // If user is logged in, sync with backend
    if (userId) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
        // Revert the local change if backend sync fails
        // We won't revert as clearing is usually intentional
      }
    }
  }, [userId]);

  const getTotalItems = React.useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = React.useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const contextValue: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};