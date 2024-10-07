const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: false,
    },
    images: [String],
    videos: [String],
    tags: [String],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    saved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
