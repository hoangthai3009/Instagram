const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

// Xem thông tin tất cả người dùng
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Xem thông tin người dùng theo userId
router.get("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Sửa thông tin người dùng
router.put('/', auth, async (req, res) => {
  const { name, email, profile } = req.body;

  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.profile = {
      ...user.profile,
      ...profile,
    };

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;