const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post("/updateProfile", async (req, res) => {
    const { userId, profileData } = req.body;

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