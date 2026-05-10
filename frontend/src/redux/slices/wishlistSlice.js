import { createSlice } from '@reduxjs/toolkit';

const loadWishlistFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const wishlistData = localStorage.getItem('wishlist');
      return wishlistData ? JSON.parse(wishlistData) : { items: [] };
    } catch (error) {
      console.error('Wishlist storage read error:', error);
    }
  }
  return { items: [] };
};

const saveWishlistToStorage = (wishlist) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Wishlist storage save error:', error);
    }
  }
};

const initialState = loadWishlistFromStorage();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item._id === product._id);

      if (existingIndex > -1) {
        // Remove from wishlist
        state.items.splice(existingIndex, 1);
      } else {
        // Add to wishlist
        state.items.push(product);
      }

      saveWishlistToStorage(state);
    },

    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      saveWishlistToStorage(state);
    },

    clearWishlist: (state) => {
      state.items = [];
      saveWishlistToStorage(state);
    },

    setWishlistFromBackend: (state, action) => {
      const backendWishlist = action.payload;
      if (backendWishlist && backendWishlist.products) {
        state.items = backendWishlist.products;
        saveWishlistToStorage(state);
      }
    },
  },
});

export const {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistFromBackend,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;