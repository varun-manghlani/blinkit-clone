const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const HeroBanner = require("../models/HeroBanner");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(__dirname, "../uploads/banners");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);

    const filename = "hero-banner-" + Date.now() + extension;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  },
});

// ==========================================
// GET CURRENT HERO BANNER
// ==========================================

router.get("/", async (req, res) => {
  try {
    const heroBanner = await HeroBanner.findOne({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      heroBanner,
    });
  } catch (error) {
    console.error("Get hero banner error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch hero banner",
    });
  }
});

// ==========================================
// UPDATE HERO BANNER
// ==========================================

router.put("/", upload.single("image"), async (req, res) => {
  try {
    const { redirectUrl } = req.body;

    if (!redirectUrl) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    // Find existing banner
    let heroBanner = await HeroBanner.findOne({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    // ======================================
    // NEW IMAGE
    // ======================================

    if (req.file) {
      const imageUrl = `/uploads/banners/${req.file.filename}`;

      if (heroBanner) {
        heroBanner.imageUrl = imageUrl;
        heroBanner.redirectUrl = redirectUrl;

        await heroBanner.save();
      } else {
        heroBanner = await HeroBanner.create({
          imageUrl,
          redirectUrl,
          isActive: true,
        });
      }
    }

    // ======================================
    // ONLY UPDATE URL
    // ======================================
    else {
      if (!heroBanner) {
        return res.status(400).json({
          message: "Please upload a hero banner image",
        });
      }

      heroBanner.redirectUrl = redirectUrl;

      await heroBanner.save();
    }

    return res.status(200).json({
      message: "Hero banner updated successfully",

      heroBanner,
    });
  } catch (error) {
    console.error("Update hero banner error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to update hero banner",
    });
  }
});

module.exports = router;
