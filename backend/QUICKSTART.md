# 🚀 Quick Start Guide

## Bước 1: Cài Đặt SQL Server

### Windows
1. Download SQL Server Express (miễn phí): https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Chọn "Basic" installation
3. Download SQL Server Management Studio (SSMS): https://aka.ms/ssmsfullsetup

### Kiểm tra SQL Server đã cài đặt
```powershell
# Mở PowerShell và chạy:
Get-Service -Name MSSQL*
```

## Bước 2: Setup Database

### Cách 1: Dùng SSMS (Khuyến nghị)
1. Mở SQL Server Management Studio
2. Kết nối với server: `localhost\SQLEXPRESS` (Windows Authentication)
3. File > Open > File > chọn `database_script.sql`
4. Click Execute (F5)

### Cách 2: Dùng sqlcmd
```bash
sqlcmd -S localhost\SQLEXPRESS -i database_script.sql
```

## Bước 3: Cấu hình Backend

### 3.1. Tạo file `.env`

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DB_SERVER=localhost\\SQLEXPRESS
DB_NAME=MarketplaceDB
DB_PORT=1433

# Nếu dùng SQL Authentication (không khuyến nghị cho dev)
# DB_USER=sa
# DB_PASSWORD=YourPassword

# JWT
JWT_SECRET=my-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.2. Cài đặt dependencies

```bash
cd backend
npm install
```

## Bước 4: Khởi động Server

```bash
npm run dev
```

Bạn sẽ thấy:
```
🚀 Server is running on port 3000
📊 Environment: development
🔗 API Base URL: http://localhost:3000/api
🏥 Health Check: http://localhost:3000/health
Connected to SQL Server database
```

## Bước 5: Test API với Swagger

1. **Mở trình duyệt:**
   ```
   http://localhost:3000/api-docs
   ```

2. **Login để lấy token:**
   - Tìm `POST /api/auth/login`
   - Click "Try it out"
   - Nhập:
     ```json
     {
       "email": "admin@evmarketplace.com",
       "password": "admin123"
     }
     ```
   - Click "Execute"
   - Copy token từ response

3. **Authorize:**
   - Click nút "Authorize" ở đầu trang
   - Nhập: `Bearer <your-token>`
   - Click "Authorize"

4. **Test các endpoints:**
   - Giờ bạn có thể test tất cả API!

## 🎯 Test Nhanh

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

### Test 2: Get Brands
```bash
curl http://localhost:3000/api/brands
```

### Test 3: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evmarketplace.com","password":"admin123"}'
```

## 📝 Default Accounts

```
Admin Account:
  Email: admin@evmarketplace.com
  Password: admin123

Member Account:
  Email: member@evmarketplace.com
  Password: member123
```

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to database"

**Giải pháp 1: Kiểm tra SQL Server đang chạy**
```powershell
# Mở Services (Win + R > services.msc)
# Tìm "SQL Server (SQLEXPRESS)"
# Click Start nếu chưa chạy
```

**Giải pháp 2: Enable TCP/IP**
1. Mở SQL Server Configuration Manager
2. SQL Server Network Configuration > Protocols for SQLEXPRESS
3. Right-click TCP/IP > Enable
4. Restart SQL Server service

**Giải pháp 3: Kiểm tra server name**
```sql
-- Trong SSMS, chạy:
SELECT @@SERVERNAME
```

### Lỗi: "Login failed for user"

**Nếu dùng Windows Authentication:**
- Xóa hoặc comment dòng `DB_USER` và `DB_PASSWORD` trong `.env`
- Update `backend/config/database.js`:
  ```javascript
  // Thay:
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Bằng:
  options: {
      encrypt: true,
      trustServerCertificate: true,
      trustedConnection: true  // Thêm dòng này
  }
  ```

### Lỗi: "Port 3000 is already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi port trong .env
PORT=3001
```

### Lỗi: Module not found

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📚 Tài Liệu Chi Tiết

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Hướng dẫn setup database chi tiết
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Hướng dẫn test API
- [README.md](./README.md) - Tài liệu đầy đủ về API

## 🎉 Xong!

Bây giờ bạn có thể:
- ✅ Truy cập Swagger UI: http://localhost:3000/api-docs
- ✅ Test tất cả API endpoints
- ✅ Xem API documentation
- ✅ Develop frontend application

## 📞 Cần Giúp Đỡ?

Nếu gặp vấn đề:
1. Check logs trong terminal
2. Check SQL Server logs trong SSMS
3. Verify database connection trong SSMS
4. Check file `.env` configuration
