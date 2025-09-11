import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, setSearchQuery, setSelectedCategory } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleFavorite, loadFavorites } from '../store/slices/favoritesSlice';
import { Loading } from '../components';
import { Product, RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    filteredProducts, 
    categories, 
    selectedCategory, 
    searchQuery, 
    loading 
  } = useAppSelector(state => state.products);
  const { favoriteIds } = useAppSelector(state => state.favorites);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(loadFavorites());
  }, [dispatch]);

  const handleAddToCart = useCallback(async (productId: string) => {
    try {
      console.log('Adding to cart:', productId);
      const result = await dispatch(addToCart({ productId })).unwrap();
      console.log('Add to cart result:', result);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }, [dispatch]);

  const handleToggleFavorite = useCallback(async (productId: string) => {
    try {
      console.log('Toggling favorite:', productId);
      const result = await dispatch(toggleFavorite(productId)).unwrap();
      console.log('Toggle favorite result:', result);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    }
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchProducts()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleCategorySelect = useCallback((category: string | null) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  const handleSearchChange = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const renderCategoryTab = ({ item }: { item: string }) => {
    const isSelected = selectedCategory === item;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => handleCategorySelect(item)}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  // Memoized ProductCard component for better performance
  const ProductCard = React.memo(({ item, isFavorite, onPress, onToggleFavorite, onAddToCart }: {
    item: Product;
    isFavorite: boolean;
    onPress: () => void;
    onToggleFavorite: () => void;
    onAddToCart: () => void;
  }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.thumbnail || item.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
          loadingIndicatorSource={{ uri: 'https://via.placeholder.com/150' }}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={20}
            color={isFavorite ? '#FF4444' : '#666'}
          />
        </TouchableOpacity>
      </View>
      
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
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ</Text>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={onAddToCart}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Icon name="add-shopping-cart" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ));

  const renderProduct = useCallback(({ item }: { item: Product }) => {
    const isFavorite = favoriteIds.includes(item.id);
    
    return (
      <ProductCard
        item={item}
        isFavorite={isFavorite}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        onAddToCart={() => handleAddToCart(item.id)}
      />
    );
  }, [favoriteIds, navigation, handleToggleFavorite, handleAddToCart]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 200, // Approximate height of each item
    offset: 200 * index,
    index,
  }), []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
        <Loading size="large" color="#00A86B" type="spinner" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Xin chào!</Text>
            <Text style={styles.subtitle}>Tìm thuốc bạn cần</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="shopping-cart" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thuốc..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearchChange('')}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            <TouchableOpacity
              style={[styles.categoryTab, !selectedCategory && styles.categoryTabSelected]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text style={[styles.categoryTabText, !selectedCategory && styles.categoryTabTextSelected]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryTab, selectedCategory === category && styles.categoryTabSelected]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[styles.categoryTabText, selectedCategory === category && styles.categoryTabTextSelected]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory || 'Sản phẩm nổi bật'}
          </Text>
          <Text style={styles.productCount}>
            {filteredProducts.length} sản phẩm
          </Text>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#00A86B']}
              tintColor="#00A86B"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
              </Text>
            </View>
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={getItemLayout}
          disableVirtualization={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  cartButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    paddingVertical: 15,
  },
  categoryTabs: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryTabSelected: {
    backgroundColor: '#00A86B',
    borderColor: '#00A86B',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00A86B',
  },
  categoryTabTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  productList: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 5,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default HomeScreen;