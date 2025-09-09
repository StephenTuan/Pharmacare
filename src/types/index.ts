export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
  loyaltyPoints?: number;
  cart?: CartItem[];
  favorites?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string; // Keep for backward compatibility
  thumbnail: string;
  previewImages: string[];
  description: string;
  category: string;
  rating: number;
  reviews: Review[];
  inStock: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RootStackParamList {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
}

export interface TabParamList {
  Home: undefined;
  ChatAI: undefined;
  Favorites: undefined;
  Profile: undefined;
}