import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// Async thunks
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      const items = await cartAPI.getCart();
      return items;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const updatedCart = await cartAPI.addToCart(productId, quantity);
      return updatedCart;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(itemId);
      return updatedCart;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const updatedCart = await cartAPI.updateQuantity(itemId, quantity);
      return updatedCart;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể cập nhật số lượng');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartAPI.clearCart();
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa giỏ hàng');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cart
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update quantity
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
        state.error = null;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;