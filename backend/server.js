const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const brandRoutes = require("./routes/brands");
const carRoutes = require("./routes/cars");
const pinRoutes = require("./routes/pins");
const favoriteRoutes = require("./routes/favorites");
const app = express();

app.use(express.json());

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

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
