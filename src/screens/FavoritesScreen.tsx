import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadFavorites, removeFromFavorites } from '../store/slices/favoritesSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Product } from '../types';

const FavoritesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { favoriteProducts, favoriteIds, loading } = useAppSelector(state => state.favorites);

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  // Reload favorites when favoriteIds change (from other screens)
  useEffect(() => {
    dispatch(loadFavorites());
  }, [favoriteIds, dispatch]);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadFavorites());
    }, [dispatch])
  );

  const handleRemoveFavorite = useCallback(async (productId: string) => {
    try {
      await dispatch(removeFromFavorites(productId)).unwrap();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
    }
  }, [dispatch]);

  const handleAddToCart = useCallback(async (productId: string) => {
    try {
      await dispatch(addToCart({ productId })).unwrap();
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }, [dispatch]);

  // Memoized FavoriteProductCard component
  const FavoriteProductCard = React.memo(({ item, onRemove, onAddToCart }: {
    item: Product;
    onRemove: () => void;
    onAddToCart: () => void;
  }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.thumbnail || item.image || 'https://via.placeholder.com/100' }}
        style={styles.productImage}
        resizeMode="cover"
        loadingIndicatorSource={{ uri: 'https://via.placeholder.com/100' }}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviews?.length || 0})</Text>
        </View>
        
        <Text style={styles.price}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Icon name="favorite" size={20} color="#FF4444" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={onAddToCart}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Icon name="add-shopping-cart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ));

  const renderFavoriteProduct = useCallback(({ item }: { item: Product }) => (
    <FavoriteProductCard
      item={item}
      onRemove={() => handleRemoveFavorite(item.id)}
      onAddToCart={() => handleAddToCart(item.id)}
    />
  ), [handleRemoveFavorite, handleAddToCart]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 120, // Approximate height of each favorite item
    offset: 120 * index,
    index,
  }), []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="favorite-border" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm những sản phẩm bạn quan tâm vào danh sách yêu thích
      </Text>
      <TouchableOpacity style={styles.shopButton}>
        <Text style={styles.shopButtonText}>Khám phá sản phẩm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteProducts.length} sản phẩm
        </Text>
      </View>

      <View style={styles.content}>
        {favoriteProducts.length > 0 ? (
          <>
            <View style={styles.actionBar}>
              <Text style={styles.actionBarText}>
                Vuốt để xóa khỏi danh sách yêu thích
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Xác nhận',
                    'Bạn có muốn xóa tất cả sản phẩm yêu thích?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      {
                        text: 'Xóa tất cả',
                        style: 'destructive',
                        onPress: async () => {
                          setFavorites([]);
                          await AsyncStorage.removeItem('favorites');
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={favoriteProducts}
              renderItem={renderFavoriteProduct}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              // Performance optimizations
              removeClippedSubviews={true}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={50}
              initialNumToRender={8}
              windowSize={8}
              getItemLayout={getItemLayout}
              disableVirtualization={false}
            />
          </>
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#00A86B',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionBarText: {
    fontSize: 12,
    color: '#666',
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  actionButtons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#00A86B',
    borderRadius: 8,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#00A86B',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;