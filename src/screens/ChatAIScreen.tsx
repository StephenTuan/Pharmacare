import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../store/hooks';
import { Product } from '../types';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
}

const ChatAIScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là AI Pharmacist, trợ lý tư vấn sức khỏe của bạn. Tôi có thể giúp bạn:\n\n• Tư vấn về triệu chứng bệnh\n• Gợi ý loại thuốc phù hợp\n• Thông tin về sản phẩm\n• Hướng dẫn sử dụng thuốc\n\nBạn có thể hỏi tôi bất cứ điều gì về sức khỏe!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { products } = useAppSelector(state => state.products);

  useEffect(() => {
     // Auto scroll to bottom when new message is added
     if (messages.length > 0) {
       setTimeout(() => {
         flatListRef.current?.scrollToEnd({ animated: true });
       }, 100);
     }
   }, [messages]);

   const analyzeSymptoms = (text: string): { response: string; suggestedProducts: Product[] } => {
     const lowerText = text.toLowerCase();
     let response = '';
     let suggestedProducts: Product[] = [];

     // Triệu chứng đau đầu
     if (lowerText.includes('đau đầu') || lowerText.includes('nhức đầu') || lowerText.includes('đau nửa đầu')) {
       response = 'Đau đầu có thể do nhiều nguyên nhân như căng thẳng, mệt mỏi, thiếu ngủ. Tôi gợi ý một số loại thuốc giảm đau phù hợp:';
       suggestedProducts = products.filter(p => 
         p.name.toLowerCase().includes('paracetamol') || 
         p.name.toLowerCase().includes('aspirin') ||
         p.description.toLowerCase().includes('giảm đau')
       ).slice(0, 3);
     }
     // Triệu chứng ho
     else if (lowerText.includes('ho') || lowerText.includes('cảm lạnh') || lowerText.includes('cảm cúm')) {
       response = 'Ho có thể do cảm lạnh, cảm cúm hoặc viêm họng. Dưới đây là một số sản phẩm có thể giúp bạn:';
       suggestedProducts = products.filter(p => 
         p.name.toLowerCase().includes('siro ho') || 
         p.name.toLowerCase().includes('cảm cúm') ||
         p.description.toLowerCase().includes('ho')
       ).slice(0, 3);
     }
     // Triệu chứng đau bụng
     else if (lowerText.includes('đau bụng') || lowerText.includes('đau dạ dày') || lowerText.includes('tiêu hóa')) {
       response = 'Đau bụng có thể do rối loạn tiêu hóa, ăn uống không hợp lý. Một số sản phẩm hỗ trợ tiêu hóa:';
       suggestedProducts = products.filter(p => 
         p.description.toLowerCase().includes('tiêu hóa') ||
         p.description.toLowerCase().includes('dạ dày')
       ).slice(0, 3);
     }
     // Triệu chứng sốt
     else if (lowerText.includes('sốt') || lowerText.includes('nóng sốt')) {
       response = 'Sốt là dấu hiệu cơ thể đang chống lại nhiễm trùng. Dưới đây là thuốc hạ sốt an toàn:';
       suggestedProducts = products.filter(p => 
         p.name.toLowerCase().includes('paracetamol') ||
         p.description.toLowerCase().includes('hạ sốt')
       ).slice(0, 3);
     }
     // Tăng cường sức đề kháng
     else if (lowerText.includes('tăng cường') || lowerText.includes('sức đề kháng') || lowerText.includes('vitamin')) {
       response = 'Để tăng cường sức đề kháng, bạn có thể sử dụng các sản phẩm vitamin và thực phẩm chức năng:';
       suggestedProducts = products.filter(p => 
         p.name.toLowerCase().includes('vitamin') ||
         p.category === 'Thực phẩm chức năng'
       ).slice(0, 3);
     }
     // Chăm sóc da
     else if (lowerText.includes('da') || lowerText.includes('mụn') || lowerText.includes('làm đẹp')) {
       response = 'Chăm sóc da cần sự kiên trì và sản phẩm phù hợp. Dưới đây là một số gợi ý:';
       suggestedProducts = products.filter(p => 
         p.category === 'Sản phẩm làm đẹp' ||
         p.description.toLowerCase().includes('da')
       ).slice(0, 3);
     }
     // Câu hỏi chung
     else {
       response = 'Tôi hiểu bạn đang quan tâm đến sức khỏe. Để tư vấn chính xác hơn, bạn có thể mô tả cụ thể triệu chứng như:\n\n• Đau đầu, nhức đầu\n• Ho, cảm lạnh\n• Đau bụng, tiêu hóa\n• Sốt, nóng sốt\n• Tăng cường sức đề kháng\n• Chăm sóc da\n\nHoặc bạn có thể hỏi về bất kỳ sản phẩm nào trong cửa hàng!';
       suggestedProducts = products.slice(0, 3); // Show some popular products
     }

     return { response, suggestedProducts };
   };

   const sendMessage = async () => {
     if (!inputText.trim()) return;

     const userMessage: Message = {
       id: Date.now().toString(),
       text: inputText.trim(),
       isUser: true,
       timestamp: new Date(),
     };

     setMessages(prev => [...prev, userMessage]);
     setInputText('');
     setIsTyping(true);

     // Simulate AI thinking time
     setTimeout(() => {
       const { response, suggestedProducts } = analyzeSymptoms(userMessage.text);
       
       const aiMessage: Message = {
         id: (Date.now() + 1).toString(),
         text: response,
         isUser: false,
         timestamp: new Date(),
         products: suggestedProducts.length > 0 ? suggestedProducts : undefined,
       };

       setMessages(prev => [...prev, aiMessage]);
       setIsTyping(false);
     }, 1500);
   };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        {!item.isUser && (
          <View style={styles.aiHeader}>
            <Icon name="smart-toy" size={16} color="#00A86B" />
            <Text style={styles.aiName}>AI Pharmacist</Text>
          </View>
        )}
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        {item.products && item.products.length > 0 && (
          <View style={styles.productsContainer}>
            <Text style={styles.productsTitle}>Sản phẩm gợi ý:</Text>
            {item.products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
                </View>
                <Icon name="arrow-forward-ios" size={16} color="#00A86B" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <View style={styles.aiHeader}>
          <Icon name="smart-toy" size={16} color="#00A86B" />
          <Text style={styles.aiName}>AI Pharmacist</Text>
        </View>
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Đang suy nghĩ</Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#00A86B" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="smart-toy" size={24} color="#fff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Pharmacist</Text>
            <Text style={styles.headerSubtitle}>Trợ lý tư vấn sức khỏe thông minh</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi về triệu chứng hoặc loại thuốc..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Icon name="send" size={20} color={!inputText.trim() ? '#ccc' : '#fff'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          💡 Thông tin chỉ mang tính tham khảo. Hãy tham khảo bác sĩ để có chẩn đoán chính xác.
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#00A86B',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00A86B',
    marginLeft: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  productsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00A86B',
    marginBottom: 8,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 13,
    color: '#00A86B',
    fontWeight: 'bold',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A86B',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#00A86B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatAIScreen;