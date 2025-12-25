# Secondhand Website Server

Backend API cho ứng dụng website bán đồ cũ.

## Cài đặt

```bash
npm install
```

## Cấu hình

Tạo file `.env` trong thư mục root:

```env
PORT=4040
MONGO_URI=mongodb://localhost:27017/secondhand-db
JWT_SECRET=your-secret-key-here
```

## Chạy ứng dụng

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Tạo tài khoản mẫu

Chạy script để tạo 3 tài khoản mẫu (admin, user, seller):

```bash
npm run seed
```

Sau khi chạy, bạn sẽ có 3 tài khoản:

- **Admin**: admin@test.com / admin123
- **User**: user@test.com / user123  
- **Seller**: seller@test.com / seller123

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập

### Request/Response

**Register:**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user" // optional, default: "user"
}
```

**Login:**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "jwt-token",
  "role": "user",
  "email": "user@example.com"
}
```

## Roles

- **admin**: Quản trị viên hệ thống
- **user**: Người dùng thông thường
- **seller**: Người bán hàng
