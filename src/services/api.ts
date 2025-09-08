import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, Review, Order, CartItem } from '../types';

// const BASE_URL = 'http://10.0.2.2:3001'; // For Android Emulator
const BASE_URL = 'http://192.168.31.79:3001'; // For physical device on same network

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.get('/products');
    return response.data;
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
    const cartStr = await AsyncStorage.getItem('cart');
    return cartStr ? JSON.parse(cartStr) : [];
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
    
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  removeFromCart: async (itemId: string): Promise<CartItem[]> => {
    const cart = await cartAPI.getCart();
    const updatedCart = cart.filter(item => item.id !== itemId);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    const cart = await cartAPI.getCart();
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return cart;
  },

  clearCart: async (): Promise<void> => {
    await AsyncStorage.removeItem('cart');
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