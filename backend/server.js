const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const promoCardPublicRoutes = require("./routes/promoCardPublicRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const heroBannerRoutes = require("./routes/heroBannerRoutes");
const app = express();
const promoCardRoutes = require("./routes/promoCardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(cors());

app.use(express.json());
const path = require("path");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/hero-banner", heroBannerRoutes);
app.use("/api/admin/promo-cards", promoCardRoutes);
app.use("/api/promo-cards", promoCardPublicRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Blinkit Clone API is running",
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
