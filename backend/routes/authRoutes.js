const express = require("express");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const Address = require("../models/Address");
const User = require("../models/User");

const router = express.Router();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* =========================================================
   SEND OTP
========================================================= */

router.post("/send-otp", async (req, res) => {
  try {
    const { phone, firstName } = req.body;

    if (!phone || !firstName) {
      return res.status(400).json({
        message: "First name and phone number are required",
      });
    }

    const otp = generateOTP();

    console.log(`Generated OTP for ${phone}: ${otp}`);

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // OTP valid for 5 minutes
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Find existing user
    let user = await User.findOne({
      phone,
    });

    // Create new user
    if (!user) {
      user = await User.create({
        phone,
        firstName,
        otpHash,
        otpExpiresAt,
      });
    } else {
      // Update existing user
      user.firstName = firstName;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;

      await user.save();
    }

    return res.status(200).json({
      message: "OTP generated successfully",
      developmentOTP: otp,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      message: error.message || "Failed to generate OTP",
    });
  }
});

/* =========================================================
   VERIFY OTP
========================================================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please request a new OTP.",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "No active OTP. Please request a new OTP.",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const isOTPValid = await bcrypt.compare(otp, user.otpHash);

    if (!isOTPValid) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    console.log(`OTP verified for ${phone}`);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Remove OTP after successful verification
    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: error.message || "Failed to verify OTP",
    });
  }
});

/* =========================================================
   SAVE DELIVERY ADDRESS
========================================================= */

router.post("/address", authMiddleware, async (req, res) => {
  try {
    const { house, area, city, state, pincode, type } = req.body;

    /* ---------------------------------------------
         Validate required fields
      --------------------------------------------- */

    if (!house || !area || !city || !state || !pincode) {
      return res.status(400).json({
        message: "All address fields are required",
      });
    }

    /* ---------------------------------------------
         Validate pincode
      --------------------------------------------- */

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit pincode",
      });
    }

    /* ---------------------------------------------
         Check authenticated user
      --------------------------------------------- */

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "User authentication failed",
      });
    }

    /* ---------------------------------------------
         Create address
      --------------------------------------------- */

    const address = await Address.create({
      user: req.user.userId,

      house: house.trim(),

      area: area.trim(),

      city: city.trim(),

      state: state.trim(),

      pincode: pincode.trim(),

      type: type || "Home",
    });

    console.log(`Address saved for user ${req.user.userId}`);

    return res.status(201).json({
      message: "Address saved successfully",

      address,
    });
  } catch (error) {
    console.error("Save address error:", error);

    return res.status(500).json({
      message: error.message || "Failed to save address",
    });
  }
});

/* =========================================================
   GET USER ADDRESSES
========================================================= */

router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      message: "Failed to get addresses",
    });
  }
});

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;
