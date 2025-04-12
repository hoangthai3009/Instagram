const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy thông tin người dùng', error: err.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { fullName, bio, dateOfBirth, gender, interests, location } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        user.fullName = fullName || user.fullName;
        user.profile.bio = bio || user.profile.bio;
        user.profile.dateOfBirth = dateOfBirth || user.profile.dateOfBirth;
        user.profile.gender = gender || user.profile.gender;
        user.profile.interests = interests || user.profile.interests;
        user.profile.location = location || user.profile.location;

        await user.save();
        res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật thông tin người dùng', error: err.message });
    }
};

exports.updateUserAvatar = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: 'Không có ảnh nào được tải lên' });
        }

        const user = await User.findById(req.user._id);

        user.profile.avatar = req.file.path;
        await user.save();
        res.status(200).json({
            message: 'Cập nhật ảnh đại diện thành công',
            avatar: user.profile.avatar,
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật avatar', error: err.message });
    }
};

exports.updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword, renewPassword } = req.body;

    if (!currentPassword || !newPassword || !renewPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường' });
    }

    if (newPassword !== renewPassword) {
        return res.status(400).json({ message: 'Mật khẩu mới không khớp' });
    }

    try {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};