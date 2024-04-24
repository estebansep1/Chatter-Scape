const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const User = require('../models/user')
const authMiddleware = require('../middleware/authMiddleware')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

router.get('/profile', authMiddleware, async (req, res) => {
    console.log('Accessing /api/user/profile');
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ username: user.username, profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/updateProfile", upload.fields([{ name: 'profilePicture' }, { name: 'coverPhoto' }]), async (req, res) => {
    const { userId } = req.body;
    try {
        const User = require('../models/user');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.files['profilePicture'] && user.profilePicture) {
            const oldPath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
            fs.unlink(oldPath, (err) => {
                if (err) console.error("Failed to delete old profile picture:", err);
            });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.username = req.body.username || user.username;
        user.about = req.body.about || user.about;
        
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
