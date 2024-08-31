const express = require("express");
const router = express.Router();
const Follow = require("../models/Follow");
const User = require("../models/User");
const auth = require("../middlewares/auth");

// Follow một người dùng
router.post("/", auth, async (req, res) => {
    const { id: followingId } = req.body;
    const followerId = req.user.id;

    try {
        const userToFollow = await User.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const alreadyFollowing = await Follow.findOne({ follower: followerId, following: followingId });
        if (alreadyFollowing) {
            return res.status(400).json({ msg: 'You are already following this user' });
        }

        const follow = new Follow({ follower: followerId, following: followingId });
        await follow.save();

        res.json({ msg: `You are now following ${userToFollow.name}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Unfollow một người dùng
router.delete("/", auth, async (req, res) => {
    const { id: followingId } = req.body;
    const followerId = req.user.id;

    try {
        const followRecord = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
        if (!followRecord) {
            return res.status(400).json({ msg: 'You are not following this user' });
        }

        res.json({ msg: `You have unfollowed the user` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Lấy danh sách người dùng mà tôi đang theo dõi
router.get("/following", auth, async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.user.id }).populate('following', 'name');
        res.json(following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Lấy danh sách người dùng đang theo dõi tôi
router.get("/followers", auth, async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.user.id }).populate('follower', 'name');
        res.json(followers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
