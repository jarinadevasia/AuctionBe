const admins = require('../Models/AdminModel');
// import json webtoken
const jwt = require("jsonwebtoken");

// Admin Login
exports.adminLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists with the provided email and password
        const existingAdmin = await admins.findOne({ email, password });

        if (existingAdmin) {
            // Login successful
            const token = jwt.sign({ adminId: existingAdmin._id }, process.env.ADMINSECRET);
            console.log("admin token : ", token)
            res.status(200).json({ message: 'Login successful', admin: existingAdmin, token: token });
        } else {
            // Login failed
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        // Handle server-side errors
        res.status(500).json({ error: 'An error occurred during login', details: err.message });
    }
};

// Admin details
exports.getAdminDetailsController = async (req, res) => {
    try {
        const admin = await admins.findOne({}); // Fetch the first admin (or use a specific query)
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}
exports.updateAdminDetailsController = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      let pic;
  
      if (req.file) {
        // If a new file is uploaded, use its filename
        pic = req.file.filename;
      } else {
        // If no file is uploaded, retain the existing image
        const existingAdmin = await admins.findOne({});
        pic = existingAdmin.pic;
      }
  
      // Find and update the admin
      const updatedAdmin = await admins.findOneAndUpdate(
        {}, // Match the first admin (or use a specific query)
        { name, email, password, pic },
        { new: true, runValidators: true } // Return the updated document
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      res.status(200).json({ message: "Admin details updated successfully", admin: updatedAdmin });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  }