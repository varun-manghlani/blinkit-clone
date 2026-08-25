const express = require("express");

const Product = require("../models/Product");

const router = express.Router();

// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      productId: 1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      productId: Number(req.params.id),
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

module.exports = router;
