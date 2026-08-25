const mongoose = require("mongoose");

const promoCardSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },

    redirectUrl: {
      type: String,
      required: true,
      trim: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PromoCard", promoCardSchema);
