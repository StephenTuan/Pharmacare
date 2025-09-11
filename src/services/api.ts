import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, Review, Order, CartItem } from '../types';

// const BASE_URL = 'http://10.0.2.2:3001'; // For Android Emulator
const BASE_URL = 'http://192.168.31.79:3001'; // For physical device on same network

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.get('/users');
    const users = response.data;
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      const token = `token_${user.id}_${Date.now()}`;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const response = await api.post('/users', newUser);
    const token = `token_${newUser.id}_${Date.now()}`;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    return { user: response.data, token };
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      console.log('Making API request to:', `${BASE_URL}/products`);
      const response = await api.get('/products');
      console.log('API response status:', response.status);
      console.log('API response data length:', response.data.length);
      return response.data;
    } catch (axiosError: any) {
      console.error('Axios request failed:', axiosError.message);
      console.error('Axios error code:', axiosError.code);
      
      // Fallback to fetch API if axios fails
      try {
        console.log('Trying fallback fetch API...');
        const fetchResponse = await fetch(`${BASE_URL}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        console.log('Fetch API success, data length:', data.length);
        return data;
      } catch (fetchError: any) {
        console.error('Fetch API also failed:', fetchError.message);
        throw new Error(`Both Axios and Fetch failed. Axios: ${axiosError.message}, Fetch: ${fetchError.message}`);
      }
    }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products?category=${category}`);
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getByProductId: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews?productId=${productId}`);
    return response.data;
  },

  create: async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const response = await api.post('/reviews', newReview);
    return response.data;
  },
};

// Cart API (using AsyncStorage for local cart)
export const cartAPI = {
  getCart: async (): Promise<CartItem[]> => {
    try {
      // Try to load from database first
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser && currentUser.cart) {
        // Sync with AsyncStorage
        await AsyncStorage.setItem('cart', JSON.stringify(currentUser.cart));
        return currentUser.cart;
      } else {
        // Fallback to AsyncStorage
        const cartStr = await AsyncStorage.getItem('cart');
        return cartStr ? JSON.parse(cartStr) : [];
      }
    } catch (dbError) {
      console.error('Error loading cart from database:', dbError);
      // Fallback to AsyncStorage
      const cartStr = await AsyncStorage.getItem('cart');
      return cartStr ? JSON.parse(cartStr) : [];
    }
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem[]> => {
    const cart = await cartAPI.getCart();
    const product = await productsAPI.getById(productId);
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId,
        quantity,
        product,
      };
      cart.push(newItem);
    }
    
    // Update AsyncStorage
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    
    // Update user cart in database
    try {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        await fetch(`http://192.168.31.79:3001/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart: cart,
          }),
        });
      }
    } catch (dbError) {
      console.error('Error updating cart in database:', dbError);
      // Continue with local update even if DB update fails
    }
    
    return cart;
  },

  removeFromCart: async (itemId: string): Promise<CartItem[]> => {
    const cart = await cartAPI.getCart();
    const updatedCart = cart.filter(item => item.id !== itemId);
    
    // Update AsyncStorage
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update user cart in database
    try {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        await fetch(`http://192.168.31.79:3001/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart: updatedCart,
          }),
        });
      }
    } catch (dbError) {
      console.error('Error updating cart in database:', dbError);
      // Continue with local update even if DB update fails
    }
    
    return updatedCart;
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    const cart = await cartAPI.getCart();
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      
      // Update AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      
      // Update user cart in database
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          await fetch(`http://192.168.31.79:3001/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cart: cart,
            }),
          });
        }
      } catch (dbError) {
        console.error('Error updating cart in database:', dbError);
        // Continue with local update even if DB update fails
      }
    }
    
    return cart;
  },

  clearCart: async (): Promise<void> => {
    // Clear AsyncStorage
    await AsyncStorage.removeItem('cart');
    
    // Update user cart in database
    try {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        await fetch(`http://192.168.31.79:3001/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart: [],
          }),
        });
      }
    } catch (dbError) {
      console.error('Error clearing cart in database:', dbError);
      // Continue with local clear even if DB update fails
    }
  },
};

// Orders API
export const ordersAPI = {
  create: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const response = await api.post('/orders', newOrder);
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Order[]> => {
    const response = await api.get(`/orders?userId=${userId}`);
    return response.data;
  },
};

export default api;