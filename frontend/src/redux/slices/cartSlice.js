// src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      state.totalQuantity += 1;
      state.totalPrice += action.payload.price;
    },
    
    // ✅ ADD THIS - Update quantity of existing item
    updateQuantity: (state, action) => {
      const { productId, quantity, size, color } = action.payload;
      const item = state.items.find(
        item => item._id === productId && 
                item.selectedSize === size && 
                item.selectedColor === color
      );
      
      if (item && quantity > 0) {
        const quantityDiff = quantity - item.quantity;
        item.quantity = quantity;
        state.totalQuantity += quantityDiff;
        state.totalPrice += item.price * quantityDiff;
      }
    },
    
    removeFromCart: (state, action) => {
      const item = state.items.find(item => item._id === action.payload);
      
      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalPrice -= item.price * item.quantity;
        state.items = state.items.filter(item => item._id !== action.payload);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

// ✅ UPDATE exports - export updateQuantity also
export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;