const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const auth = require("../middlewares/auth");
const { uploadMultiple, uploadSingle } = require("../config/cloudinary");

// Tạo Post
router.post('/', auth, uploadMultiple('post'), async (req, res) => {
    const { caption, tags } = req.body;
    try {
        const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

        const newPost = new Post({
            caption,
            images,
            videos,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            author: req.user.id,
        });
        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Xem chi tiết một Post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email avatar')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'name avatar' }
            });
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cập nhật Post (nếu cần)
router.patch('/:id', auth, uploadMultiple('post'), async (req, res) => {
    const { caption, tags } = req.body;
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const images = req.files['images'] ? req.files['images'].map(file => file.path) : post.images;
        const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : post.videos;

        post.caption = caption || post.caption;
        post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
        post.images = images;
        post.videos = videos;

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
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

        await Comment.deleteMany({ post: post.id });

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

        const comment = new Comment({
            post: post.id,
            user: req.user.id,
            text,
        });

        await comment.save();

        post.comments.push(comment.id);
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

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await comment.remove();

        post.comments = post.comments.filter(commentId => commentId.toString() !== req.params.commentId);
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