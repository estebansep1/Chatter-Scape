const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

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
    return res.status(400).json({ message: "Invalid credentials." });
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(403).json({
      message: "Account is locked. Please try again later.",
      lockoutUntil: user.lockUntil.getTime(),
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    if (user.failedLoginAttempts >= 4) {
      user.timesLocked += 1;
      const lockDuration = calculateLockDuration(user.timesLocked);
      user.lockUntil = new Date(Date.now() + lockDuration);
      user.failedLoginAttempts = 0;

      console.log(
        `[DEBUG] User ${
          user.username
        }: Locked until ${user.lockUntil.toISOString()}`
      );
    } else {
      user.failedLoginAttempts += 1;

      // Check if the user's account was previously locked and if they've already attempted to log in unsuccessfully
      if (user.timesLocked > 0) {
        // Lock the account again after the first failed attempt
        const lockDuration = calculateLockDuration(user.timesLocked);
        user.lockUntil = new Date(Date.now() + lockDuration);
        user.failedLoginAttempts = 0;

        console.log(
          `[DEBUG] User ${
            user.username
          }: Locked until ${user.lockUntil.toISOString()}`
        );
      }
    }
    await user.save();
    return res.status(400).json({ message: "Invalid credentials." });
  }

  user.failedLoginAttempts = 0;
  user.timesLocked = 0;
  user.lockUntil = null;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({
    token,
    userId: user._id.toString(),
    profileCompleted: user.profileCompleted,
    message: "Login successful!",
  });

  function calculateLockDuration(timesLocked) {
    switch (timesLocked) {
      case 1:
        return 10 * 60 * 1000;
      case 2:
        return 30 * 60 * 1000;
      case 3:
        return 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }
});

// Cheking username availabilty route
router.post("/check-username", authMiddleware, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ message: "Username is already taken." });
    }
    res.status(200).json({ message: "Username is available." });
  } catch (error) {
    res.status(500).json({ message: "Error checking username availability" });
  }
});

module.exports = router;
