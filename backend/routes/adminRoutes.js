const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const router = express.Router();

const multer = require("multer");
const path = require("path");

const HeroBanner = require("../models/HeroBanner");

// ==========================================
// HERO BANNER IMAGE UPLOAD
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `hero-banner-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
    }
  },
});

// ==========================================
// GET HERO BANNER
// ==========================================

router.get("/hero-banner", async (req, res) => {
  try {
    const heroBanner = await HeroBanner.findOne();

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

router.put("/hero-banner", upload.single("image"), async (req, res) => {
  try {
    const { redirectUrl } = req.body;

    if (!redirectUrl) {
      return res.status(400).json({
        message: "Redirect URL is required",
      });
    }

    let heroBanner = await HeroBanner.findOne();

    // If banner doesn't exist yet
    if (!heroBanner) {
      if (!req.file) {
        return res.status(400).json({
          message: "Hero banner image is required",
        });
      }

      heroBanner = await HeroBanner.create({
        imageUrl: `/uploads/${req.file.filename}`,
        redirectUrl,
      });

      return res.status(201).json({
        message: "Hero banner created successfully",

        heroBanner,
      });
    }

    // Update URL
    heroBanner.redirectUrl = redirectUrl;

    // Update image only if a new image
    // was uploaded
    if (req.file) {
      heroBanner.imageUrl = `/uploads/${req.file.filename}`;
    }

    await heroBanner.save();

    return res.status(200).json({
      message: "Hero banner updated successfully",

      heroBanner,
    });
  } catch (error) {
    console.error("Update hero banner error:", error.message);

    return res.status(500).json({
      message: "Failed to update hero banner",
    });
  }
});

// ==========================================
// PUBLIC HERO BANNER
// ==========================================

router.get("/public/hero-banner", async (req, res) => {
  try {
    const heroBanner = await HeroBanner.findOne();

    return res.status(200).json({
      heroBanner,
    });
  } catch (error) {
    console.error("Public hero banner error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch hero banner",
    });
  }
});

// ==========================================
// GENERATE OTP
// ==========================================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// ADMIN LOGIN
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Admin login successful",

      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      message: "Admin login failed",
    });
  }
});

// ==========================================
// FORGOT PASSWORD - GENERATE OTP
// ==========================================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Email does not exist",
      });
    }

    // Generate random 6 digit OTP
    const otp = generateOTP();

    console.log(`Admin reset OTP for ${normalizedEmail}: ${otp}`);

    // Hash OTP before storing
    const resetOtpHash = await bcrypt.hash(otp, 10);

    // OTP expires after 5 minutes
    const resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    admin.resetOtpHash = resetOtpHash;
    admin.resetOtpExpiresAt = resetOtpExpiresAt;

    await admin.save();

    return res.status(200).json({
      message: "OTP generated successfully",

      // Development/demo only
      developmentOTP: otp,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Failed to generate reset OTP",
    });
  }
});

// ==========================================
// VERIFY RESET OTP
// ==========================================

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // Check whether OTP exists
    if (!admin.resetOtpHash || !admin.resetOtpExpiresAt) {
      return res.status(400).json({
        message: "No active OTP. Please request a new OTP.",
      });
    }

    // Check OTP expiry
    if (new Date() > admin.resetOtpExpiresAt) {
      admin.resetOtpHash = null;
      admin.resetOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Compare entered OTP with stored hash
    const isOtpValid = await bcrypt.compare(otp, admin.resetOtpHash);

    if (!isOtpValid) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error.message);

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
});

// ==========================================
// RESET ADMIN PASSWORD
// ==========================================

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // Make sure reset OTP session still exists
    if (!admin.resetOtpHash || !admin.resetOtpExpiresAt) {
      return res.status(400).json({
        message: "Password reset session expired",
      });
    }

    // Check reset session expiry
    if (new Date() > admin.resetOtpExpiresAt) {
      admin.resetOtpHash = null;
      admin.resetOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        message: "Password reset session expired",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    admin.password = hashedPassword;

    // Clear OTP after successful password update
    admin.resetOtpHash = null;
    admin.resetOtpExpiresAt = null;

    await admin.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
});

// ==========================================
// GET ALL ADMINS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password -resetOtpHash -resetOtpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      admins,
      totalAdmins: admins.length,
    });
  } catch (error) {
    console.error("Get admins error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
});

// ==========================================
// CREATE ADMIN
// ==========================================

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "An admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin created successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error.message);

    return res.status(500).json({
      message: "Failed to create admin",
    });
  }
});

// ==========================================
// UPDATE ADMIN
// ==========================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, password } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether another admin uses this email
    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Another admin already uses this email",
      });
    }

    admin.name = name.trim();
    admin.email = normalizedEmail;

    // Password is optional while editing
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    return res.status(200).json({
      message: "Admin updated successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update admin error:", error.message);

    return res.status(500).json({
      message: "Failed to update admin",
    });
  }
});

// ==========================================
// DELETE ADMIN
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // Don't allow deleting the last admin
    const totalAdmins = await Admin.countDocuments();

    if (totalAdmins <= 1) {
      return res.status(400).json({
        message: "The last admin cannot be deleted",
      });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error.message);

    return res.status(500).json({
      message: "Failed to delete admin",
    });
  }
});

module.exports = router;
