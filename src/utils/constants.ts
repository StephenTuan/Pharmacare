// Colors
export const COLORS = {
  // Primary Colors
  PRIMARY: '#00A86B',
  PRIMARY_LIGHT: '#00C851',
  PRIMARY_DARK: '#00875A',
  
  // Secondary Colors
  SECONDARY: '#E8F5E8',
  SECONDARY_LIGHT: '#F0F8F0',
  
  // Status Colors
  SUCCESS: '#4CAF50',
  ERROR: '#FF5252',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#FAFAFA',
  GRAY_100: '#F5F5F5',
  GRAY_200: '#EEEEEE',
  GRAY_300: '#E0E0E0',
  GRAY_400: '#BDBDBD',
  GRAY_500: '#9E9E9E',
  GRAY_600: '#757575',
  GRAY_700: '#616161',
  GRAY_800: '#424242',
  GRAY_900: '#212121',
  
  // Background Colors
  BACKGROUND: '#F8F9FA',
  SURFACE: '#FFFFFF',
  
  // Text Colors
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_DISABLED: '#BDBDBD',
  TEXT_HINT: '#9E9E9E',
  
  // Border Colors
  BORDER: '#E0E0E0',
  BORDER_LIGHT: '#F0F0F0',
  
  // Shadow Colors
  SHADOW: '#000000',
  
  // Overlay Colors
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.3)',
};

// Typography
export const TYPOGRAPHY = {
  FONT_SIZE: {
    XS: 10,
    SM: 12,
    BASE: 14,
    LG: 16,
    XL: 18,
    '2XL': 20,
    '3XL': 24,
    '4XL': 28,
    '5XL': 32,
    '6XL': 36,
  },
  FONT_WEIGHT: {
    LIGHT: '300',
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
    LOOSE: 1.8,
  },
};

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  '2XL': 24,
  '3XL': 32,
  '4XL': 40,
  '5XL': 48,
  '6XL': 64,
};

// Border Radius
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 20,
  '3XL': 24,
  FULL: 9999,
};

// Shadows
export const SHADOWS = {
  SMALL: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  LARGE: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  EXTRA_LARGE: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation Durations
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    EXTRA_SLOW: 800,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
  },
};

// Screen Dimensions
export const SCREEN = {
  BREAKPOINTS: {
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
  },
};

// API Constants
export const API = {
  BASE_URL: 'http://192.168.31.79:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// App Constants
export const APP = {
  NAME: 'PharmaCare',
  VERSION: '1.0.0',
  DESCRIPTION: 'Nhà thuốc trực tuyến tin cậy',
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  FAVORITES: 'favorites',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Categories
export const CATEGORIES = [
  'Thuốc kê đơn',
  'Thuốc không kê đơn',
  'Thực phẩm chức năng',
  'Chăm sóc sức khỏe',
  'Sản phẩm làm đẹp',
  'Thiết bị y tế',
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank',
  MOMO: 'momo',
  CREDIT_CARD: 'credit_card',
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SCREEN,
  API,
  APP,
  STORAGE_KEYS,
  CATEGORIES,
  ORDER_STATUS,
  PAYMENT_METHODS,
};