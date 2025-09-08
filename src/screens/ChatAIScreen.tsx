import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button } from '../components';

const ChatAIScreen: React.FC = () => {
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);

  React.useEffect(() => {
    // Pulse animation for the AI icon
    pulseAnimation.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 15 }),
        withSpring(1, { damping: 15 })
      ),
      -1,
      false
    );

    // Rotate animation for the brain icon
    rotateAnimation.value = withRepeat(
      withSpring(360, { damping: 20, stiffness: 50 }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateAnimation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat với Bác sĩ AI</Text>
        <Text style={styles.headerSubtitle}>Tư vấn sức khỏe 24/7</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.comingSoonCard} variant="gradient" gradientColors={['#E8F5E8', '#F0F8F0']}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.aiIconContainer, pulseStyle]}>
              <Icon name="smart-toy" size={60} color="#00A86B" />
            </Animated.View>
            <Animated.View style={[styles.brainIconContainer, rotateStyle]}>
              <Icon name="psychology" size={40} color="#00C851" />
            </Animated.View>
          </View>
          
          <Text style={styles.comingSoonTitle}>Tính năng đang phát triển</Text>
          <Text style={styles.comingSoonDescription}>
            Chúng tôi đang xây dựng hệ thống AI thông minh để tư vấn sức khỏe cho bạn.
            Sẽ sớm ra mắt với những tính năng tuyệt vời!
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#00A86B" />
              <Text style={styles.featureText}>Tư vấn triệu chứng</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#00A86B" />
              <Text style={styles.featureText}>Gợi ý thuốc phù hợp</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#00A86B" />
              <Text style={styles.featureText}>Lời khuyên sức khỏe</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#00A86B" />
              <Text style={styles.featureText}>Hỗ trợ 24/7</Text>
            </View>
          </View>
          
          <Button
            title="Thông báo khi có sẵn"
            onPress={() => {}}
            variant="primary"
            icon="notifications"
            gradient
            colors={['#00A86B', '#00C851']}
            style={styles.notifyButton}
          />
        </Card>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={24} color="#00A86B" />
            <Text style={styles.infoTitle}>Lưu ý quan trọng</Text>
          </View>
          <Text style={styles.infoText}>
            AI chỉ mang tính chất tham khảo. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa 
            để có chẩn đoán và điều trị chính xác.
          </Text>
        </Card>
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
    paddingTop: 20,
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  aiIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainIconContainer: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A86B',
    marginBottom: 15,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  notifyButton: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#00A86B',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default ChatAIScreen;