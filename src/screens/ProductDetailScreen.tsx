import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { productsAPI, cartAPI, reviewsAPI, authAPI } from '../services/api';
import { Product, Review, RootStackParamList } from '../types';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

interface Props {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProductDetail();
    loadReviews();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      const data = await productsAPI.getById(productId);
      setProduct(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewsAPI.getByProductId(productId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartAPI.addToCart(productId, quantity);
      Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    try {
      await cartAPI.addToCart(productId, quantity);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thực hiện mua ngay');
    }
  };

  const handleSubmitReview = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      if (!user) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để đánh giá');
        return;
      }

      await reviewsAPI.create({
        productId,
        userId: user.id,
        userName: user.name,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      setShowReviewModal(false);
      setNewReview({ rating: 5, comment: '' });
      loadReviews();
      Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
    }
  };

  const renderStars = (rating: number, size: number = 16, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-border'}
              size={size}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {review.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.userName}</Text>
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
        {renderStars(review.rating)}
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/300' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#FF4444' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          
          <View style={styles.ratingSection}>
            {renderStars(product.rating, 20)}
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({reviews.length} đánh giá)
            </Text>
          </View>

          <Text style={styles.price}>
            {product.price.toLocaleString('vi-VN')}đ
          </Text>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Số lượng:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="add" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Text style={styles.addReviewText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>
            
            {reviews.length > 0 ? (
              reviews.map(renderReview)
            ) : (
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Icon name="add-shopping-cart" size={20} color="#2196F3" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.ratingInput}>
              <Text style={styles.inputLabel}>Đánh giá:</Text>
              {renderStars(newReview.rating, 24, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </View>
            
            <View style={styles.commentInput}>
              <Text style={styles.inputLabel}>Nhận xét:</Text>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={newReview.comment}
                onChangeText={(text) => 
                  setNewReview(prev => ({ ...prev, comment: text }))
                }
                multiline
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity
              style={styles.submitReviewButton}
              onPress={handleSubmitReview}
            >
              <Text style={styles.submitReviewText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    minWidth: 50,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reviewsSection: {
    marginBottom: 100,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerInitial: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
  },
  addToCartText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  commentInput: {
    marginBottom: 20,
  },
  commentTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitReviewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductDetailScreen;