import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productsAPI, authAPI } from '../../services/api';
import { Product } from '../../types';

interface FavoritesState {
  favoriteIds: string[];
  favoriteProducts: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favoriteIds: [],
  favoriteProducts: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadFavorites = createAsyncThunk(
  'favorites/loadFavorites',
  async (_, { rejectWithValue }) => {
    try {
      let favoriteIds: string[] = [];
      
      // Try to load from database first
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser && currentUser.favorites) {
          favoriteIds = currentUser.favorites;
          // Sync with AsyncStorage
          await AsyncStorage.setItem('favorites', JSON.stringify(favoriteIds));
        } else {
          // Fallback to AsyncStorage
          const favoritesStr = await AsyncStorage.getItem('favorites');
          favoriteIds = favoritesStr ? JSON.parse(favoritesStr) : [];
        }
      } catch (dbError) {
        console.error('Error loading favorites from database:', dbError);
        // Fallback to AsyncStorage
        const favoritesStr = await AsyncStorage.getItem('favorites');
        favoriteIds = favoritesStr ? JSON.parse(favoritesStr) : [];
      }
      
      if (favoriteIds.length > 0) {
        const allProducts = await productsAPI.getAll();
        const favoriteProducts = allProducts.filter(product => 
          favoriteIds.includes(product.id)
        );
        return { favoriteIds, favoriteProducts };
      }
      
      return { favoriteIds: [], favoriteProducts: [] };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách yêu thích');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { favorites: FavoritesState };
      const currentFavorites = state.favorites.favoriteIds;
      
      let updatedFavorites: string[];
      if (currentFavorites.includes(productId)) {
        // Remove from favorites
        updatedFavorites = currentFavorites.filter(id => id !== productId);
      } else {
        // Add to favorites
        updatedFavorites = [...currentFavorites, productId];
      }
      
      // Update AsyncStorage
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      // Update user favorites in database
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          await fetch(`http://10.0.2.2:3001/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              favorites: updatedFavorites,
            }),
          });
        }
      } catch (dbError) {
        console.error('Error updating favorites in database:', dbError);
        // Continue with local update even if DB update fails
      }
      
      // Get updated favorite products
      let favoriteProducts: Product[] = [];
      if (updatedFavorites.length > 0) {
        const allProducts = await productsAPI.getAll();
        favoriteProducts = allProducts.filter(product => 
          updatedFavorites.includes(product.id)
        );
      }
      
      return { favoriteIds: updatedFavorites, favoriteProducts };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể cập nhật danh sách yêu thích');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { favorites: FavoritesState };
      const currentFavorites = state.favorites.favoriteIds;
      
      if (currentFavorites.includes(productId)) {
        return { favoriteIds: currentFavorites, favoriteProducts: state.favorites.favoriteProducts };
      }
      
      const updatedFavorites = [...currentFavorites, productId];
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      const allProducts = await productsAPI.getAll();
      const favoriteProducts = allProducts.filter(product => 
        updatedFavorites.includes(product.id)
      );
      
      return { favoriteIds: updatedFavorites, favoriteProducts };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể thêm vào danh sách yêu thích');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { favorites: FavoritesState };
      const currentFavorites = state.favorites.favoriteIds;
      
      const updatedFavorites = currentFavorites.filter(id => id !== productId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      let favoriteProducts: Product[] = [];
      if (updatedFavorites.length > 0) {
        const allProducts = await productsAPI.getAll();
        favoriteProducts = allProducts.filter(product => 
          updatedFavorites.includes(product.id)
        );
      }
      
      return { favoriteIds: updatedFavorites, favoriteProducts };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa khỏi danh sách yêu thích');
    }
  }
);

export const clearAllFavorites = createAsyncThunk(
  'favorites/clearAllFavorites',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('favorites');
      return { favoriteIds: [], favoriteProducts: [] };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa tất cả yêu thích');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load favorites
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteIds = action.payload.favoriteIds;
        state.favoriteProducts = action.payload.favoriteProducts;
        state.error = null;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteIds = action.payload.favoriteIds;
        state.favoriteProducts = action.payload.favoriteProducts;
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favoriteIds = action.payload.favoriteIds;
        state.favoriteProducts = action.payload.favoriteProducts;
        state.error = null;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove from favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favoriteIds = action.payload.favoriteIds;
        state.favoriteProducts = action.payload.favoriteProducts;
        state.error = null;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear all favorites
      .addCase(clearAllFavorites.fulfilled, (state, action) => {
        state.favoriteIds = action.payload.favoriteIds;
        state.favoriteProducts = action.payload.favoriteProducts;
        state.error = null;
      })
      .addCase(clearAllFavorites.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;