import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  filters: {
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setProducts, setFilters, setLoading, setError, clearFilters } = productSlice.actions;
export default productSlice.reducer;