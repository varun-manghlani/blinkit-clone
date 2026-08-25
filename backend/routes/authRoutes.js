const express = require("express");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Find user

    let user = await User.findOne({
      phone,
    });

    if (!user) {
      user = await User.create({
        phone,
        firstName,
        otpHash,
        otpExpiresAt,
      });
    } else {
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
    console.error("Send OTP error:", error.message);

    return res.status(500).json({
      message: "Failed to generate OTP",
    });
  }
});

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

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

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
    console.error("Verify OTP error:", error.message);

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
});

module.exports = router;
