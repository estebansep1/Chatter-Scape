const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

router.post("/updateProfile", upload.fields([{ name: 'profilePicture' }, { name: 'coverPhoto' }]), async (req, res) => {
    const { userId, about } = req.body;
    try {
        const User = require('../models/user');
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.username = req.body.username || user.username;
        user.about = about || user.about;

        if (req.files['profilePicture']) {
            user.profilePicture = req.files['profilePicture'][0].path;
        }
        if (req.files['coverPhoto']) {
            user.coverPhoto = req.files['coverPhoto'][0].path;
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

module.exports = router;
