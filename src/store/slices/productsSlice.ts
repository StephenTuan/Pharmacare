import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  filteredProducts: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productsAPI.getAll();
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách sản phẩm');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const products = await productsAPI.getByCategory(category);
      return { products, category };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải sản phẩm theo danh mục');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredProducts = filterProducts(state.products, action.payload, state.selectedCategory);
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredProducts = filterProducts(state.products, state.searchQuery, action.payload);
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = null;
      state.filteredProducts = state.products;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
        
        // Extract unique categories
        const categories = [...new Set(action.payload.map(product => product.category))];
        state.categories = categories;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredProducts = action.payload.products;
        state.selectedCategory = action.payload.category;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter products
const filterProducts = (products: Product[], searchQuery: string, category: string | null): Product[] => {
  let filtered = products;
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(product => 
      product.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  // Filter by search query
  if (searchQuery.trim()) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filtered;
};

export const { setSearchQuery, setSelectedCategory, clearFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;