# Hướng Dẫn Test API

## 🚀 Bắt Đầu Nhanh

### 1. Setup Database
```bash
# Chạy script SQL trong SSMS
# File: database_script.sql
```

### 2. Khởi động Server
```bash
cd backend
npm install
npm run dev
```

### 3. Truy cập Swagger UI
```
http://localhost:3000/api-docs
```

## 📝 Test Flow với Swagger

### Bước 1: Login để lấy Token

1. **Mở Swagger UI**: `http://localhost:3000/api-docs`

2. **Tìm endpoint**: `POST /api/auth/login`

3. **Click "Try it out"**

4. **Nhập thông tin login**:
   ```json
   {
     "email": "admin@evmarketplace.com",
     "password": "admin123"
   }
   ```
   Hoặc dùng member account:
   ```json
   {
     "email": "member@evmarketplace.com",
     "password": "member123"
   }
   ```

5. **Click "Execute"**

6. **Copy token từ response**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": {...},
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Copy cái này
     }
   }
   ```

### Bước 2: Authorize trong Swagger

1. **Click nút "Authorize"** ở đầu trang Swagger (biểu tượng ổ khóa)

2. **Nhập token**:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **Lưu ý**: Phải có từ "Bearer " (có dấu cách) trước token

3. **Click "Authorize"** và **"Close"**

### Bước 3: Test các Endpoints

#### 🔐 Authentication Endpoints

**Register New User:**
```
POST /api/auth/register
```
```json
{
  "email": "test@example.com",
  "password": "test123",
  "fullName": "Test User",
  "phone": "0123456789"
}
```

**Get Profile:**
```
GET /api/auth/profile
```
(Cần token)

**Update Profile:**
```
PUT /api/auth/profile
```
```json
{
  "fullName": "Updated Name",
  "phone": "0987654321"
}
```

#### 🏷️ Brand Endpoints

**Get All Brands:**
```
GET /api/brands
```

**Create Brand (Admin only):**
```
POST /api/brands
```
```json
{
  "brandName": "Porsche"
}
```

#### 🚗 Car Endpoints

**Get All Cars:**
```
GET /api/cars
```

**Search Cars:**
```
GET /api/cars/search?brandId=1&minYear=2022&maxPrice=50000
```

**Create Car (Admin only):**
```
POST /api/cars
```
```json
{
  "brandId": 1,
  "model": "Model S",
  "year": 2023,
  "batteryCapacity": 100,
  "kilometers": 0,
  "description": "Brand new Tesla Model S",
  "status": "Active"
}
```

#### 🔋 Pin Endpoints

**Get All Pins:**
```
GET /api/pins
```

**Search Pins:**
```
GET /api/pins/search?minCapacity=50&maxCapacity=100
```

#### 📋 Listing Endpoints

**Get All Listings:**
```
GET /api/listings
```

**Search Listings:**
```
GET /api/listings/search?listingType=Car&minPrice=10000&maxPrice=100000
```

**Create Listing:**
```
POST /api/listings
```
```json
{
  "carId": 1,
  "listingType": "Car",
  "title": "Tesla Model 3 2022 - Excellent Condition",
  "description": "Well maintained Tesla Model 3 with full service history",
  "price": 35000
}
```

**Get My Listings:**
```
GET /api/listings/user/my-listings
```

#### 💰 Auction Endpoints

**Place Bid:**
```
POST /api/auctions/1/bid
```
```json
{
  "listingId": 1,
  "bidPrice": 36000
}
```

**Get Highest Bid:**
```
GET /api/auctions/1/highest-bid
```

**Get My Bids:**
```
GET /api/auctions/user/my-bids
```

#### 🛒 Order Endpoints

**Create Order:**
```
POST /api/orders
```
```json
{
  "listingId": 1,
  "orderType": "BuyNow"
}
```

**Get My Orders:**
```
GET /api/orders/user/my-orders?type=all
```
Query params:
- `type`: "all" | "buyer" | "seller"

**Update Order Status:**
```
PUT /api/orders/1/status
```
```json
{
  "status": "Confirmed"
}
```

#### 💳 Payment Endpoints

**Create Payment:**
```
POST /api/payments
```
```json
{
  "orderId": 1,
  "amount": 35000,
  "paymentMethod": "BankTransfer"
}
```

**Get My Payments:**
```
GET /api/payments/user/my-payments
```

#### ⭐ Review Endpoints

**Create Review:**
```
POST /api/reviews
```
```json
{
  "orderId": 1,
  "revieweeId": 2,
  "rating": 5,
  "comment": "Great seller! Fast response and good communication."
}
```

**Get User Reviews:**
```
GET /api/reviews/user/2
```

**Get User Rating:**
```
GET /api/reviews/user/2/rating
```

#### ❤️ Favorite Endpoints

**Add to Favorites:**
```
POST /api/favorites/1
```

**Get My Favorites:**
```
GET /api/favorites
```

**Remove from Favorites:**
```
DELETE /api/favorites/1
```

#### 🔔 Notification Endpoints

**Get Notifications:**
```
GET /api/notifications
```

**Get Unread Count:**
```
GET /api/notifications/unread-count
```

**Mark as Read:**
```
PUT /api/notifications/1/read
```

**Mark All as Read:**
```
PUT /api/notifications/mark-all-read
```

#### 🤖 AI Endpoints

**Get Price Suggestion:**
```
POST /api/ai/price-suggestion
```
```json
{
  "listingType": "Car",
  "brandId": 1,
  "model": "Model 3",
  "year": 2022,
  "batteryCapacity": 75,
  "kilometers": 15000,
  "condition": "Good"
}
```

**Get Market Analysis:**
```
GET /api/ai/market-analysis?listingType=Car&brandId=1&model=Model 3
```

#### 👨‍💼 Admin Endpoints (Admin only)

**Get Dashboard Stats:**
```
GET /api/admin/dashboard
```

**Get Pending Approvals:**
```
GET /api/admin/approvals
```

**Approve Listing:**
```
PUT /api/listings/1/approval
```
```json
{
  "approved": true
}
```

**Bulk Approve Listings:**
```
POST /api/admin/approvals/bulk
```
```json
{
  "listingIds": [1, 2, 3],
  "approved": true
}
```

**Get All Users:**
```
GET /api/users
```

**Update User Status:**
```
PUT /api/users/2/status
```
```json
{
  "status": "Suspended"
}
```

**Get System Settings:**
```
GET /api/admin/settings
```

## 📊 Test Scenarios

### Scenario 1: User Registration & Login
1. Register new user
2. Login with credentials
3. Get profile
4. Update profile

### Scenario 2: Browse & Search
1. Get all brands
2. Search cars by brand
3. View car details
4. Search listings

### Scenario 3: Create Listing
1. Login as member
2. Create car listing
3. Upload images (if configured)
4. Wait for admin approval

### Scenario 4: Admin Approval Flow
1. Login as admin
2. Get pending listings
3. Review listing details
4. Approve or reject

### Scenario 5: Auction Flow
1. Login as buyer
2. Find listing
3. Place bid
4. Check highest bid
5. Seller ends auction
6. Winner creates order

### Scenario 6: Purchase Flow
1. Login as buyer
2. Find listing
3. Create order (BuyNow)
4. Make payment
5. Seller confirms shipment
6. Buyer confirms delivery
7. Leave review

### Scenario 7: Favorite Management
1. Browse listings
2. Add to favorites
3. View favorites
4. Remove from favorites

## 🧪 Sample Test Data

### Valid Credentials
```
Admin:
- Email: admin@evmarketplace.com
- Password: admin123

Member:
- Email: member@evmarketplace.com
- Password: member123
```

### Brand IDs (if using sample data)
- 1: Tesla
- 2: VinFast
- 3: BYD
- 4: Hyundai
- 5: Nissan

### Sample Car IDs (if using sample data)
- 1: Tesla Model 3 2022
- 2: VinFast VF e34 2023
- 3: BYD Atto 3 2023

## 🔍 Common Issues

### Issue: "Invalid token"
**Solution**: 
1. Login lại để lấy token mới
2. Đảm bảo có "Bearer " trước token
3. Check token chưa expire (default 7 days)

### Issue: "Insufficient permissions"
**Solution**: 
- Login với admin account cho admin endpoints
- Check user role trong database

### Issue: "Listing not found"
**Solution**: 
- Create listing trước
- Check listing ID có đúng không
- Verify listing status = 'Active'

### Issue: "Cannot place bid on your own listing"
**Solution**: 
- Login với account khác
- Không thể bid listing của chính mình

## 📱 Test với Postman

Nếu muốn dùng Postman thay vì Swagger:

1. **Import Collection**:
   - Base URL: `http://localhost:3000/api`
   - Add Authorization header: `Bearer <token>`

2. **Environment Variables**:
   ```
   BASE_URL: http://localhost:3000/api
   TOKEN: (paste token sau khi login)
   ```

3. **Pre-request Script** (tự động add token):
   ```javascript
   pm.request.headers.add({
       key: 'Authorization',
       value: 'Bearer ' + pm.environment.get('TOKEN')
   });
   ```

## 🎯 Performance Testing

### Load Test với curl
```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/health

# Test listings endpoint
ab -n 100 -c 5 http://localhost:3000/api/listings
```

## 📝 Notes

- Tất cả responses có format:
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": {...}
  }
  ```

- Pagination format:
  ```json
  {
    "data": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
  ```

- Error format:
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "Detailed error"
  }
  ```

Happy Testing! 🚀
