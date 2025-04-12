const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { getUserById, updateUserProfile, updateUserAvatar, updateUserPassword } = require('../controllers/userController');

const createUpload = require('../config/cloudinary');
const uploadAvatar = createUpload('instagram/user/avatars');

router.get('/:userId', protect, getUserById);
router.put('/update/profile', protect, updateUserProfile);
router.put('/update/avatar', protect, uploadAvatar.single('avatar'), updateUserAvatar);
router.put('/update/password', protect, updateUserPassword);

module.exports = router;
