const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
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
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

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
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
