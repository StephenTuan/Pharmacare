import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { cartAPI, ordersAPI, authAPI } from '../services/api';
import { CartItem, User, RootStackParamList } from '../types';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

interface Props {
  navigation: CheckoutScreenNavigationProp;
}

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [items, currentUser] = await Promise.all([
        cartAPI.getCart(),
        authAPI.getCurrentUser(),
      ]);
      setCartItems(items);
      setUser(currentUser);
      setShippingAddress(currentUser?.address || '');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      navigation.goBack();
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500000 ? 0 : 30000; // Miễn phí ship cho đơn >= 500k
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    setLoading(true);
    try {
      await ordersAPI.create({
        userId: user!.id,
        items: cartItems,
        total: calculateTotal(),
        status: 'pending',
        shippingAddress,
      });

      await cartAPI.clearCart();
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt hàng, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('Main');
  };

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      icon: 'local-shipping',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    },
    {
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      icon: 'account-balance',
      description: 'Chuyển khoản qua ngân hàng',
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: 'account-balance-wallet',
      description: 'Thanh toán qua ví điện tử MoMo',
    },
  ];

  const renderCartSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Đơn hàng ({cartItems.length} sản phẩm)</Text>
      {cartItems.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
          <Text style={styles.itemPrice}>
            {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
          </Text>
        </View>
      ))}
    </View>
  );

  const renderShippingInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Người nhận</Text>
        <TextInput
          style={styles.input}
          value={user?.name || ''}
          editable={false}
          placeholder="Tên người nhận"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={user?.phone || ''}
          editable={false}
          placeholder="Số điện thoại"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={shippingAddress}
          onChangeText={setShippingAddress}
          placeholder="Nhập địa chỉ chi tiết..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            paymentMethod === method.id && styles.paymentMethodSelected,
          ]}
          onPress={() => setPaymentMethod(method.id)}
        >
          <View style={styles.paymentMethodLeft}>
            <Icon name={method.icon} size={24} color="#2196F3" />
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              <Text style={styles.paymentMethodDesc}>{method.description}</Text>
            </View>
          </View>
          <Icon
            name={paymentMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={20}
            color={paymentMethod === method.id ? '#2196F3' : '#ccc'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tạm tính:</Text>
        <Text style={styles.summaryValue}>
          {calculateSubtotal().toLocaleString('vi-VN')}đ
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
        <Text style={styles.summaryValue}>
          {calculateShipping() === 0 ? 'Miễn phí' : `${calculateShipping().toLocaleString('vi-VN')}đ`}
        </Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Tổng cộng:</Text>
        <Text style={styles.totalValue}>
          {calculateTotal().toLocaleString('vi-VN')}đ
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCartSummary()}
        {renderShippingInfo()}
        {renderPaymentMethods()}
        {renderOrderSummary()}
      </ScrollView>
      
      <View style={styles.bottomSection}>
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>
            Tổng: {calculateTotal().toLocaleString('vi-VN')}đ
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Icon name="check-circle" size={60} color="#4CAF50" />
            <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
            <Text style={styles.successMessage}>
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.successButtonText}>Về trang chủ</Text>
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentMethodSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodInfo: {
    marginLeft: 15,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  bottomSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  placeOrderButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;