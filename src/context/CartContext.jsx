import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nexora_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('nexora_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = async (product, quantity = 1) => {
    try {
      // Re-fetch product to ensure we have the absolute latest stock before adding
      const { data: latestProduct, error } = await supabase
        .from('products')
        .select('stock, price')
        .eq('id', product.id)
        .single();
        
      if (error) throw error;
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const requestedTotalQty = currentQtyInCart + quantity;
        
        if (latestProduct.stock < requestedTotalQty) {
          throw new Error(`Only ${latestProduct.stock} items available in stock.`);
        }
        
        if (existingItem) {
          return prevItems.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity: requestedTotalQty } 
              : item
          );
        } else {
          return [...prevItems, { 
            id: crypto.randomUUID(), 
            product: { ...product, price: latestProduct.price }, 
            quantity 
          }];
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      return { error };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(productId);

    try {
      // Re-fetch to verify stock
      const { data: latestProduct, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
        
      if (error) throw error;

      if (latestProduct.stock < newQuantity) {
        return { error: { message: `Only ${latestProduct.stock} items available in stock.` } };
      }

      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error.message);
      return { error };
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    return { success: true };
  };

  const clearCart = () => {
    setCartItems([]);
    return { success: true };
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
