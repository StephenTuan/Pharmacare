import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  primaryColor: string;
  isLoading: boolean;
  showSplash: boolean;
  activeTab: string;
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
  animations: {
    fadeIn: boolean;
    slideIn: boolean;
    scale: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

const initialState: UIState = {
  theme: 'light',
  primaryColor: '#00A86B', // Màu xanh lá cây tạo cảm giác an toàn
  isLoading: false,
  showSplash: true,
  activeTab: 'Home',
  notifications: [],
  modals: {},
  animations: {
    fadeIn: true,
    slideIn: true,
    scale: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSplashVisible: (state, action: PayloadAction<boolean>) => {
      state.showSplash = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    showNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    hideNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    showModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    hideModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    setAnimationEnabled: (state, action: PayloadAction<{ type: keyof UIState['animations']; enabled: boolean }>) => {
      state.animations[action.payload.type] = action.payload.enabled;
    },
    enableAllAnimations: (state) => {
      state.animations.fadeIn = true;
      state.animations.slideIn = true;
      state.animations.scale = true;
    },
    disableAllAnimations: (state) => {
      state.animations.fadeIn = false;
      state.animations.slideIn = false;
      state.animations.scale = false;
    },
  },
});

export const {
  setTheme,
  setPrimaryColor,
  setLoading,
  setSplashVisible,
  setActiveTab,
  showNotification,
  hideNotification,
  clearAllNotifications,
  showModal,
  hideModal,
  toggleModal,
  setAnimationEnabled,
  enableAllAnimations,
  disableAllAnimations,
} = uiSlice.actions;

export default uiSlice.reducer;