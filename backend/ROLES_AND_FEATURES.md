# PHÂN QUYỀN VÀ CHỨC NĂNG HỆ THỐNG

## 📋 Tổng quan

Hệ thống Electric Vehicle Marketplace có **2 vai trò chính**:
1. **Member** (Thành viên) - Người dùng thông thường
2. **Admin** (Quản trị viên) - Quản trị hệ thống

---

## 👤 MEMBER (Thành viên)

### 🔐 1. Xác thực & Quản lý tài khoản

#### Luồng đăng ký:
```
POST /api/auth/register
├─ Input: email, password, fullName, phone (optional)
├─ Xử lý: Mã hóa password, tạo tài khoản với role = "Member"
└─ Output: Thông tin user, JWT token
```

#### Luồng đăng nhập:
```
POST /api/auth/login
├─ Input: email, password
├─ Xử lý: Kiểm tra thông tin, verify password
└─ Output: JWT token, thông tin user
```

#### Quản lý profile:
- `GET /api/auth/profile` - Xem thông tin cá nhân
- `PUT /api/auth/profile` - Cập nhật thông tin (phone, fullName, avatarUrl)
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/verify` - Verify JWT token

**Luồng cập nhật profile:**
```
Member Login → GET profile → PUT profile → Cập nhật DB → Trả về thông tin mới
```

---

### 🚗 2. Quản lý Listing (Tin đăng)

#### Xem listing:
- `GET /api/listings` - Xem tất cả listings (Public)
- `GET /api/listings/search` - Tìm kiếm listings (Public)
- `GET /api/listings/:listingId` - Xem chi tiết listing (Public)
- `GET /api/listings/user/my-listings` - Xem listings của mình (Private)

#### Tạo listing:
```
POST /api/listings
├─ Auth: Required (JWT token)
├─ Input: 
│  ├─ itemId (CarId hoặc PinId)
│  ├─ listingType (Car/Pin)
│  ├─ price
│  ├─ description
│  ├─ images (tối đa 10 ảnh)
│  └─ auctionEndTime (nếu là đấu giá)
├─ Xử lý: 
│  ├─ Upload images lên Cloudinary
│  ├─ Tạo listing với status = "Pending"
│  └─ Gửi notification cho Admin
└─ Output: Listing mới tạo (chờ admin duyệt)
```

#### Cập nhật/Xóa listing:
```
PUT /api/listings/:listingId
├─ Auth: Required
├─ Check: User phải là chủ listing
├─ Xử lý: Cập nhật thông tin, upload images mới
└─ Output: Listing đã cập nhật

DELETE /api/listings/:listingId
├─ Auth: Required
├─ Check: User phải là chủ listing
└─ Xử lý: Xóa listing và các images liên quan
```

**Luồng tạo listing đầy đủ:**
```
Member → Tạo listing → Upload images → Status: Pending
           ↓
    Chờ Admin duyệt
           ↓
Approved → Hiển thị trên marketplace
           hoặc
Rejected → Thông báo lý do từ chối
```

---

### 💰 3. Đấu giá (Auction)

#### Xem đấu giá:
- `GET /api/auctions/:listingId/history` - Lịch sử đấu giá (Public)
- `GET /api/auctions/:listingId/highest-bid` - Giá cao nhất (Public)

#### Tham gia đấu giá:
```
POST /api/auctions/:listingId/bid
├─ Auth: Required
├─ Input: bidAmount
├─ Validate:
│  ├─ Listing phải ở trạng thái Active
│  ├─ Listing type phải là Auction
│  ├─ Auction chưa kết thúc
│  ├─ BidAmount > CurrentPrice + MinIncrement
│  └─ User không phải chủ listing
├─ Xử lý:
│  ├─ Tạo record Auction
│  ├─ Cập nhật CurrentPrice của listing
│  └─ Gửi notification cho chủ listing
└─ Output: Thông tin bid mới
```

#### Quản lý bids:
- `GET /api/auctions/user/my-bids` - Xem các bids của mình
- `GET /api/auctions/:listingId/bids` - Xem các bids của listing
- `POST /api/auctions/:listingId/end` - Kết thúc đấu giá (chỉ chủ listing)

**Luồng đấu giá đầy đủ:**
```
1. Seller tạo listing type Auction → Set thời gian kết thúc
           ↓
2. Buyers đặt giá liên tục → Hệ thống track highest bid
           ↓
3. Auction kết thúc (auto hoặc manual)
           ↓
4. Hệ thống tạo Order tự động cho winner
           ↓
5. Winner thanh toán → Hoàn tất giao dịch
```

---

### 🛒 4. Quản lý Order (Đơn hàng)

#### Tạo order:
```
POST /api/orders
├─ Auth: Required
├─ Input: listingId, buyerId, sellerId, totalAmount
├─ Validate:
│  ├─ Listing phải Available
│  └─ User phải là buyer
├─ Xử lý:
│  ├─ Tạo Order với status = "Pending"
│  ├─ Cập nhật Listing status = "Reserved"
│  └─ Gửi notification cho seller và buyer
└─ Output: Order mới
```

#### Xem orders:
- `GET /api/orders/user/my-orders` - Xem orders của mình (cả buyer và seller)
- `GET /api/orders/:orderId` - Xem chi tiết order

#### Cập nhật trạng thái order:
```
PUT /api/orders/:orderId/status
├─ Auth: Required
├─ Input: status (Pending/Confirmed/InProgress/Completed/Cancelled)
├─ Check: User phải là buyer hoặc seller của order
├─ Business logic:
│  ├─ Buyer có thể: Cancel (khi Pending)
│  ├─ Seller có thể: Confirm, InProgress, Complete
│  └─ Tự động update listing status theo order status
└─ Output: Order đã cập nhật
```

**Luồng order đầy đủ:**
```
1. Buyer tạo order → Status: Pending
           ↓
2. Seller xác nhận → Status: Confirmed
           ↓
3. Bắt đầu giao hàng → Status: InProgress
           ↓
4. Hoàn tất giao dịch → Status: Completed
           ↓
5. Cập nhật Listing → Status: Sold
           ↓
6. Buyer có thể review → Tạo Review
```

---

### 💳 5. Thanh toán (Payment)

#### Tạo payment:
```
POST /api/payments
├─ Auth: Required
├─ Input: 
│  ├─ orderId
│  ├─ amount
│  ├─ paymentMethod
│  └─ transactionId (từ payment gateway)
├─ Validate: User phải là buyer của order
├─ Xử lý:
│  ├─ Tạo Payment record
│  ├─ Cập nhật Order status
│  └─ Gửi notification thanh toán thành công
└─ Output: Payment info
```

#### Xem payments:
- `GET /api/payments/order/:orderId` - Payment của order
- `GET /api/payments/user/my-payments` - Payments của user

#### Cập nhật trạng thái payment:
- `PUT /api/payments/:paymentId/status` - Cập nhật (Success/Failed/Refunded)

**Luồng thanh toán:**
```
Order Confirmed → Member tạo Payment → Payment Gateway xử lý
                         ↓
                  Success/Failed
                         ↓
                Cập nhật Payment status
                         ↓
                 Order status updated
                         ↓
              Gửi notification kết quả
```

---

### ⭐ 6. Review & Rating

#### Tạo review:
```
POST /api/reviews
├─ Auth: Required
├─ Input:
│  ├─ orderId
│  ├─ revieweeId (user được review)
│  ├─ rating (1-5)
│  └─ comment
├─ Validate:
│  ├─ Order phải Completed
│  ├─ User phải tham gia trong order
│  └─ Chưa review trước đó
└─ Output: Review mới
```

#### Quản lý reviews:
- `GET /api/reviews/user/:userId` - Xem reviews của user (Public)
- `GET /api/reviews/user/:userId/rating` - Xem rating trung bình (Public)
- `GET /api/reviews/order/:orderId` - Reviews của order
- `PUT /api/reviews/:reviewId` - Cập nhật review (chỉ owner)
- `DELETE /api/reviews/:reviewId` - Xóa review (chỉ owner)

**Luồng review:**
```
Order Completed → Buyer review Seller → Rating & Comment
                        ↓
                Seller review Buyer
                        ↓
           Cập nhật rating trung bình cho cả 2
                        ↓
              Hiển thị trên profile
```

---

### ❤️ 7. Favorites (Yêu thích)

Member có thể lưu các listings yêu thích:

- `GET /api/favorites` - Danh sách yêu thích
- `GET /api/favorites/count` - Số lượng yêu thích
- `GET /api/favorites/:listingId/check` - Kiểm tra đã yêu thích chưa
- `POST /api/favorites/:listingId` - Thêm vào yêu thích
- `DELETE /api/favorites/:listingId` - Bỏ yêu thích
- `DELETE /api/favorites/id/:favoriteId` - Xóa theo ID

**Luồng:**
```
Member → Xem listing → Click ❤️ → Thêm vào favorites
                                         ↓
                              Xem lại ở /api/favorites
```

---

### 🔔 8. Notifications (Thông báo)

Member nhận thông báo về:
- Listing được duyệt/từ chối
- Có người bid listing của mình
- Có order mới
- Order status thay đổi
- Payment thành công
- Nhận review mới

**APIs:**
- `GET /api/notifications` - Danh sách thông báo
- `GET /api/notifications/unread-count` - Số thông báo chưa đọc
- `PUT /api/notifications/:notificationId/read` - Đánh dấu đã đọc
- `PUT /api/notifications/mark-all-read` - Đánh dấu tất cả đã đọc
- `DELETE /api/notifications/:notificationId` - Xóa thông báo
- `DELETE /api/notifications/all` - Xóa tất cả

**Luồng nhận thông báo:**
```
Event xảy ra → Hệ thống tạo Notification → Push to user
                                                  ↓
                                    Member xem và đánh dấu đã đọc
```

---

### 🤖 9. AI Features

Member có thể sử dụng AI để:

#### Gợi ý giá:
```
POST /api/ai/price-suggestion
├─ Auth: Required
├─ Input:
│  ├─ itemType (Car/Pin)
│  ├─ brandId
│  ├─ condition
│  └─ specifications
├─ Xử lý: AI phân tích thị trường và đưa ra giá gợi ý
└─ Output: Suggested price range với lý do
```

#### Phân tích thị trường:
```
GET /api/ai/market-analysis
├─ Auth: Required
├─ Xử lý: AI phân tích xu hướng, giá trung bình, nhu cầu
└─ Output: Market insights và recommendations
```

---

### 🔍 10. Xem thông tin Public

Member có thể xem (không cần đăng nhập):

#### Brands:
- `GET /api/brands` - Danh sách brands
- `GET /api/brands/:brandId` - Chi tiết brand

#### Cars:
- `GET /api/cars` - Danh sách xe điện
- `GET /api/cars/search` - Tìm kiếm xe
- `GET /api/cars/:carId` - Chi tiết xe

#### Pins (Battery):
- `GET /api/pins` - Danh sách pin
- `GET /api/pins/search` - Tìm kiếm pin
- `GET /api/pins/:pinId` - Chi tiết pin

---

## 🔧 ADMIN (Quản trị viên)

Admin có **TẤT CẢ quyền của Member** + các quyền quản trị sau:

### 📊 1. Dashboard & Statistics

#### Xem dashboard:
```
GET /api/admin/dashboard
├─ Auth: Required (Admin only)
└─ Output:
   ├─ Tổng số users, listings, orders
   ├─ Revenue thống kê
   ├─ Biểu đồ tăng trưởng
   └─ Top sellers/buyers
```

#### System overview:
```
GET /api/admin/overview
├─ Output:
│  ├─ Active users
│  ├─ Pending approvals
│  ├─ Recent activities
│  └─ System health metrics
```

#### Reports:
```
GET /api/admin/reports
├─ Query params: startDate, endDate, reportType
└─ Output: Chi tiết báo cáo theo thời gian
```

---

### 👥 2. User Management

Admin có thể quản lý tất cả users:

```
GET /api/users
├─ Auth: Admin only
├─ Query: page, limit, role, status
└─ Output: Danh sách users với pagination
```

#### Tìm kiếm user:
```
GET /api/users/search
├─ Query: keyword (email, name, phone)
└─ Output: Kết quả tìm kiếm
```

#### Xem chi tiết user:
```
GET /api/users/:userId
└─ Output: Thông tin đầy đủ của user
```

#### Cập nhật trạng thái user:
```
PUT /api/users/:userId/status
├─ Input: status (Active/Inactive/Banned)
├─ Xử lý:
│  ├─ Cập nhật status
│  ├─ Nếu Banned: Vô hiệu hóa tất cả listings
│  └─ Gửi notification cho user
└─ Output: User updated
```

#### Thay đổi role:
```
PUT /api/users/:userId/role
├─ Input: role (Member/Admin)
├─ Xử lý: Cập nhật quyền user
└─ Output: User với role mới
```

#### User statistics:
```
GET /api/users/stats
└─ Output:
   ├─ Tổng users theo role
   ├─ Users mới theo tháng
   ├─ Active vs Inactive
   └─ Top contributors
```

**Luồng quản lý user:**
```
Admin → View all users → Search/Filter → Select user
                              ↓
                    View detail / Update status / Change role
                              ↓
                   System updates & Send notification
```

---

### ✅ 3. Listing Approval

Một trong những chức năng quan trọng nhất của Admin:

#### Xem listings chờ duyệt:
```
GET /api/listings/admin/pending
├─ Auth: Admin only
└─ Output: Danh sách listings với status = "Pending"
```

#### Duyệt/Từ chối listing:
```
PUT /api/listings/:listingId/approval
├─ Auth: Admin only
├─ Input:
│  ├─ action (Approve/Reject)
│  └─ rejectionReason (nếu reject)
├─ Xử lý:
│  ├─ Nếu Approve: status = "Active"
│  ├─ Nếu Reject: status = "Rejected"
│  └─ Gửi notification cho seller
└─ Output: Listing đã cập nhật
```

#### Bulk approval:
```
POST /api/admin/approvals/bulk
├─ Input: 
│  ├─ listingIds: [id1, id2, ...]
│  └─ action: Approve/Reject
├─ Xử lý: Duyệt nhiều listings cùng lúc
└─ Output: Kết quả bulk update
```

**Luồng duyệt listing:**
```
Member tạo listing → Status: Pending
           ↓
Admin nhận notification → Review listing
           ↓
     Approve      hoặc      Reject
        ↓                      ↓
  Status: Active      Status: Rejected
        ↓                      ↓
Hiển thị trên       Member nhận lý do từ chối
  marketplace         (có thể chỉnh sửa và submit lại)
```

---

### 🚗 4. Product Management (Cars & Pins)

Admin quản lý catalog sản phẩm trong hệ thống:

#### Car Management:
```
POST /api/cars
├─ Auth: Admin only
├─ Input:
│  ├─ brandId
│  ├─ model, year
│  ├─ batteryCapacity, range
│  ├─ enginePower, torque
│  └─ specifications (JSON)
└─ Output: Car mới

PUT /api/cars/:carId - Cập nhật thông số xe
DELETE /api/cars/:carId - Xóa xe khỏi catalog
```

#### Pin Management:
```
POST /api/pins
├─ Auth: Admin only
├─ Input:
│  ├─ brandId
│  ├─ model, capacity
│  ├─ voltage, cycles
│  └─ specifications
└─ Output: Pin mới

PUT /api/pins/:pinId - Cập nhật thông số pin
DELETE /api/pins/:pinId - Xóa pin
```

**Luồng quản lý products:**
```
Admin → Add new car/pin to catalog
           ↓
Members có thể tạo listing dựa trên catalog
           ↓
Admin update specifications khi cần
```

---

### 🏷️ 5. Brand Management

Admin quản lý các brands (hãng xe, hãng pin):

```
POST /api/brands
├─ Auth: Admin only
├─ Input:
│  ├─ name
│  ├─ type (Car/Pin)
│  ├─ logoUrl
│  └─ description
└─ Output: Brand mới

PUT /api/brands/:brandId - Cập nhật brand
DELETE /api/brands/:brandId - Xóa brand (nếu không có product nào)
```

---

### 📦 6. Order Management

Admin có thể xem và quản lý tất cả orders:

```
GET /api/orders
├─ Auth: Admin only
├─ Query: page, limit, status, dateRange
└─ Output: Tất cả orders trong hệ thống
```

#### Order statistics:
```
GET /api/orders/stats
└─ Output:
   ├─ Total orders by status
   ├─ Revenue by period
   ├─ Average order value
   └─ Completion rate
```

**Admin có thể can thiệp vào orders khi có vấn đề:**
- Xem chi tiết dispute
- Hỗ trợ giải quyết tranh chấp buyer-seller
- Refund nếu cần thiết

---

### 💳 7. Payment Management

Admin giám sát tất cả giao dịch thanh toán:

```
GET /api/payments
├─ Auth: Admin only
├─ Query: page, limit, status, dateRange
└─ Output: Tất cả payments
```

#### Payment statistics:
```
GET /api/payments/stats
└─ Output:
   ├─ Total revenue
   ├─ Success rate
   ├─ Payment methods breakdown
   ├─ Refund statistics
   └─ Revenue by period (daily/monthly)
```

**Luồng xử lý payment issue:**
```
Payment Failed → Admin review → Contact payment gateway
                      ↓
              Investigate & Resolve
                      ↓
         Manual update hoặc Refund
                      ↓
           Notify buyer & seller
```

---

### ⭐ 8. Review Management

Admin giám sát và quản lý reviews:

```
GET /api/reviews
├─ Auth: Admin only
└─ Output: Tất cả reviews trong hệ thống
```

**Admin có thể:**
- Xóa reviews vi phạm (spam, nội dung không phù hợp)
- Xem báo cáo về rating trung bình
- Phát hiện review bất thường (fake reviews)

---

### 🔔 9. Notification Management

Admin có thể tạo thông báo hệ thống:

#### Tạo notification cho một user:
```
POST /api/notifications
├─ Auth: Admin only
├─ Input:
│  ├─ userId
│  ├─ title
│  ├─ message
│  └─ type
└─ Output: Notification created
```

#### Tạo bulk notifications:
```
POST /api/notifications/bulk
├─ Auth: Admin only
├─ Input:
│  ├─ targetType (All/Buyers/Sellers/Specific)
│  ├─ userIds (nếu Specific)
│  ├─ title
│  └─ message
├─ Xử lý: Gửi thông báo cho nhiều users
└─ Output: Số lượng notifications đã tạo
```

**Use cases:**
- Thông báo bảo trì hệ thống
- Thông báo chính sách mới
- Thông báo khuyến mãi
- Cảnh báo vi phạm

---

### ⚙️ 10. System Settings

Admin quản lý cấu hình hệ thống:

```
GET /api/admin/settings
└─ Output: System configurations

PUT /api/admin/settings
├─ Input:
│  ├─ commissionRate (% phí hoa hồng)
│  ├─ minListingPrice
│  ├─ maxListingPrice
│  ├─ auctionMinIncrement
│  ├─ maintenanceMode
│  └─ các settings khác
└─ Output: Settings updated
```

---

## 🔄 LUỒNG NGHIỆP VỤ CHÍNH

### 1️⃣ Luồng bán xe/pin Fixed Price

```
SELLER                          SYSTEM                      BUYER
   │                               │                          │
   ├─1. Tạo listing ────────────>│                          │
   │   (Fixed price)               │                          │
   │                               ├─2. Status: Pending       │
   │                               ├─3. Notify Admin          │
   │                               │                          │
   │<─4. Notify Approved ─────────┤                          │
   │   (Admin duyệt)               ├─5. Status: Active       │
   │                               │                          │
   │                               │<─6. Browse listings ─────┤
   │                               │                          │
   │                               │<─7. Tạo Order ───────────┤
   │                               ├─8. Status: Pending       │
   │                               ├─9. Reserve listing       │
   │<─10. Notify new order ────────┤───────────────────────>│
   │                               │   Notify order created   │
   │                               │                          │
   ├─11. Confirm order ──────────>│                          │
   │                               ├─12. Status: Confirmed   │
   │                               ├──────────────────────────>│
   │                               │   Notify to pay          │
   │                               │                          │
   │                               │<─13. Create payment ─────┤
   │                               ├─14. Process payment     │
   │                               ├──────────────────────────>│
   │                               │   Payment success        │
   │                               │                          │
   ├─15. Update: InProgress ────>│                          │
   │    (Giao hàng)                │                          │
   │                               │                          │
   ├─16. Update: Completed ─────>│                          │
   │                               ├─17. Update listing: Sold│
   │                               ├──────────────────────────>│
   │                               │   Notify completed       │
   │                               │                          │
   │<─18. Buyer review ────────────────────────────────────────┤
   ├─19. Seller review ──────────────────────────────────────>│
   │                               │                          │
   └───────────────────────────────┴──────────────────────────┘
```

---

### 2️⃣ Luồng đấu giá (Auction)

```
SELLER                   SYSTEM                BIDDER 1, 2, 3...
   │                        │                          │
   ├─1. Tạo listing ───────>│                          │
   │   (Auction type)        │                          │
   │   Set end time          │                          │
   │                         ├─2. Status: Pending      │
   │                         ├─3. Admin approve        │
   │<─4. Notify Approved ────┤                          │
   │                         ├─5. Status: Active       │
   │                         │                          │
   │                         │<─6. Bidder 1 bids ───────┤
   │                         ├─7. Update price         │
   │<─8. Notify new bid ─────┤                          │
   │                         │                          │
   │                         │<─9. Bidder 2 bids higher─┤
   │                         ├─10. Update price        │
   │<─11. Notify new bid ────┤──────────────────────────>│
   │                         │   Notify outbid          │
   │                         │                          │
   │                         │<─12. Continue bidding... ┤
   │                         │                          │
   │                         ├─13. Auction ends        │
   │                         │    (auto by time)        │
   │                         ├─14. Determine winner    │
   │<─15. Notify winner ─────┤──────────────────────────>│
   │                         │   Notify winner          │
   │                         │                          │
   │                         ├─16. Auto create Order   │
   │                         │    for winner            │
   │                         │                          │
   │                    [Tiếp tục như luồng Fixed Price]
   │                         │                          │
   └─────────────────────────┴──────────────────────────┘
```

---

### 3️⃣ Luồng Admin duyệt listing

```
MEMBER                      ADMIN                      SYSTEM
   │                          │                           │
   ├─1. Submit listing ──────────────────────────────────>│
   │                          │                           ├─2. Create listing
   │                          │                           │   Status: Pending
   │                          │                           │
   │                          │<─3. Notify pending ───────┤
   │                          │                           │
   │                          ├─4. Review listing ──────>│
   │                          │   - Check info            │
   │                          │   - Check images          │
   │                          │   - Check pricing         │
   │                          │                           │
   │                          ├─5a. APPROVE ──────────────>│
   │                          │                           ├─6. Status: Active
   │<─────────────────────────┼───────7. Notify approved ─┤
   │   Listing live           │                           │
   │                          │                           │
   │              OR          │                           │
   │                          │                           │
   │                          ├─5b. REJECT ───────────────>│
   │                          │    + reason               ├─6. Status: Rejected
   │<─────────────────────────┼───────7. Notify rejected ─┤
   │   Can edit & resubmit    │    + reason               │
   │                          │                           │
   ├─8. Edit & resubmit ─────────────────────────────────>│
   │                          │                           ├─9. Status: Pending
   │                          │<─10. Review again ────────┤
   │                          │                           │
   └──────────────────────────┴───────────────────────────┘
```

---

## 🔒 PHÂN QUYỀN TRUY CẬP

### Public (Không cần đăng nhập):
- Xem listings
- Xem cars/pins catalog
- Xem brands
- Xem auction history
- Xem user reviews & ratings
- Tìm kiếm

### Member (Yêu cầu đăng nhập):
- **TẤT CẢ quyền Public**
- Quản lý profile
- Tạo/sửa/xóa listings của mình
- Đặt bid trong auctions
- Tạo orders
- Thanh toán
- Tạo/sửa reviews
- Quản lý favorites
- Xem/quản lý notifications
- Sử dụng AI features

### Admin (Yêu cầu role = Admin):
- **TẤT CẢ quyền Member**
- Xem dashboard & statistics
- Quản lý users (view, update status, change role)
- Duyệt/từ chối listings
- Quản lý catalog (cars, pins, brands)
- Xem tất cả orders & payments
- Quản lý reviews (delete vi phạm)
- Tạo bulk notifications
- Quản lý system settings
- Xem reports & analytics

---

## 📊 STATUS WORKFLOW

### Listing Status:
```
Pending → (Admin approve) → Active → (Order created) → Reserved
                ↓                          ↓
          (Admin reject)              (Order completed)
                ↓                          ↓
             Rejected                    Sold
```

### Order Status:
```
Pending → (Seller confirm) → Confirmed → (Payment) → Confirmed
   ↓                                          ↓
(Cancel)                              (Start delivery)
   ↓                                          ↓
Cancelled                                InProgress
                                              ↓
                                        (Completed)
                                              ↓
                                          Completed
```

### Payment Status:
```
Pending → (Gateway process) → Success → (Issue?) → Refunded
            ↓
      (Gateway error)
            ↓
          Failed
```

### User Status:
```
Active → (Admin action) → Inactive/Banned
   ↓
(Can use all features)
   
Inactive → (Cannot create listings)

Banned → (Cannot login)
```

---

## 🔔 HỆ THỐNG THÔNG BÁO

### Member nhận thông báo khi:
1. Listing được approve/reject
2. Có bid mới trên listing của mình
3. Bị outbid trong auction
4. Thắng auction
5. Có order mới
6. Order status thay đổi
7. Payment thành công/thất bại
8. Nhận review mới
9. Admin gửi thông báo hệ thống

### Admin nhận thông báo khi:
1. Có listing mới chờ duyệt
2. Có report từ users
3. Payment issues
4. System alerts

---

## 🔐 BẢO MẬT

### Authentication:
- JWT token-based
- Token expires sau 7 ngày (configurable)
- Password được hash bằng bcrypt

### Authorization:
- Middleware `authenticateToken` check JWT
- Middleware `requireAdmin` check role = Admin
- Owner-based access control (user chỉ sửa/xóa content của mình)

### Data Protection:
- SQL injection protection (parameterized queries)
- Input validation với Joi schemas
- Rate limiting (100 requests/15 minutes)
- CORS configured
- Helmet.js security headers

---

## 📈 TỔNG KẾT

### Điểm khác biệt chính giữa Member và Admin:

| Tính năng | Member | Admin |
|-----------|--------|-------|
| Xem public content | ✅ | ✅ |
| Quản lý listings của mình | ✅ | ✅ |
| Đấu giá & mua hàng | ✅ | ✅ |
| **Duyệt listings** | ❌ | ✅ |
| **Quản lý users** | ❌ | ✅ |
| **Quản lý catalog (cars/pins/brands)** | ❌ | ✅ |
| **Xem tất cả orders/payments** | ❌ | ✅ |
| **Dashboard & reports** | ❌ | ✅ |
| **System settings** | ❌ | ✅ |
| **Bulk notifications** | ❌ | ✅ |

### Luồng nghiệp vụ chính:
1. **Member** tập trung vào: Mua/Bán/Đấu giá
2. **Admin** tập trung vào: Quản trị và giám sát hệ thống

Hệ thống được thiết kế với role-based access control rõ ràng, đảm bảo:
- Members có đầy đủ quyền để giao dịch
- Admins có quyền giám sát và can thiệp khi cần
- Tất cả actions đều có audit trail qua notifications và logs

