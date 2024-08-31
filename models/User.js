const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    bio: {
      type: String,
      default: 'This is my Bio!',
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
      required: true,
    },
    interests: [String],
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/300',
    },
    picture: [String],
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0.0, 0.0],
        index: '2dsphere',
      },
    },
  },
}, { timestamps: true });

// Hash mật khẩu trước khi lưu
UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Tạo JWT token
UserSchema.methods.generateToken = function (payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
};

module.exports = mongoose.model('User', UserSchema);
