# PharmaCare - Ứng dụng bán thuốc tây

Ứng dụng React Native cho việc mua bán thuốc tây trực tuyến với đầy đủ tính năng từ đăng ký, đăng nhập đến mua hàng và thanh toán.

## Tính năng chính

### 🔐 Xác thực người dùng
- Màn hình Splash với kiểm tra trạng thái đăng nhập
- Đăng ký tài khoản mới với validation
- Đăng nhập với email/password
- Lưu trữ thông tin người dùng với AsyncStorage

### 🏠 Trang chủ và Navigation
- Bottom Tab Navigation với 4 tab:
  - **Trang chủ**: Danh sách sản phẩm với tìm kiếm
  - **Danh mục**: Phân loại sản phẩm theo danh mục
  - **Yêu thích**: Quản lý sản phẩm yêu thích
  - **Tài khoản**: Thông tin cá nhân và cài đặt

### 💊 Quản lý sản phẩm
- Hiển thị danh sách sản phẩm từ REST API
- Tìm kiếm sản phẩm theo tên và danh mục
- Chi tiết sản phẩm với hình ảnh, mô tả, giá cả
- Đánh giá và nhận xét sản phẩm
- Thêm/xóa sản phẩm yêu thích

### 🛒 Giỏ hàng và Thanh toán
- Thêm sản phẩm vào giỏ hàng
- Quản lý số lượng sản phẩm trong giỏ
- Tính toán tổng tiền và phí vận chuyển
- Quy trình thanh toán hoàn chỉnh
- Nhiều phương thức thanh toán (COD, chuyển khoản, ví điện tử)

## Cài đặt và Chạy ứng dụng

### Yêu cầu hệ thống
- Node.js >= 20
- React Native CLI
- Android Studio (cho Android)
- Xcode (cho iOS - chỉ trên macOS)

### Cài đặt dependencies
```bash
npm install
```

### Chạy JSON Server (Backend)
```bash
# Chạy JSON server trên port 3001
npm run json-server

# Hoặc chạy đồng thời JSON server và React Native
npm run dev
```

### Chạy ứng dụng

#### Android
```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy Android
npm run android
```

#### iOS
```bash
# Cài đặt pods (chỉ cần chạy 1 lần)
cd ios && pod install && cd ..

# Chạy iOS
npm run ios
```

## Dữ liệu mẫu

### Tài khoản test:
- **Admin**: admin@pharmacare.vn / 123456
- **User**: user@example.com / 123456

### Sản phẩm mẫu:
- Paracetamol 500mg - 25,000đ
- Vitamin C 1000mg - 150,000đ
- Amoxicillin 500mg - 45,000đ
- Omega-3 Fish Oil - 320,000đ
- Gel rửa tay khô - 35,000đ
- Kem chống nắng SPF 50+ - 180,000đ
- Nhiệt kế điện tử - 250,000đ
- Thuốc ho Prospan - 85,000đ

## Công nghệ sử dụng

- **React Native 0.81.1** - Framework chính
- **TypeScript** - Type safety
- **React Navigation 6** - Navigation system
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **React Native Vector Icons** - Icon library
- **JSON Server** - Mock REST API

## Troubleshooting

### Lỗi thường gặp:

1. **Metro bundler không khởi động được**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build failed**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **iOS build failed**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **JSON Server không kết nối được**
   - Kiểm tra port 3001 có bị chiếm không
   - Đảm bảo file db.json tồn tại
   - Kiểm tra firewall settings

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
