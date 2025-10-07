# Electric Vehicle Marketplace Backend API

A comprehensive backend API for an electric vehicle marketplace platform built with Node.js, Express, and SQL Server.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Member/Admin)
- Password hashing with bcrypt

### 👥 User Management
- User profile management
- Admin user management
- User statistics and analytics

### 🚗 Vehicle Management
- Car and battery pin listings
- Brand management
- Advanced search and filtering
- Image upload with Cloudinary

### 💰 Marketplace Features
- Listing creation and management
- Auction system with bidding
- Order management
- Payment processing
- Review and rating system

### 🤖 AI Features
- AI-powered price suggestions
- Market analysis
- Smart recommendations

### 🔔 Notifications
- Real-time notifications
- Email notifications
- Admin bulk notifications

### 📊 Admin Dashboard
- System statistics
- User management
- Listing approvals
- Revenue tracking
- Reports and analytics

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout
- `GET /verify` - Verify token

### Users (`/api/users`) - Admin Only
- `GET /` - Get all users
- `GET /stats` - User statistics
- `GET /search` - Search users
- `GET /:userId` - Get user by ID
- `PUT /:userId/status` - Update user status
- `PUT /:userId/role` - Update user role

### Brands (`/api/brands`)
- `GET /` - Get all brands
- `GET /:brandId` - Get brand by ID
- `POST /` - Create brand (Admin)
- `PUT /:brandId` - Update brand (Admin)
- `DELETE /:brandId` - Delete brand (Admin)

### Cars (`/api/cars`)
- `GET /` - Get all cars
- `GET /search` - Search cars
- `GET /:carId` - Get car by ID
- `POST /` - Create car (Admin)
- `PUT /:carId` - Update car (Admin)
- `DELETE /:carId` - Delete car (Admin)

### Pins (`/api/pins`)
- `GET /` - Get all pins
- `GET /search` - Search pins
- `GET /:pinId` - Get pin by ID
- `POST /` - Create pin (Admin)
- `PUT /:pinId` - Update pin (Admin)
- `DELETE /:pinId` - Delete pin (Admin)

### Listings (`/api/listings`)
- `GET /` - Get all listings
- `GET /search` - Search listings
- `GET /:listingId` - Get listing by ID
- `GET /user/my-listings` - Get user's listings
- `POST /` - Create listing
- `PUT /:listingId` - Update listing
- `DELETE /:listingId` - Delete listing
- `GET /admin/pending` - Get pending listings (Admin)
- `PUT /:listingId/approval` - Approve/reject listing (Admin)

### Auctions (`/api/auctions`)
- `GET /:listingId/history` - Get auction history
- `GET /:listingId/highest-bid` - Get highest bid
- `POST /:listingId/bid` - Place bid
- `GET /user/my-bids` - Get user's bids
- `GET /:listingId/bids` - Get listing bids
- `POST /:listingId/end` - End auction

### Orders (`/api/orders`)
- `POST /` - Create order
- `GET /user/my-orders` - Get user's orders
- `GET /:orderId` - Get order by ID
- `PUT /:orderId/status` - Update order status
- `GET /` - Get all orders (Admin)
- `GET /stats` - Order statistics (Admin)

### Payments (`/api/payments`)
- `POST /` - Create payment
- `GET /order/:orderId` - Get payment by order
- `GET /user/my-payments` - Get user's payments
- `PUT /:paymentId/status` - Update payment status
- `GET /` - Get all payments (Admin)
- `GET /stats` - Payment statistics (Admin)

### Reviews (`/api/reviews`)
- `GET /user/:userId` - Get user reviews
- `GET /user/:userId/rating` - Get user rating
- `POST /` - Create review
- `GET /order/:orderId` - Get order reviews
- `PUT /:reviewId` - Update review
- `DELETE /:reviewId` - Delete review
- `GET /` - Get all reviews (Admin)

### Favorites (`/api/favorites`)
- `GET /` - Get user's favorites
- `GET /count` - Get favorite count
- `GET /:listingId/check` - Check if favorite
- `POST /:listingId` - Add to favorites
- `DELETE /:listingId` - Remove from favorites
- `DELETE /id/:favoriteId` - Remove favorite by ID

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `GET /unread-count` - Get unread count
- `PUT /:notificationId/read` - Mark as read
- `PUT /mark-all-read` - Mark all as read
- `DELETE /:notificationId` - Delete notification
- `DELETE /all` - Delete all notifications
- `POST /` - Create notification (Admin)
- `POST /bulk` - Create bulk notifications (Admin)

### Admin (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /overview` - System overview
- `GET /reports` - Generate reports
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings
- `GET /approvals` - Get pending approvals
- `POST /approvals/bulk` - Bulk approve listings

### AI (`/api/ai`)
- `POST /price-suggestion` - Get AI price suggestion
- `GET /market-analysis` - Get market analysis

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_SERVER=localhost
   DB_NAME=MarketplaceDB
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_PORT=1433

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # AI Service Configuration
   AI_SERVICE_URL=https://api.openai.com/v1
   AI_API_KEY=your_openai_api_key

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   - Create the database using the provided SQL schema
   - Update connection details in `.env`

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Database Schema

The API uses the following main entities:
- **User** - User accounts and profiles
- **Brand** - Vehicle and battery brands
- **Car** - Electric vehicle specifications
- **Pin** - Battery specifications
- **Listing** - Marketplace listings
- **Auction** - Bidding system
- **Order** - Purchase orders
- **Payment** - Payment transactions
- **Review** - User reviews and ratings
- **FavoriteListing** - User favorites
- **Notification** - System notifications
- **Contract** - Digital contracts
- **TransactionHistory** - Audit trail
- **FeeCommission** - Platform fees

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Parameterized queries
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt password security

## Error Handling

The API includes comprehensive error handling:
- Global error handler
- Validation error responses
- Authentication error responses
- Database error handling
- Rate limiting responses

## API Documentation

### Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

### Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Pagination
Use query parameters for pagination:
```
GET /api/listings?page=1&limit=10
```

### Search and Filtering
Use query parameters for search and filtering:
```
GET /api/listings/search?listingType=Car&minPrice=10000&maxPrice=50000&brandId=1
```

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Add route to `server.js`

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

1. **Environment Variables**
   - Set production environment variables
   - Configure database connection
   - Set up Cloudinary credentials

2. **Database**
   - Run database migrations
   - Set up production database

3. **Server**
   - Use PM2 for process management
   - Set up reverse proxy (Nginx)
   - Configure SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
