const users = require('../Models/userModel');
// import json webtoken
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register
exports.registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Inside RegisterController', username, email, password);

        // Check if the user already exists
        const existingUser = await users.findOne({ email: email });
        if (existingUser) {
            return res.status(406).json('Account already exists');
        }

        // Create a new user
        const newUser = new users({
            username: username,
            email: email,
            password: password,
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json('Successfully Created');
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during registration', details: err.message });
    }
};

// Login
exports.loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists with the provided email and password
        const existingUser = await users.findOne({ email: email, password: password });
        if (existingUser) {
            const token = jwt.sign({ userId: existingUser._id }, process.env.JWTSECRET)
            console.log("token : ", token);
            res.status(200).json(
                { existingUser, token }
            );
        } else {
            res.status(401).json('Invalid email or password');
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during login', details: err.message });
    }
};
// get all users
exports.getAllUserController = async (req, res) => {
    try {
        const user = await users.find();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err)
    }
};
// delete user by id
exports.deleteByIdController = async (req, res) => {
    const { id } = req.params;
    try {
        await users.findByIdAndDelete({ _id: id });
        res.status(200).json('user deleted successfully');
    }
    catch (err) {
        res.status(401).json(err);
    }
}
// my profile update
exports.updateUserProfileController = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.payload; // Assuming you're using authentication middleware

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.password = password || user.password;

        if (req.file) {
            const filePath = req.file.path.replace(/^uploads[\\/]/, '');
            user.pic = filePath; // Save only the filename
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
// get user details
exports.getUserDetailsController = async (req, res) => {
    try {
        const userId = req.payload; // Extracted from the token
        const user = await users.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching user details.', details: err.message });
    }
};
