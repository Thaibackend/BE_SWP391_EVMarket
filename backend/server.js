const express = require("express");
const http = require("http");
const { initSocket } = require("./config/socket");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("./config/passport")(passport);
const brandRoutes = require("./routes/brands");
const carRoutes = require("./routes/cars");
const pinRoutes = require("./routes/pins");
const favoriteRoutes = require("./routes/favorites");
const reviewRoutes = require("./routes/reviews");
const notificationRoutes = require("./routes/notifications");
const orderRoutes = require("./routes/orders");
const listingRoutes = require("./routes/listings");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload");
const dashboardRoutes = require("./routes/dashboard");
const cartRoutes = require("./routes/cartRoute");
const aiRoutes = require("./routes/ai");
const packageRoute = require("./routes/package");
const payosRoutes = require("./routes/payosRoutes");
const vnpayRoutes = require("./routes/vnpayRoutes");
const zalopayRoutes = require("./routes/zalopay");
const userPackageRoutes = require("./routes/userPackage");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretkey123",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});
app.use("/api/brands", brandRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/packages", packageRoute);
app.use("/api/user-packages", userPackageRoutes);
app.use("/payos", payosRoutes);
app.use("/vnpay", vnpayRoutes);
app.use("/zalopay", zalopayRoutes);
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      };

      const redirectUrl = `${
        process.env.FRONTEND_URL
      }?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;

      res.redirect(redirectUrl);
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT} + Socket.IO ready`)
  );
};

startServer();
