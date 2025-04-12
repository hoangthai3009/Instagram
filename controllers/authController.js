const User = require('../models/User');
const sendToken = require('../utils/sendToken');

// Đăng ký
exports.register = async (req, res) => {
    const { fullName, email, password, dateOfBirth, gender } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: 'Email đã được sử dụng' });

        const user = await User.create({
            fullName,
            email,
            password,
            profile: {
                dateOfBirth,
                gender,
            },
        });

        sendToken(user, res, 201, 'Đăng ký thành công');
    } catch (err) {
        res.status(500).json({ message: 'Lỗi đăng ký', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(process.env.CLOUDINARY_API_KEY)
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        sendToken(user, res, 200, 'Đăng nhập thành công');
    } catch (err) {
        res.status(500).json({ message: 'Lỗi đăng nhập', error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Không thể lấy thông tin user', error: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token').status(200).json({ message: 'Đăng xuất thành công' });
};
