# KỊCH BẢN TEST CHI TIẾT THEO ROLE

## 🎯 Mục đích
Tài liệu này cung cấp các kịch bản test chi tiết để kiểm tra đầy đủ chức năng của từng role trong hệ thống.

---

## 🧪 Setup Environment

### Prerequisites:
1. Server đang chạy: `npm run dev` hoặc `npm start`
2. Database đã được setup và có dữ liệu mẫu
3. Có Postman hoặc Thunder Client để test API
4. Có ít nhất 2 tài khoản: 1 Admin, 1 Member

### Test Accounts:
```json
{
  "admin": {
    "email": "admin@test.com",
    "password": "admin123",
    "role": "Admin"
  },
  "member1": {
    "email": "member1@test.com",
    "password": "member123",
    "role": "Member"
  },
  "member2": {
    "email": "member2@test.com",
    "password": "member123",
    "role": "Member"
  }
}
```

---

## 📋 MEMBER ROLE - TEST SCENARIOS

### Scenario 1: Đăng ký và Đăng nhập

#### Test 1.1: Đăng ký thành công
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newmember@test.com",
  "password": "password123",
  "fullName": "New Member",
  "phone": "0123456789"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": 1,
      "email": "newmember@test.com",
      "fullName": "New Member",
      "role": "Member",
      "status": "Active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Token được trả về
- ✅ Role mặc định = "Member"
- ✅ Status = "Active"

#### Test 1.2: Đăng ký với email đã tồn tại
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newmember@test.com",
  "password": "password123",
  "fullName": "Another Member"
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Verify:**
- ✅ Status code = 400

#### Test 1.3: Đăng nhập thành công
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "newmember@test.com",
  "password": "password123"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Token được trả về
- ✅ User info chính xác

#### Test 1.4: Đăng nhập sai password
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "newmember@test.com",
  "password": "wrongpassword"
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Verify:**
- ✅ Status code = 401

---

### Scenario 2: Quản lý Profile

#### Test 2.1: Xem profile
```http
GET http://localhost:3000/api/auth/profile
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "newmember@test.com",
    "fullName": "New Member",
    "phone": "0123456789",
    "role": "Member",
    "status": "Active"
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Không có passwordHash trong response

#### Test 2.2: Cập nhật profile
```http
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "0987654321"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "Updated Name",
    "phone": "0987654321",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Dữ liệu được cập nhật

#### Test 2.3: Đổi mật khẩu
```http
POST http://localhost:3000/api/auth/change-password
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Có thể login với password mới
- ✅ Không thể login với password cũ

---

### Scenario 3: Tạo và Quản lý Listing

#### Test 3.1: Xem tất cả listings (Public)
```http
GET http://localhost:3000/api/listings?page=1&limit=10
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "listings": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Chỉ hiển thị listings đã approved
- ✅ Pagination hoạt động đúng

#### Test 3.2: Tìm kiếm listings
```http
GET http://localhost:3000/api/listings/search?listingType=Car&minPrice=10000&maxPrice=50000
```

**Verify:**
- ✅ Filter theo type hoạt động
- ✅ Filter theo price range hoạt động

#### Test 3.3: Xem chi tiết listing
```http
GET http://localhost:3000/api/listings/1
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "listingId": 1,
    "title": "Tesla Model 3",
    "price": 35000,
    "listingType": "Car",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Thông tin đầy đủ

#### Test 3.4: Tạo listing mới (Member)
```http
POST http://localhost:3000/api/listings
Authorization: Bearer {member_token}
Content-Type: multipart/form-data

{
  "carId": 1,
  "listingType": "Car",
  "title": "Xe điện Tesla Model 3 2023",
  "description": "Xe còn mới, đi 5000km",
  "price": 35000,
  "images": [file1.jpg, file2.jpg]
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "listingId": 10,
    "status": "Pending",
    "approved": false,
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Status = "Pending" (chờ admin duyệt)
- ✅ approved = false
- ✅ Images được upload lên Cloudinary

#### Test 3.5: Xem listings của mình
```http
GET http://localhost:3000/api/listings/user/my-listings
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "listingId": 10,
        "title": "Xe điện Tesla Model 3 2023",
        "status": "Pending",
        ...
      }
    ]
  }
}
```

**Verify:**
- ✅ Chỉ hiển thị listings của user đang login
- ✅ Hiển thị cả listings Pending và Approved

#### Test 3.6: Cập nhật listing của mình
```http
PUT http://localhost:3000/api/listings/10
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "title": "Tesla Model 3 2023 - Updated",
  "price": 34000
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Listing updated successfully",
  "data": { ... }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Dữ liệu được cập nhật

#### Test 3.7: Không thể cập nhật listing của người khác
```http
PUT http://localhost:3000/api/listings/5
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "title": "Try to update"
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "You can only update your own listings"
}
```

**Verify:**
- ✅ Status code = 403

#### Test 3.8: Xóa listing của mình
```http
DELETE http://localhost:3000/api/listings/10
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Listing bị xóa khỏi database

---

### Scenario 4: Đấu giá (Auction)

**Setup:** Cần có 1 listing type Auction đã được approved

#### Test 4.1: Xem lịch sử đấu giá (Public)
```http
GET http://localhost:3000/api/auctions/5/history
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "auctionId": 1,
      "bidPrice": 30000,
      "bidTime": "2024-01-15T10:30:00Z",
      "userName": "Member 1"
    },
    {
      "auctionId": 2,
      "bidPrice": 31000,
      "bidTime": "2024-01-15T11:00:00Z",
      "userName": "Member 2"
    }
  ]
}
```

**Verify:**
- ✅ Hiển thị tất cả bids theo thứ tự thời gian
- ✅ Public có thể xem

#### Test 4.2: Xem giá cao nhất
```http
GET http://localhost:3000/api/auctions/5/highest-bid
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "auctionId": 2,
    "bidPrice": 31000,
    "userName": "Member 2",
    "bidTime": "2024-01-15T11:00:00Z"
  }
}
```

#### Test 4.3: Đặt giá thầu hợp lệ
```http
POST http://localhost:3000/api/auctions/5/bid
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "bidPrice": 32000
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "auctionId": 3,
    "bidPrice": 32000,
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Bid được lưu
- ✅ Seller nhận notification

#### Test 4.4: Đặt giá thấp hơn giá hiện tại (Fail)
```http
POST http://localhost:3000/api/auctions/5/bid
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "bidPrice": 31000
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "Bid must be higher than current highest bid of $32000"
}
```

**Verify:**
- ✅ Status code = 400

#### Test 4.5: Seller không thể bid listing của mình
```http
POST http://localhost:3000/api/auctions/5/bid
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "bidPrice": 35000
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "You cannot bid on your own listing"
}
```

**Verify:**
- ✅ Status code = 400

#### Test 4.6: Xem các bids của mình
```http
GET http://localhost:3000/api/auctions/user/my-bids
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "bids": [
      {
        "auctionId": 3,
        "listingId": 5,
        "listingTitle": "Tesla Model S",
        "bidPrice": 32000,
        "status": "Active",
        ...
      }
    ]
  }
}
```

**Verify:**
- ✅ Chỉ hiển thị bids của user đang login

#### Test 4.7: Seller xem bids của listing mình
```http
GET http://localhost:3000/api/auctions/5/bids
Authorization: Bearer {seller_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "auctionId": 1,
      "bidPrice": 30000,
      "userName": "Member 1",
      ...
    },
    {
      "auctionId": 3,
      "bidPrice": 32000,
      "userName": "Member 2",
      ...
    }
  ]
}
```

**Verify:**
- ✅ Chỉ seller mới xem được
- ✅ Hiển thị tất cả bids

#### Test 4.8: Seller kết thúc auction
```http
POST http://localhost:3000/api/auctions/5/end
Authorization: Bearer {seller_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Auction ended successfully",
  "data": {
    "winner": {
      "userId": 2,
      "userName": "Member 2",
      "bidPrice": 32000
    },
    "finalPrice": 32000
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Listing status = "Sold"
- ✅ Winner nhận notification
- ✅ Order được tạo tự động

---

### Scenario 5: Tạo và Quản lý Order

#### Test 5.1: Buyer tạo order
```http
POST http://localhost:3000/api/orders
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "listingId": 3,
  "totalAmount": 25000
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 1,
    "listingId": 3,
    "buyerId": 2,
    "sellerId": 1,
    "totalAmount": 25000,
    "status": "Pending",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Order status = "Pending"
- ✅ Listing status = "Reserved"
- ✅ Seller và Buyer nhận notification

#### Test 5.2: Xem orders của mình
```http
GET http://localhost:3000/api/orders/user/my-orders
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": 1,
      "listingTitle": "Tesla Model 3",
      "totalAmount": 25000,
      "status": "Pending",
      "role": "Buyer",
      ...
    }
  ]
}
```

**Verify:**
- ✅ Hiển thị orders mà user là buyer hoặc seller
- ✅ Có field "role" để phân biệt

#### Test 5.3: Xem chi tiết order
```http
GET http://localhost:3000/api/orders/1
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "listing": { ... },
    "buyer": { ... },
    "seller": { ... },
    "totalAmount": 25000,
    "status": "Pending",
    ...
  }
}
```

**Verify:**
- ✅ Chỉ buyer hoặc seller mới xem được

#### Test 5.4: Seller confirm order
```http
PUT http://localhost:3000/api/orders/1/status
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "status": "Confirmed"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": 1,
    "status": "Confirmed",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Buyer nhận notification

#### Test 5.5: Buyer cancel order (chỉ khi Pending)
```http
PUT http://localhost:3000/api/orders/1/status
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "status": "Cancelled"
}
```

**Verify:**
- ✅ Chỉ cancel được khi status = Pending
- ✅ Listing status quay về Available

#### Test 5.6: Update order status: InProgress → Completed
```http
PUT http://localhost:3000/api/orders/1/status
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "status": "InProgress"
}
```

```http
PUT http://localhost:3000/api/orders/1/status
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "status": "Completed"
}
```

**Verify:**
- ✅ Workflow: Pending → Confirmed → InProgress → Completed
- ✅ Listing status = "Sold" khi order Completed

---

### Scenario 6: Thanh toán

#### Test 6.1: Tạo payment cho order
```http
POST http://localhost:3000/api/payments
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "orderId": 1,
  "amount": 25000,
  "paymentMethod": "CreditCard",
  "transactionId": "TXN123456789"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "paymentId": 1,
    "orderId": 1,
    "amount": 25000,
    "status": "Pending",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Chỉ buyer mới tạo được payment

#### Test 6.2: Xem payment của order
```http
GET http://localhost:3000/api/payments/order/1
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "paymentId": 1,
    "orderId": 1,
    "amount": 25000,
    "status": "Pending",
    ...
  }
}
```

**Verify:**
- ✅ Chỉ buyer hoặc seller của order mới xem được

#### Test 6.3: Xem tất cả payments của mình
```http
GET http://localhost:3000/api/payments/user/my-payments
Authorization: Bearer {buyer_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "paymentId": 1,
      "orderId": 1,
      "amount": 25000,
      "status": "Success",
      ...
    }
  ]
}
```

#### Test 6.4: Cập nhật payment status
```http
PUT http://localhost:3000/api/payments/1/status
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "status": "Success"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "paymentId": 1,
    "status": "Success",
    ...
  }
}
```

**Verify:**
- ✅ Order status cũng được cập nhật
- ✅ Seller nhận notification

---

### Scenario 7: Review & Rating

**Setup:** Order phải ở trạng thái Completed

#### Test 7.1: Buyer review Seller
```http
POST http://localhost:3000/api/reviews
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "orderId": 1,
  "revieweeId": 1,
  "rating": 5,
  "comment": "Người bán rất tốt, xe đúng mô tả!"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "reviewId": 1,
    "orderId": 1,
    "reviewerId": 2,
    "revieweeId": 1,
    "rating": 5,
    "comment": "Người bán rất tốt, xe đúng mô tả!",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Reviewee nhận notification
- ✅ Rating trung bình của seller được cập nhật

#### Test 7.2: Seller review Buyer
```http
POST http://localhost:3000/api/reviews
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "orderId": 1,
  "revieweeId": 2,
  "rating": 5,
  "comment": "Người mua uy tín, thanh toán nhanh!"
}
```

**Verify:**
- ✅ Cả 2 bên đều có thể review nhau

#### Test 7.3: Xem reviews của một user (Public)
```http
GET http://localhost:3000/api/reviews/user/1
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "reviewId": 1,
      "reviewerName": "Buyer Name",
      "rating": 5,
      "comment": "Người bán rất tốt, xe đúng mô tả!",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

**Verify:**
- ✅ Public có thể xem
- ✅ Hiển thị tất cả reviews về user này

#### Test 7.4: Xem rating trung bình (Public)
```http
GET http://localhost:3000/api/reviews/user/1/rating
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 20,
      "4": 3,
      "3": 1,
      "2": 1,
      "1": 0
    }
  }
}
```

#### Test 7.5: Xem reviews của order
```http
GET http://localhost:3000/api/reviews/order/1
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "reviewId": 1,
      "reviewerName": "Buyer Name",
      "revieweeName": "Seller Name",
      "rating": 5,
      "comment": "...",
      ...
    },
    {
      "reviewId": 2,
      "reviewerName": "Seller Name",
      "revieweeName": "Buyer Name",
      "rating": 5,
      "comment": "...",
      ...
    }
  ]
}
```

**Verify:**
- ✅ Chỉ người tham gia order mới xem được

#### Test 7.6: Cập nhật review của mình
```http
PUT http://localhost:3000/api/reviews/1
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": { ... }
}
```

**Verify:**
- ✅ Chỉ owner mới update được

#### Test 7.7: Xóa review của mình
```http
DELETE http://localhost:3000/api/reviews/1
Authorization: Bearer {buyer_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Verify:**
- ✅ Chỉ owner mới xóa được
- ✅ Rating trung bình được recalculate

#### Test 7.8: Không thể review 2 lần cho cùng order
```http
POST http://localhost:3000/api/reviews
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "orderId": 1,
  "revieweeId": 1,
  "rating": 5,
  "comment": "Second review"
}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "You have already reviewed this order"
}
```

**Verify:**
- ✅ Status code = 400

---

### Scenario 8: Favorites (Yêu thích)

#### Test 8.1: Thêm listing vào favorites
```http
POST http://localhost:3000/api/favorites/5
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Added to favorites successfully",
  "data": {
    "favoriteId": 1,
    "listingId": 5,
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201

#### Test 8.2: Xem danh sách favorites
```http
GET http://localhost:3000/api/favorites
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "favoriteId": 1,
      "listing": {
        "listingId": 5,
        "title": "Tesla Model S",
        "price": 45000,
        ...
      },
      "addedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Verify:**
- ✅ Hiển thị đầy đủ thông tin listing

#### Test 8.3: Đếm số lượng favorites
```http
GET http://localhost:3000/api/favorites/count
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### Test 8.4: Kiểm tra listing đã favorite chưa
```http
GET http://localhost:3000/api/favorites/5/check
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true,
    "favoriteId": 1
  }
}
```

#### Test 8.5: Xóa khỏi favorites
```http
DELETE http://localhost:3000/api/favorites/5
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Removed from favorites successfully"
}
```

**Verify:**
- ✅ Status code = 200
- ✅ Favorite bị xóa

---

### Scenario 9: Notifications (Thông báo)

#### Test 9.1: Xem danh sách notifications
```http
GET http://localhost:3000/api/notifications
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "notificationId": 1,
      "title": "Listing Approved",
      "message": "Your listing 'Tesla Model 3' has been approved",
      "type": "ListingApproval",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "notificationId": 2,
      "title": "New Bid",
      "message": "Someone placed a bid of $32000 on your listing",
      "type": "Auction",
      "isRead": true,
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

**Verify:**
- ✅ Sắp xếp theo thời gian mới nhất

#### Test 9.2: Đếm notifications chưa đọc
```http
GET http://localhost:3000/api/notifications/unread-count
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

#### Test 9.3: Đánh dấu đã đọc
```http
PUT http://localhost:3000/api/notifications/1/read
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Verify:**
- ✅ isRead = true

#### Test 9.4: Đánh dấu tất cả đã đọc
```http
PUT http://localhost:3000/api/notifications/mark-all-read
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

**Verify:**
- ✅ Tất cả notifications có isRead = true

#### Test 9.5: Xóa notification
```http
DELETE http://localhost:3000/api/notifications/1
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### Test 9.6: Xóa tất cả notifications
```http
DELETE http://localhost:3000/api/notifications/all
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "All notifications deleted successfully"
}
```

---

### Scenario 10: AI Features

#### Test 10.1: Gợi ý giá bán
```http
POST http://localhost:3000/api/ai/price-suggestion
Authorization: Bearer {member_token}
Content-Type: application/json

{
  "itemType": "Car",
  "brandId": 1,
  "model": "Model 3",
  "year": 2023,
  "condition": "Used",
  "mileage": 5000
}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "suggestedPrice": {
      "min": 30000,
      "max": 35000,
      "recommended": 32500
    },
    "reasoning": "Based on market analysis of similar Tesla Model 3 2023...",
    "confidence": 0.85,
    "marketTrends": {
      "averagePrice": 32000,
      "totalListings": 15,
      "demandLevel": "High"
    }
  }
}
```

**Verify:**
- ✅ AI trả về giá gợi ý hợp lý
- ✅ Có explanation

#### Test 10.2: Phân tích thị trường
```http
GET http://localhost:3000/api/ai/market-analysis
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "marketOverview": {
      "totalListings": 150,
      "averagePrice": 28000,
      "priceChange": "+5%"
    },
    "topBrands": [
      { "brand": "Tesla", "count": 50, "avgPrice": 35000 },
      { "brand": "BYD", "count": 30, "avgPrice": 25000 }
    ],
    "recommendations": [
      "Electric vehicle market is growing...",
      "Tesla vehicles have high resale value..."
    ]
  }
}
```

---

## 🔧 ADMIN ROLE - TEST SCENARIOS

### Scenario 11: Admin Dashboard & Statistics

#### Test 11.1: Xem dashboard overview
```http
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "members": 145,
      "admins": 5
    },
    "listings": {
      "total": 200,
      "pending": 15
    },
    "orders": {
      "total": 500,
      "pending": 20,
      "completed": 450
    },
    "revenue": {
      "total": 12500000,
      "transactions": 450
    }
  }
}
```

**Verify:**
- ✅ Chỉ Admin mới access được
- ✅ Hiển thị statistics đầy đủ

#### Test 11.2: Xem system overview
```http
GET http://localhost:3000/api/admin/overview?period=30
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "newUsers": 45,
    "newListings": 80,
    "newOrders": 120,
    "revenue": 3500000,
    "topBrands": [...],
    "recentActivity": [...]
  }
}
```

#### Test 11.3: Generate reports
```http
GET http://localhost:3000/api/admin/reports?type=revenue&period=30
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "type": "revenue",
    "period": "30 days",
    "generatedAt": "2024-01-15T12:00:00Z",
    "totalRevenue": 3500000,
    "commissionEarned": 175000,
    "averageTransactionValue": 29166.67,
    "revenueGrowth": 15.5
  }
}
```

**Verify:**
- ✅ Hỗ trợ nhiều report types: overview, users, listings, orders, revenue
- ✅ Có thể filter theo period

#### Test 11.4: Member không thể access admin endpoints
```http
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer {member_token}
```

**Expected Result:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**Verify:**
- ✅ Status code = 403

---

### Scenario 12: User Management

#### Test 12.1: Xem tất cả users
```http
GET http://localhost:3000/api/users?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 1,
        "email": "user1@test.com",
        "fullName": "User 1",
        "role": "Member",
        "status": "Active",
        "createdDate": "2024-01-01T00:00:00Z"
      },
      ...
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 150,
      "itemsPerPage": 20
    }
  }
}
```

**Verify:**
- ✅ Hiển thị tất cả users
- ✅ Pagination hoạt động

#### Test 12.2: Filter users theo role
```http
GET http://localhost:3000/api/users?role=Member&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Verify:**
- ✅ Chỉ hiển thị Members

#### Test 12.3: Tìm kiếm user
```http
GET http://localhost:3000/api/users/search?keyword=john
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 5,
      "email": "john@test.com",
      "fullName": "John Doe",
      ...
    }
  ]
}
```

**Verify:**
- ✅ Tìm kiếm theo email, name, phone

#### Test 12.4: Xem chi tiết user
```http
GET http://localhost:3000/api/users/5
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "userId": 5,
    "email": "john@test.com",
    "fullName": "John Doe",
    "phone": "0123456789",
    "role": "Member",
    "status": "Active",
    "stats": {
      "totalListings": 10,
      "totalOrders": 25,
      "totalSpent": 250000,
      "averageRating": 4.8
    }
  }
}
```

**Verify:**
- ✅ Hiển thị thông tin chi tiết và statistics

#### Test 12.5: User statistics
```http
GET http://localhost:3000/api/users/stats
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "totalByRole": {
      "Member": 145,
      "Admin": 5
    },
    "newUsersByMonth": [...],
    "activeVsInactive": {
      "active": 140,
      "inactive": 10
    },
    "topContributors": [...]
  }
}
```

#### Test 12.6: Update user status
```http
PUT http://localhost:3000/api/users/5/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "Inactive"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "userId": 5,
    "status": "Inactive",
    ...
  }
}
```

**Verify:**
- ✅ User nhận notification
- ✅ User không thể login nếu status = Inactive/Banned

#### Test 12.7: Ban user
```http
PUT http://localhost:3000/api/users/5/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "Banned"
}
```

**Verify:**
- ✅ User bị ban không thể login
- ✅ Tất cả listings của user bị deactivate

#### Test 12.8: Change user role
```http
PUT http://localhost:3000/api/users/5/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "Admin"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "userId": 5,
    "role": "Admin",
    ...
  }
}
```

**Verify:**
- ✅ User có quyền Admin sau khi update

---

### Scenario 13: Listing Approval (Quan trọng nhất)

#### Test 13.1: Xem tất cả listings pending
```http
GET http://localhost:3000/api/listings/admin/pending
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": [
    {
      "listingId": 10,
      "title": "Tesla Model 3 2023",
      "userId": 5,
      "userName": "John Doe",
      "price": 35000,
      "status": "Pending",
      "approved": false,
      "createdAt": "2024-01-15T10:00:00Z",
      ...
    },
    ...
  ]
}
```

**Verify:**
- ✅ Chỉ hiển thị listings chưa duyệt

#### Test 13.2: Approve listing
```http
PUT http://localhost:3000/api/listings/10/approval
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "approved": true
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Listing approved successfully",
  "data": {
    "listingId": 10,
    "approved": true,
    "status": "Active",
    ...
  }
}
```

**Verify:**
- ✅ Listing status = "Active"
- ✅ approved = true
- ✅ Seller nhận notification
- ✅ Listing xuất hiện trên marketplace

#### Test 13.3: Reject listing
```http
PUT http://localhost:3000/api/listings/11/approval
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "approved": false,
  "rejectionReason": "Thông tin không đầy đủ, thiếu hình ảnh rõ ràng"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Listing rejected successfully",
  "data": {
    "listingId": 11,
    "approved": false,
    "status": "Rejected",
    "rejectionReason": "Thông tin không đầy đủ, thiếu hình ảnh rõ ràng",
    ...
  }
}
```

**Verify:**
- ✅ Listing status = "Rejected"
- ✅ Seller nhận notification với lý do từ chối
- ✅ Seller có thể chỉnh sửa và submit lại

#### Test 13.4: Get pending approvals summary
```http
GET http://localhost:3000/api/admin/approvals
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "listings": [...],
    "count": 15
  }
}
```

#### Test 13.5: Bulk approve listings
```http
POST http://localhost:3000/api/admin/approvals/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "listingIds": [10, 11, 12, 13, 14],
  "approved": true
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Bulk operation completed: 5 successful, 0 failed",
  "data": {
    "results": [
      { "listingId": 10, "success": true, "data": {...} },
      { "listingId": 11, "success": true, "data": {...} },
      ...
    ],
    "summary": {
      "total": 5,
      "successful": 5,
      "failed": 0
    }
  }
}
```

**Verify:**
- ✅ Tất cả listings được duyệt cùng lúc
- ✅ Mỗi seller nhận notification riêng

#### Test 13.6: Bulk reject listings
```http
POST http://localhost:3000/api/admin/approvals/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "listingIds": [15, 16],
  "approved": false
}
```

**Verify:**
- ✅ Có thể reject nhiều listings cùng lúc

---

### Scenario 14: Product Catalog Management

#### Test 14.1: Tạo brand mới
```http
POST http://localhost:3000/api/brands
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Vinfast",
  "type": "Car",
  "logoUrl": "https://cloudinary.com/vinfast-logo.png",
  "description": "Vietnamese electric vehicle manufacturer"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "brandId": 10,
    "name": "Vinfast",
    "type": "Car",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Chỉ Admin mới tạo được

#### Test 14.2: Update brand
```http
PUT http://localhost:3000/api/brands/10
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "VinFast",
  "description": "Updated description"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": { ... }
}
```

#### Test 14.3: Delete brand
```http
DELETE http://localhost:3000/api/brands/10
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

**Verify:**
- ✅ Chỉ xóa được nếu không có car/pin nào sử dụng brand này

#### Test 14.4: Tạo car mới
```http
POST http://localhost:3000/api/cars
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "brandId": 1,
  "model": "Model Y",
  "year": 2024,
  "batteryCapacity": 75,
  "range": 450,
  "enginePower": 384,
  "torque": 660,
  "specifications": {
    "seats": 5,
    "drivetrain": "AWD",
    "acceleration": "3.7s"
  }
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "carId": 20,
    "brandId": 1,
    "model": "Model Y",
    ...
  }
}
```

**Verify:**
- ✅ Status code = 201
- ✅ Members có thể tạo listing dựa trên car này

#### Test 14.5: Update car
```http
PUT http://localhost:3000/api/cars/20
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "range": 460,
  "year": 2024
}
```

#### Test 14.6: Delete car
```http
DELETE http://localhost:3000/api/cars/20
Authorization: Bearer {admin_token}
```

**Verify:**
- ✅ Chỉ xóa được nếu không có listing nào sử dụng car này

#### Test 14.7: Tạo pin mới
```http
POST http://localhost:3000/api/pins
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "brandId": 5,
  "model": "Battery Pack v2",
  "capacity": 60,
  "voltage": 400,
  "cycles": 3000,
  "specifications": {
    "chemistry": "NMC",
    "warranty": "8 years"
  }
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Pin created successfully",
  "data": {
    "pinId": 15,
    ...
  }
}
```

#### Test 14.8: Update & Delete pin (tương tự car)
```http
PUT http://localhost:3000/api/pins/15
DELETE http://localhost:3000/api/pins/15
```

---

### Scenario 15: Order & Payment Management

#### Test 15.1: Xem tất cả orders
```http
GET http://localhost:3000/api/orders?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": 1,
        "buyer": {...},
        "seller": {...},
        "listing": {...},
        "totalAmount": 25000,
        "status": "Completed",
        ...
      },
      ...
    ],
    "pagination": {...}
  }
}
```

**Verify:**
- ✅ Hiển thị tất cả orders trong hệ thống
- ✅ Có thể filter theo status

#### Test 15.2: Order statistics
```http
GET http://localhost:3000/api/orders/stats
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 500,
    "ordersByStatus": {
      "Pending": 20,
      "Confirmed": 15,
      "InProgress": 10,
      "Completed": 450,
      "Cancelled": 5
    },
    "averageOrderValue": 27500,
    "completionRate": 0.90
  }
}
```

#### Test 15.3: Xem tất cả payments
```http
GET http://localhost:3000/api/payments?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "paymentId": 1,
        "orderId": 1,
        "amount": 25000,
        "paymentMethod": "CreditCard",
        "status": "Success",
        ...
      },
      ...
    ],
    "pagination": {...}
  }
}
```

#### Test 15.4: Payment statistics
```http
GET http://localhost:3000/api/payments/stats
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12500000,
    "successfulPayments": 450,
    "failedPayments": 15,
    "successRate": 0.968,
    "paymentMethods": {
      "CreditCard": 250,
      "BankTransfer": 150,
      "EWallet": 50
    },
    "commissionEarned": 625000
  }
}
```

---

### Scenario 16: Review Management

#### Test 16.1: Xem tất cả reviews
```http
GET http://localhost:3000/api/reviews?page=1&limit=20
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": 1,
        "reviewer": {...},
        "reviewee": {...},
        "order": {...},
        "rating": 5,
        "comment": "...",
        "createdAt": "...",
        ...
      },
      ...
    ],
    "pagination": {...}
  }
}
```

**Verify:**
- ✅ Hiển thị tất cả reviews
- ✅ Có thể filter theo rating

#### Test 16.2: Xóa review vi phạm
```http
DELETE http://localhost:3000/api/reviews/5
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Verify:**
- ✅ Admin có thể xóa bất kỳ review nào
- ✅ Rating trung bình được recalculate

---

### Scenario 17: Notification Management

#### Test 17.1: Tạo notification cho một user
```http
POST http://localhost:3000/api/notifications
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "userId": 5,
  "title": "System Maintenance",
  "message": "The system will be under maintenance on Jan 20, 2024",
  "type": "System"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "notificationId": 100,
    ...
  }
}
```

**Verify:**
- ✅ User 5 nhận được notification

#### Test 17.2: Gửi bulk notifications cho tất cả users
```http
POST http://localhost:3000/api/notifications/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "targetType": "All",
  "title": "New Feature Announcement",
  "message": "We've just launched AI price suggestion feature!",
  "type": "Announcement"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Bulk notifications created successfully",
  "data": {
    "totalSent": 150,
    "targetType": "All"
  }
}
```

**Verify:**
- ✅ Tất cả users nhận notification

#### Test 17.3: Gửi cho specific role
```http
POST http://localhost:3000/api/notifications/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "targetType": "Sellers",
  "title": "Seller Tips",
  "message": "Here are some tips to improve your listings...",
  "type": "Tips"
}
```

**Verify:**
- ✅ Chỉ users có listings nhận được

#### Test 17.4: Gửi cho specific users
```http
POST http://localhost:3000/api/notifications/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "targetType": "Specific",
  "userIds": [5, 10, 15, 20],
  "title": "Warning",
  "message": "Your account has been flagged for review",
  "type": "Warning"
}
```

**Verify:**
- ✅ Chỉ 4 users được chỉ định nhận notification

---

### Scenario 18: System Settings

#### Test 18.1: Xem system settings
```http
GET http://localhost:3000/api/admin/settings
Authorization: Bearer {admin_token}
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "commissionRate": 5.0,
    "maxImagesPerListing": 10,
    "maxListingTitleLength": 200,
    "maxListingDescriptionLength": 1000,
    "autoApproveThreshold": 100,
    "maintenanceMode": false,
    "registrationEnabled": true,
    "listingFee": 0.0
  }
}
```

#### Test 18.2: Update system settings
```http
PUT http://localhost:3000/api/admin/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "commissionRate": 6.0,
  "maxImagesPerListing": 15,
  "maintenanceMode": false,
  "autoApproveThreshold": 50
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "System settings updated successfully",
  "data": {
    "commissionRate": 6.0,
    "maxImagesPerListing": 15,
    ...
  }
}
```

**Verify:**
- ✅ Settings được cập nhật
- ✅ Áp dụng cho tất cả transactions mới

#### Test 18.3: Enable maintenance mode
```http
PUT http://localhost:3000/api/admin/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "maintenanceMode": true
}
```

**Verify:**
- ✅ Hệ thống chuyển sang chế độ bảo trì
- ✅ Members không thể tạo listings mới
- ✅ Hiển thị maintenance message

---

## 🎯 CHECKLIST TỔNG HỢP

### Member Role Checklist:
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Xem và cập nhật profile
- [ ] Đổi mật khẩu
- [ ] Xem danh sách listings (public)
- [ ] Tìm kiếm và filter listings
- [ ] Tạo listing mới (status: Pending)
- [ ] Xem listings của mình
- [ ] Cập nhật listing của mình
- [ ] Xóa listing của mình
- [ ] Không thể sửa/xóa listing của người khác
- [ ] Xem lịch sử đấu giá
- [ ] Đặt giá thầu hợp lệ
- [ ] Không thể bid listing của mình
- [ ] Xem các bids của mình
- [ ] Seller xem bids của listing mình
- [ ] Seller kết thúc auction
- [ ] Tạo order
- [ ] Xem orders của mình
- [ ] Cập nhật order status
- [ ] Tạo payment
- [ ] Xem payments của mình
- [ ] Tạo review sau khi order completed
- [ ] Cập nhật/xóa review của mình
- [ ] Xem reviews của users (public)
- [ ] Thêm/xóa favorites
- [ ] Xem danh sách favorites
- [ ] Xem notifications
- [ ] Đánh dấu đã đọc notifications
- [ ] Sử dụng AI price suggestion
- [ ] Xem AI market analysis
- [ ] Không thể access admin endpoints

### Admin Role Checklist:
- [ ] Tất cả quyền của Member
- [ ] Xem dashboard statistics
- [ ] Xem system overview
- [ ] Generate reports
- [ ] Xem tất cả users
- [ ] Tìm kiếm users
- [ ] Xem chi tiết user
- [ ] Update user status (Active/Inactive/Banned)
- [ ] Change user role
- [ ] Xem user statistics
- [ ] Xem pending listings
- [ ] Approve listing
- [ ] Reject listing với lý do
- [ ] Bulk approve/reject listings
- [ ] Tạo brand mới
- [ ] Update/delete brand
- [ ] Tạo car mới
- [ ] Update/delete car
- [ ] Tạo pin mới
- [ ] Update/delete pin
- [ ] Xem tất cả orders
- [ ] Xem order statistics
- [ ] Xem tất cả payments
- [ ] Xem payment statistics
- [ ] Xem tất cả reviews
- [ ] Xóa review vi phạm
- [ ] Tạo notification cho user
- [ ] Gửi bulk notifications
- [ ] Xem system settings
- [ ] Update system settings
- [ ] Member không thể access admin endpoints

---

## 📊 TEST METRICS

Sau khi hoàn thành tất cả test scenarios:

### Coverage:
- [ ] Authentication: 100%
- [ ] User Management: 100%
- [ ] Listing Management: 100%
- [ ] Auction System: 100%
- [ ] Order Management: 100%
- [ ] Payment System: 100%
- [ ] Review System: 100%
- [ ] Favorites: 100%
- [ ] Notifications: 100%
- [ ] AI Features: 100%
- [ ] Admin Functions: 100%

### Security Tests:
- [ ] JWT authentication hoạt động
- [ ] Role-based access control hoạt động
- [ ] Owner-based authorization hoạt động
- [ ] Input validation hoạt động
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Rate limiting hoạt động

### Performance Tests:
- [ ] Pagination hoạt động với large datasets
- [ ] Search performance acceptable
- [ ] Image upload performance acceptable
- [ ] Bulk operations performance acceptable

---

## 🔄 CONTINUOUS TESTING

### Automated Testing:
Có thể convert các test cases này thành:
1. **Postman Collection** - Import vào Postman để test manual
2. **Jest Tests** - Automated integration tests
3. **Newman** - CI/CD automated testing

### Regression Testing:
Sau mỗi lần update code, chạy lại các test scenarios để đảm bảo:
- Không break existing functionality
- New features hoạt động đúng
- Security không bị compromise

---

## 📝 NOTES

### Common Issues:
1. **Token expired**: Login lại để lấy token mới
2. **403 Forbidden**: Kiểm tra role và permissions
3. **404 Not Found**: Kiểm tra ID có tồn tại không
4. **400 Bad Request**: Kiểm tra input validation

### Best Practices:
1. Luôn test với cả positive và negative scenarios
2. Test edge cases (empty input, very long input, special characters)
3. Test concurrent operations (2 users bid cùng lúc)
4. Test transaction rollback (payment failed)
5. Test notification delivery
6. Test with different roles
7. Test permission boundaries

---

Tài liệu này cung cấp đầy đủ kịch bản test cho toàn bộ hệ thống theo từng role! 🎉

