import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { productsAPI } from '../services/api';
import { Product } from '../types';

const categories = [
  { id: '1', name: 'Thuốc kê đơn', icon: 'local-pharmacy', color: '#FF6B6B' },
  { id: '2', name: 'Thuốc không kê đơn', icon: 'healing', color: '#4ECDC4' },
  { id: '3', name: 'Thực phẩm chức năng', icon: 'fitness-center', color: '#45B7D1' },
  { id: '4', name: 'Chăm sóc sức khỏe', icon: 'favorite', color: '#96CEB4' },
  { id: '5', name: 'Sản phẩm làm đẹp', icon: 'face', color: '#FFEAA7' },
  { id: '6', name: 'Thiết bị y tế', icon: 'medical-services', color: '#DDA0DD' },
];

const CategoriesScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      filterByCategory(selectedCategory);
    }
  }, [selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterByCategory = (categoryName: string) => {
    const filtered = products.filter(product => 
      product.category.toLowerCase().includes(categoryName.toLowerCase())
    );
    setCategoryProducts(filtered);
  };

  const handleCategoryPress = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      setCategoryProducts([]);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => {
    const isSelected = selectedCategory === item.name;
    const productCount = products.filter(p => 
      p.category.toLowerCase().includes(item.name.toLowerCase())
    ).length;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          isSelected && styles.categoryCardSelected
        ]}
        onPress={() => handleCategoryPress(item.name)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Icon name={item.icon} size={30} color="#fff" />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.productCount}>{productCount} sản phẩm</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={20} color="#2196F3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
        <Text style={styles.headerSubtitle}>Chọn danh mục để xem sản phẩm</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {selectedCategory && (
          <View style={styles.productsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory}
              </Text>
              <Text style={styles.productCount}>
                {categoryProducts.length} sản phẩm
              </Text>
            </View>
            
            <FlatList
              data={categoryProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="inventory" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    Chưa có sản phẩm trong danh mục này
                  </Text>
                </View>
              }
            />
          </View>
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
    backgroundColor: '#2196F3',
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
  categoriesList: {
    paddingTop: 20,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  productCount: {
    fontSize: 12,
    color: '#666',
  },
  productsSection: {
    flex: 1,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productsList: {
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CategoriesScreen;