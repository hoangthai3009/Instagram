const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middlewares/auth");

// Tạo Post
router.post('/', auth, async (req, res) => {
    const { caption, images, videos, tags } = req.body;
    try {
        const newPost = new Post({
            caption,
            images,
            videos,
            tags,
            author: req.user.id,
        });
        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Xem chi tiết một Post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email')
            .populate('comments.user', 'name');
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Xóa một Post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await post.remove();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Like/Unlike một Post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Nếu người dùng đã thích bài viết, unlike bài viết
        if (post.likes.includes(req.user.id)) {
            post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Bình luận một Post
router.post('/:id/comment', auth, async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comment = {
            text,
            user: req.user.id,
        };

        post.comments.push(comment);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Xóa bình luận một Post
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Tìm và xóa bình luận
        const comment = post.comments.find(comment => comment.id === req.params.commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        post.comments = post.comments.filter(comment => comment.id !== req.params.commentId);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Save/Unsave một Post
router.post('/:id/save', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Nếu bài đăng đã được lưu, xóa bài đăng khỏi danh sách lưu
        if (user.savedPosts.includes(post.id)) {
            user.savedPosts = user.savedPosts.filter((savedPostId) => savedPostId.toString() !== post.id);
        } else {
            user.savedPosts.push(post.id);
        }

        await user.save();
        res.json(user.savedPosts);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
