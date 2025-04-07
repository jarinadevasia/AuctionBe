const mongoose = require('mongoose');

// Bid Schema
const bidSchema = new mongoose.Schema(
  {
    productId: {
      type: String, // References the Product by its ID
      required: true,
    },
    userId: {
      type: String, // References the User by its ID
      required: true,
    },
    bidValue: {
      type: Number, // Value of the bid
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically records the time of the bid
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Bids = mongoose.model('Bids', bidSchema);
module.exports = Bids;
