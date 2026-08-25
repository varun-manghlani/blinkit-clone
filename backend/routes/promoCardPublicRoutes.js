const express = require("express");

const PromoCard = require("../models/PromoCard");

const router = express.Router();

// ==========================================
// GET ACTIVE PROMO CARDS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const promoCards = await PromoCard.find({
      isActive: true,
    })
      .populate("products")
      .sort({ createdAt: -1 });

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

module.exports = router;
