const express = require("express");

const Category = require("../models/Category");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .populate("products")
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("products");

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      category,
    });
  } catch (error) {
    console.error("Get category error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch category",
    });
  }
});

module.exports = router;
