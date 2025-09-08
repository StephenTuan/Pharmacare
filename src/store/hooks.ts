import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for specific slices
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

export const useProducts = () => {
  const products = useAppSelector(state => state.products);
  const dispatch = useAppDispatch();
  
  return {
    ...products,
    dispatch,
  };
};

export const useCart = () => {
  const cart = useAppSelector(state => state.cart);
  const dispatch = useAppDispatch();
  
  return {
    ...cart,
    dispatch,
  };
};

export const useFavorites = () => {
  const favorites = useAppSelector(state => state.favorites);
  const dispatch = useAppDispatch();
  
  return {
    ...favorites,
    dispatch,
  };
};

export const useUI = () => {
  const ui = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();
  
  return {
    ...ui,
    dispatch,
  };
};