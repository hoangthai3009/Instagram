const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
    },
    coordinates: {
        type: [Number],
        default: [0.0, 0.0],
        index: '2dsphere',
    },
});

module.exports = mongoose.model('Location', LocationSchema);
