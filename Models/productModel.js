const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true, // Format: dd-mm-yyyy
    },
    endTime: {
      type: String,
      required: true, // Format: hh:mm:ss (24-hour format)
    },
    imageUrl: {
      type: String, // URL or file path of the uploaded image
      required: true,
    },
    isSold: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true } 
);


const Product = mongoose.model('Product', productSchema);
module.exports = Product;