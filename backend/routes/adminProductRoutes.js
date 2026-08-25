const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../models/Product");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(__dirname, "../uploads/products");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// MULTER
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `product-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

    const extension = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(extension)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, JPEG, PNG, WEBP and AVIF images are allowed"),
    );
  },
});

// ==========================================
// GET ALL PRODUCTS - ADMIN
// ==========================================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      productId: 1,
    });

    return res.status(200).json({
      products,
    });
  } catch (error) {
    console.error("Admin get products error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

router.get("/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Admin get product error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// ==========================================
// CREATE PRODUCT
// ==========================================

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      category,
      categorySlug,
      price,
      mrp,
      discount,
      quantity,
      description,
      stock,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!categorySlug?.trim()) {
      return res.status(400).json({
        message: "Category slug is required",
      });
    }

    if (!quantity?.trim()) {
      return res.status(400).json({
        message: "Quantity is required",
      });
    }

    if (price === undefined || Number.isNaN(Number(price))) {
      return res.status(400).json({
        message: "Valid price is required",
      });
    }

    if (mrp === undefined || Number.isNaN(Number(mrp))) {
      return res.status(400).json({
        message: "Valid MRP is required",
      });
    }

    // Generate next productId
    const lastProduct = await Product.findOne()
      .sort({ productId: -1 })
      .select("productId");

    const nextProductId = lastProduct ? lastProduct.productId + 1 : 1;

    const product = await Product.create({
      productId: nextProductId,

      name: name.trim(),

      category: category.trim(),

      categorySlug: categorySlug.trim(),

      price: Number(price),

      mrp: Number(mrp),

      discount:
        discount === undefined || discount === "" ? 0 : Number(discount),

      quantity: quantity.trim(),

      description: description?.trim() || "",

      image: `/uploads/products/${req.file.filename}`,

      stock: stock === undefined || stock === "" ? 0 : Number(stock),
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to create product",
    });
  }
});

// ==========================================
// UPDATE PRODUCT
// ==========================================

router.put("/:productId", upload.single("image"), async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      categorySlug,
      price,
      mrp,
      discount,
      quantity,
      description,
      stock,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!categorySlug?.trim()) {
      return res.status(400).json({
        message: "Category slug is required",
      });
    }

    if (!quantity?.trim()) {
      return res.status(400).json({
        message: "Quantity is required",
      });
    }

    if (price === undefined || Number.isNaN(Number(price))) {
      return res.status(400).json({
        message: "Valid price is required",
      });
    }

    if (mrp === undefined || Number.isNaN(Number(mrp))) {
      return res.status(400).json({
        message: "Valid MRP is required",
      });
    }

    product.name = name.trim();

    product.category = category.trim();

    product.categorySlug = categorySlug.trim();

    product.price = Number(price);

    product.mrp = Number(mrp);

    product.discount =
      discount === undefined || discount === "" ? 0 : Number(discount);

    product.quantity = quantity.trim();

    product.description = description?.trim() || "";

    product.stock = stock === undefined || stock === "" ? 0 : Number(stock);

    if (req.file) {
      // Delete previous local product image.
      if (product.image && product.image.startsWith("/uploads/products/")) {
        const oldImagePath = path.join(__dirname, "..", product.image);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.image = `/uploads/products/${req.file.filename}`;
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to update product",
    });
  }
});

// ==========================================
// DELETE PRODUCT - PERMANENT
// ==========================================

router.delete("/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete local image if one exists.
    if (product.image && product.image.startsWith("/uploads/products/")) {
      const imagePath = path.join(__dirname, "..", product.image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // PERMANENTLY DELETE PRODUCT
    await Product.deleteOne({
      _id: product._id,
    });

    return res.status(200).json({
      message: "Product permanently deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
});

module.exports = router;
