# Hướng dẫn khắc phục lỗi đăng nhập

## 🔍 Vấn đề đã được khắc phục

Vấn đề đăng nhập không thành công đã được giải quyết. Nguyên nhân chính là:

### ❌ Vấn đề ban đầu:
- **BASE_URL** trong `src/services/api.ts` đang sử dụng `http://localhost:3001`
- Trên Android emulator/device, `localhost` không trỏ đến máy tính host
- JSON server không thể truy cập được từ ứng dụng

### ✅ Giải pháp đã áp dụng:
1. **Cập nhật BASE_URL**: Thay đổi từ `localhost` thành IP thực của máy
2. **Khởi động lại JSON server**: Đảm bảo server chạy với cấu hình đúng
3. **Test kết nối**: Xác nhận API có thể truy cập được

## 🛠️ Cấu hình hiện tại

### API Configuration (src/services/api.ts):
```typescript
// const BASE_URL = 'http://10.0.2.2:3001'; // For Android Emulator
const BASE_URL = 'http://192.168.31.79:3001'; // For physical device on same network
```

### JSON Server:
- **Port**: 3001
- **Host**: 0.0.0.0 (cho phép truy cập từ mọi IP)
- **Status**: ✅ Đang chạy
- **Endpoints**: 
  - http://192.168.31.79:3001/users
  - http://192.168.31.79:3001/products
  - http://192.168.31.79:3001/reviews
  - http://192.168.31.79:3001/orders

## 📱 Tài khoản test có sẵn

### Admin:
- **Email**: admin@pharmacare.vn
- **Password**: 123456

### User:
- **Email**: user@example.com
- **Password**: 123456

## 🔧 Cách khắc phục cho các trường hợp khác

### Nếu sử dụng Android Emulator:
```typescript
const BASE_URL = 'http://10.0.2.2:3001';
```

### Nếu sử dụng thiết bị thật:
1. Kiểm tra IP của máy tính:
   ```bash
   ipconfig
   ```
2. Cập nhật BASE_URL:
   ```typescript
   const BASE_URL = 'http://[YOUR_IP]:3001';
   ```

### Nếu sử dụng iOS Simulator:
```typescript
const BASE_URL = 'http://localhost:3001'; // iOS Simulator có thể dùng localhost
```

## 🚀 Cách chạy ứng dụng

1. **Khởi động JSON Server**:
   ```bash
   npm run json-server
   ```

2. **Khởi động React Native** (terminal khác):
   ```bash
   npm start
   ```

3. **Chạy trên Android**:
   ```bash
   npm run android
   ```

## 🔍 Debug tips

### Kiểm tra kết nối API:
```bash
# Test từ máy tính
curl http://192.168.31.79:3001/users

# Hoặc mở browser
http://192.168.31.79:3001/users
```

### Kiểm tra JSON Server logs:
- Xem terminal đang chạy JSON server
- Kiểm tra có request nào đến không
- Xem có lỗi CORS không

### Kiểm tra React Native logs:
```bash
# Android
npx react-native log-android

# iOS  
npx react-native log-ios
```

## 📋 Checklist khi gặp lỗi đăng nhập

- [ ] JSON Server đang chạy?
- [ ] BASE_URL đúng với môi trường (emulator/device)?
- [ ] Firewall có block port 3001 không?
- [ ] Thiết bị và máy tính cùng mạng WiFi?
- [ ] Tài khoản test có tồn tại trong db.json?
- [ ] Network request có thành công không? (check logs)

## 🎯 Kết quả

Sau khi áp dụng các thay đổi trên, ứng dụng sẽ có thể:
- ✅ Kết nối thành công đến JSON Server
- ✅ Đăng nhập với tài khoản có sẵn
- ✅ Tải danh sách sản phẩm
- ✅ Thực hiện các chức năng khác

---

**Lưu ý**: Nếu vẫn gặp vấn đề, hãy kiểm tra lại cấu hình mạng và đảm bảo JSON Server đang chạy đúng cách.