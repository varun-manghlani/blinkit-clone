const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PromoCard = require("../models/PromoCard");
const Product = require("../models/Product");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(__dirname, "../uploads/promo-cards");

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
    const extension = path.extname(file.originalname);

    const filename = `promo-card-${Date.now()}${extension}`;

    cb(null, filename);
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

    console.log("Uploaded file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension,
    });

    // Accept if either MIME type OR extension is valid
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
// GET ALL PROMO CARDS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const promoCards = await PromoCard.find({
      isActive: true,
    })
      .populate("products")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      promoCards,
    });
  } catch (error) {
    console.error("Get promo cards error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch promo cards",
    });
  }
});

// ==========================================
// GET SINGLE PROMO CARD
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const promoCard = await PromoCard.findById(req.params.id).populate(
      "products",
    );

    if (!promoCard) {
      return res.status(404).json({
        message: "Promo card not found",
      });
    }

    return res.status(200).json({
      promoCard,
    });
  } catch (error) {
    console.error("Get promo card error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch promo card",
    });
  }
});

// ==========================================
// CREATE PROMO CARD
// ==========================================

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { redirectUrl, products } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Promo card image is required",
      });
    }

    if (!redirectUrl) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    let productIds = [];

    // products arrives as JSON string
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

    // Validate product IDs
    if (productIds.length > 0) {
      const validProducts = await Product.find({
        _id: {
          $in: productIds,
        },
      }).select("_id");

      const validProductIds = validProducts.map((product) =>
        product._id.toString(),
      );

      const invalidProduct = productIds.some(
        (id) => !validProductIds.includes(id.toString()),
      );

      if (invalidProduct) {
        return res.status(400).json({
          message: "One or more products are invalid",
        });
      }
    }

    const promoCard = await PromoCard.create({
      imageUrl: `/uploads/promo-cards/${req.file.filename}`,

      redirectUrl: redirectUrl.trim(),

      products: productIds,

      isActive: true,
    });

    const populatedPromoCard = await PromoCard.findById(promoCard._id).populate(
      "products",
    );

    return res.status(201).json({
      message: "Promo card created successfully",

      promoCard: populatedPromoCard,
    });
  } catch (error) {
    console.error("Create promo card error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to create promo card",
    });
  }
});

// ==========================================
// UPDATE PROMO CARD
// ==========================================

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { redirectUrl, products } = req.body;

    const promoCard = await PromoCard.findById(req.params.id);

    if (!promoCard) {
      return res.status(404).json({
        message: "Promo card not found",
      });
    }

    if (!redirectUrl) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    let productIds = promoCard.products.map((id) => id.toString());

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

    // Validate product IDs
    if (productIds.length > 0) {
      const validProducts = await Product.find({
        _id: {
          $in: productIds,
        },
      }).select("_id");

      const validProductIds = validProducts.map((product) =>
        product._id.toString(),
      );

      const invalidProduct = productIds.some(
        (id) => !validProductIds.includes(id.toString()),
      );

      if (invalidProduct) {
        return res.status(400).json({
          message: "One or more products are invalid",
        });
      }
    }

    promoCard.redirectUrl = redirectUrl.trim();

    promoCard.products = productIds;

    if (req.file) {
      promoCard.imageUrl = `/uploads/promo-cards/${req.file.filename}`;
    }

    await promoCard.save();

    const populatedPromoCard = await PromoCard.findById(promoCard._id).populate(
      "products",
    );

    return res.status(200).json({
      message: "Promo card updated successfully",

      promoCard: populatedPromoCard,
    });
  } catch (error) {
    console.error("Update promo card error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to update promo card",
    });
  }
});

// ==========================================
// DELETE PROMO CARD
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const promoCard = await PromoCard.findById(req.params.id);

    if (!promoCard) {
      return res.status(404).json({
        message: "Promo card not found",
      });
    }

    await PromoCard.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Promo card deleted successfully",
    });
  } catch (error) {
    console.error("Delete promo card error:", error.message);

    return res.status(500).json({
      message: "Failed to delete promo card",
    });
  }
});

module.exports = router;
