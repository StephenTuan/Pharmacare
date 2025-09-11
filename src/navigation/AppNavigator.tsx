import React, { useEffect, lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { loadFavorites } from '../store/slices/favoritesSlice';
import { fetchProducts } from '../store/slices/productsSlice';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatAIScreen from '../screens/ChatAIScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

import { RootStackParamList, TabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading component for lazy screens
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
    <ActivityIndicator size="large" color="#00A86B" />
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'ChatAI') {
            iconName = 'smart-toy';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'favorite' : 'favorite-border';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00A86B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        // Performance optimizations
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          borderTopWidth: 0,
        },
      })}
      initialRouteName="Home"
      backBehavior="initialRoute"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="ChatAI" 
        component={ChatAIScreen}
        options={{ tabBarLabel: 'Chat AI' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Yêu thích' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load initial data when app starts
    dispatch(fetchProducts());
    dispatch(loadFavorites());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          // Performance optimizations
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{
            headerShown: true,
            title: 'Chi tiết sản phẩm',
            headerStyle: {
              backgroundColor: '#00A86B',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen}
          options={{
            headerShown: true,
            title: 'Giỏ hàng',
            headerStyle: {
              backgroundColor: '#00A86B',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{
            headerShown: true,
            title: 'Thanh toán',
            headerStyle: {
              backgroundColor: '#00A86B',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="OrderHistory" 
          component={OrderHistoryScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;