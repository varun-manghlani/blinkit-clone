const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Category = require("../models/Category");
const Product = require("../models/Product");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(__dirname, "../uploads/categories");

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

    cb(null, `category-${Date.now()}${extension}`);
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
// GET ALL CATEGORIES - ADMIN
// ==========================================

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("products")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Admin get categories error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
});

// ==========================================
// CREATE CATEGORY
// ==========================================

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, slug, redirectUrl, products } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Category image is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    if (!slug?.trim()) {
      return res.status(400).json({
        message: "Category slug is required",
      });
    }

    if (!redirectUrl?.trim()) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    const existingCategory = await Category.findOne({
      slug: slug.trim(),
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "A category with this slug already exists",
      });
    }

    let productIds = [];

    if (products) {
      try {
        productIds =
          typeof products === "string" ? JSON.parse(products) : products;
      } catch {
        return res.status(400).json({
          message: "Invalid products data",
        });
      }
    }

    if (!Array.isArray(productIds)) {
      productIds = [];
    }

    // Validate product references only.
    // We do NOT modify Product documents.
    if (productIds.length > 0) {
      const validProducts = await Product.find({
        _id: {
          $in: productIds,
        },
      }).select("_id");

      const validIds = validProducts.map((product) => product._id.toString());

      const invalidProduct = productIds.some(
        (id) => !validIds.includes(id.toString()),
      );

      if (invalidProduct) {
        return res.status(400).json({
          message: "One or more products are invalid",
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      imageUrl: `/uploads/categories/${req.file.filename}`,
      redirectUrl: redirectUrl.trim(),
      products: productIds,
      isActive: true,
    });

    const populatedCategory = await Category.findById(category._id).populate(
      "products",
    );

    return res.status(201).json({
      message: "Category created successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to create category",
    });
  }
});

// ==========================================
// UPDATE CATEGORY
// ==========================================

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const { name, slug, redirectUrl, products } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    if (!slug?.trim()) {
      return res.status(400).json({
        message: "Category slug is required",
      });
    }

    if (!redirectUrl?.trim()) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    const duplicate = await Category.findOne({
      slug: slug.trim(),
      _id: {
        $ne: category._id,
      },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Another category already uses this slug",
      });
    }

    let productIds = category.products.map((id) => id.toString());

    if (products !== undefined) {
      try {
        productIds =
          typeof products === "string" ? JSON.parse(products) : products;
      } catch {
        return res.status(400).json({
          message: "Invalid products data",
        });
      }
    }

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        message: "Products must be an array",
      });
    }

    // Validate references.
    if (productIds.length > 0) {
      const validProducts = await Product.find({
        _id: {
          $in: productIds,
        },
      }).select("_id");

      const validIds = validProducts.map((product) => product._id.toString());

      const invalidProduct = productIds.some(
        (id) => !validIds.includes(id.toString()),
      );

      if (invalidProduct) {
        return res.status(400).json({
          message: "One or more products are invalid",
        });
      }
    }

    category.name = name.trim();
    category.slug = slug.trim();
    category.redirectUrl = redirectUrl.trim();

    category.products = productIds;

    if (req.file) {
      category.imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();

    const populatedCategory = await Category.findById(category._id).populate(
      "products",
    );

    return res.status(200).json({
      message: "Category updated successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to update category",
    });
  }
});

// ==========================================
// DELETE CATEGORY
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error.message);

    return res.status(500).json({
      message: "Failed to delete category",
    });
  }
});

module.exports = router;
