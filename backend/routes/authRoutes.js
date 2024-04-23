const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Login route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        console.log("User not found");
        return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res.json({ token: token, userId: user._id.toString(), profileCompleted: user.profileCompleted, message: "Login successful!" });
});


router.post("/updateProfile", async (req, res) => {
    const { userId, profileData } = req.body;

    console.log("Received userId:", userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log("No user found for ID:", userId);
            return res.status(404).json({ message: "User not found" });
        }
    
        user.firstName = profileData.firstName || user.firstName;
        user.lastName = profileData.lastName || user.lastName;
        user.profilePicture = profileData.profilePicture || user.profilePicture;
        user.coverPhoto = profileData.coverPhoto || user.coverPhoto;
        user.profileCompleted = true;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Error updating profile", error: error.toString() });
    }
});



module.exports = router;
