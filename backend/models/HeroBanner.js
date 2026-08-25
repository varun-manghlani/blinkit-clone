const mongoose = require("mongoose");

const heroBannerSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("HeroBanner", heroBannerSchema);
