import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Order, RootStackParamList } from '../types';

type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

interface Props {
  navigation: OrderDetailScreenNavigationProp;
  route: OrderDetailScreenRouteProp;
}

const OrderDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:3001/orders/${orderId}`);
      const orderData = await response.json();
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      default: return status;
    }
  };

  const calculateLoyaltyPoints = (total: number) => {
    if (total < 50000) return 0;
    if (total < 200000) return 1;
    if (total < 500000) return 2;
    return 3;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const loyaltyPoints = calculateLoyaltyPoints(order.total);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.addressContainer}>
            <Icon name="location-on" size={20} color="#00A86B" />
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image
                source={{ uri: item.product.thumbnail }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemCategory}>{item.product.category}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>
                    {item.product.price.toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemTotal}>
                {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{order.total.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>Miễn phí</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{order.total.toLocaleString('vi-VN')}đ</Text>
            </View>
            {loyaltyPoints > 0 && (
              <View style={styles.loyaltyRow}>
                <Icon name="stars" size={16} color="#FFD700" />
                <Text style={styles.loyaltyText}>
                  Bạn đã nhận được {loyaltyPoints} điểm tích lũy từ đơn hàng này
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: '#4CAF50' }]}>
                <Icon name="check" size={16} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Đặt hàng thành công</Text>
                <Text style={styles.timelineDate}>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
            
            {['confirmed', 'shipped', 'delivered'].includes(order.status) && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: '#2196F3' }]}>
                  <Icon name="check" size={16} color="#fff" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Đã xác nhận</Text>
                  <Text style={styles.timelineDate}>Đang xử lý</Text>
                </View>
              </View>
            )}
            
            {['shipped', 'delivered'].includes(order.status) && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: '#9C27B0' }]}>
                  <Icon name="local-shipping" size={16} color="#fff" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Đang giao hàng</Text>
                  <Text style={styles.timelineDate}>Đang trên đường giao</Text>
                </View>
              </View>
            )}
            
            {order.status === 'delivered' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="done-all" size={16} color="#fff" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Đã giao hàng</Text>
                  <Text style={styles.timelineDate}>Giao hàng thành công</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00A86B',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#00A86B',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
  loyaltyText: {
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 8,
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default OrderDetailScreen;