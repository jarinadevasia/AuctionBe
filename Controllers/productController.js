const Product = require('../Models/productModel');
const User = require('../Models/userModel');
const Bid = require('../Models/BidModel');
const Payment = require('../Models/paymentModel');

// Add a new product
exports.addProductController = async (req, res) => {
  console.log('Inside add product controller');
  const userId = req.payload;
  console.log('UserId:', userId);

  const imageUrl = req.file ? req.file.filename : null;
  console.log('Image file name:', imageUrl);

  const { name, description, initialPrice, endDate, endTime } = req.body;

  try {
    const newProduct = new Product({
      name, description, initialPrice, userId, endDate, endTime, imageUrl
    });
    await newProduct.save();
    res.status(200).json("Product uploaded successfully");
  } catch (err) {
    res.status(500).json({ error: "Product upload failed", details: err });
  }
};

// Place a bid on a product
exports.placeBidController = async (req, res) => {
  try {
    const { userId, productId, bidValue } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json('User not found.');
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json('Product not found.');
    }

    // Check if the bidding period has ended
    const currentDate = new Date();
    const productEndDate = new Date(`${product.endDate}T${product.endTime}`);
    if (currentDate > productEndDate) {
      return res.status(400).json({ message: "Bidding is closed for this product." });
    }

    // Ensure the bid value is higher than the current bid
    if (bidValue <= product.currentBid) {
      return res.status(400).json({ message: "Bid value must be higher than the current bid." });
    }

    // Add the new bid to the product
    product.bids.push({
      bidder: userId,
      bidValue: bidValue,
      timestamp: new Date()
    });

    // Update the current bid
    product.currentBid = bidValue;

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "Bid placed successfully",
      product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products
// Get all active products (filtered by Indian time)
exports.getAllProductsController = async (req, res) => {
  try {
    // Get all products without filtering
    const products = await Product.find().lean();
    
    // Convert to IST and add a flag for active status
    const productsWithStatus = products.map(product => {
      const isActive = checkIfActive(product.endDate, product.endTime);
      return { ...product, isActive };
    });
    
    res.status(200).json(productsWithStatus);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

function checkIfActive(endDate, endTime) {
  if (!endDate || !endTime) return false;
  
  try {
    // Parse the date assuming format is DD/MM/YYYY (common in India)
    const [day, month, year] = endDate.split('/');
    const [hours, minutes] = endTime.split(':');
    
    // Create date object in local time (assuming server is set to IST)
    const endDateObj = new Date(year, month-1, day, hours, minutes);
    const now = new Date();
    
    return endDateObj > now;
  } catch (e) {
    console.error("Date parsing error:", e);
    return false;
  }
}

// Get all product uploaded by a specific user
exports.getUserProductController = async (req, res) => {
  const userId = req.payload;
  try {
    const allUserProduct = await Product.find({ userId: userId });
    res.status(200).json(allUserProduct);
  }
  catch (err) {
    res.send(401).json('request failed due to :', err)
  }
};

// Update product
exports.updateProductController = async (req, res) => {
  console.log('inside the updateProductController');
  const { id } = req.params;
  const userId = req.payload;
  const { name, description, initialPrice, endDate, endTime, imageUrl } = req.body;
  const uploadedImageUrl = req.file ? req.file.filename : imageUrl;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      { name, description, initialPrice, userId, endDate, endTime, imageUrl: uploadedImageUrl },
      { new: true }
    );
    res.status(200).json({ message: "Product updated successfully", updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete product
exports.deleteProductController = async (req, res) => {
  const { id } = req.params;
  const userId = req.payload;

  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: id, userId });
    if (!deletedProduct) {
      return res.status(404).json("Product not found or unauthorized");
    }
    res.status(200).json("Product deleted successfully");
  } catch (err) {
    res.status(500).json({ error: "Product deletion failed", details: err });
  }
};

// get product details by id
exports.getProductDetailsByIdController = async (req, res) => {
  const { id } = req.params; // Extract the product ID from the request parameters
  console.log('Inside getProductDetailsByIdController:', id);

  try {
    // Use findById to fetch the product by its MongoDB _id
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' }); // Return 404 if no product is found
    }

    res.status(200).json(product); // Send the product details as a response
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: 'Server error. Please try again later.' }); // Return a server error response
  }
}

// delete product by id 
exports.deleteByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete({ _id: id });
    res.status(200).json('Product deleted successfully');
  }
  catch (err) {
    res.status(401).json(err);
  }
}

// adding bid
exports.addBidController = async (req, res) => {
  const { productId, bidValue } = req.body;
  const userId = req.payload;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check for existing bids by this user
    const existingUserBid = await Bid.findOne({ productId, userId });

    if (existingUserBid) {
      // Update existing bid (PUT logic)
      if (bidValue <= existingUserBid.bidValue) {
        return res.status(400).json({ message: 'New bid must be higher than your previous bid' });
      }
      existingUserBid.bidValue = bidValue;
      await existingUserBid.save();
    } else {
      // Create new bid (POST logic)
      const highestBid = await Bid.findOne({ productId }).sort({ bidValue: -1 });
      const minBidAmount = highestBid ? highestBid.bidValue : product.initialPrice;
      
      if (bidValue <= minBidAmount) {
        return res.status(400).json({ 
          message: `Bid must be greater than ${highestBid ? 'current highest bid' : 'initial price'} (${minBidAmount})`
        });
      }
      
      const bid = new Bid({ productId, userId, bidValue });
      await bid.save();
    }

    // Update product's current price
    const newHighestBid = await Bid.findOne({ productId }).sort({ bidValue: -1 });
    product.currentPrice = newHighestBid.bidValue;
    await product.save();

    res.status(200).json({ 
      message: 'Bid updated successfully',
      highestBid: newHighestBid.bidValue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// get bidding product
exports.getBiddingProductController = async (req, res) => {
  const { id } = req.params; // Ensure the parameter is named `id`

  try {
    const highestBid = await Bid.findOne({ productId: id }).sort({ bidValue: -1 });
    if (highestBid) {
      res.status(200).json(highestBid);
    } else {
      res.status(404).json({ message: 'No bids found for this product' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user's bidding history
exports.getUserBidHistoryController = async (req, res) => {
  const userId = req.payload;

  try {
    // Find all bids by this user
    const userBids = await Bid.find({ userId }).sort({ timestamp: -1 });

    if (userBids.length === 0) {
      return res.status(404).json({ message: 'No bids found for this user' });
    }

    // Get product details for each bid
    const bidsWithProducts = await Promise.all(
      userBids.map(async (bid) => {
        const product = await Product.findById(bid.productId);
        
        // Get the highest bid for this product to determine current price
        const highestBid = await Bid.findOne({ productId: bid.productId })
          .sort({ bidValue: -1 })
          .limit(1);

        return {
          bidId: bid._id,
          bidValue: bid.bidValue,
          bidTime: bid.timestamp,
          product: product
            ? {
                id: product._id,
                name: product.name,
                initialPrice: product.initialPrice,
                currentPrice: highestBid ? highestBid.bidValue : product.initialPrice,
                imageUrl: product.imageUrl, // Make sure this matches your model
                auctionDate: product.endDate,
                endingTime: product.endTime
              }
            : null
        };
      })
    );

    res.status(200).json(bidsWithProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create payment for winning bid
// paymentController.js
exports.createPaymentController = async (req, res) => {
  try {
    const { productId, userId, amount, name, houseName, place, landmark } = req.body;
    
    // Create new payment
    const newPayment = new Payment({
      productId,
      userId,
      amount,
      name,
      houseName,
      place,
      landmark
    });

    const savedPayment = await newPayment.save();
    
    // After payment is created, delete all bids for this product
    try {
      await Bid.deleteMany({ productId: productId });
      console.log(`Deleted all bids for product ${productId}`);
    } catch (deleteError) {
      console.error('Error deleting bids:', deleteError);
      // Even if bid deletion fails, we still return the payment success
      // You might want to handle this differently based on your requirements
    }
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

// Get all payments made by a specific user
exports.getUserPaymentsController = async (req, res) => {
  const userId = req.payload; // The seller's user ID
  try {
    // First find all products owned by this user
    const userProducts = await Product.find({ userId: userId });
    const productIds = userProducts.map(product => product._id);
    
    // Then find all payments for these products
    const receivedPayments = await Payment.find({ productId: { $in: productIds } })
      .populate('productId', 'name'); // Include product name
    
    res.status(200).json(receivedPayments);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch received payments', 
      error: err.message 
    });
  }
};

