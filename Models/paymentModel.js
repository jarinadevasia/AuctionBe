// paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "Enter your name" // Default value
  },
  houseName: {
    type: String,
    required: true,
    default: "Enter your housename" // Default value
  },
  place: {
    type: String,
    required: true,
    default: "Enter your place" // Default value
  },
  landmark: {
    type: String,
    required: true,
    default: "Enter landmark" // Default value
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);