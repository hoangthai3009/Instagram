const { generateToken } = require('../config/jwt');

const sendToken = (user, res, statusCode = 200, message = 'Thành công') => {
    const token = generateToken(user._id);

    res
        .status(statusCode)
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
            message,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.profile.avatar,
                role: user.role,
            },
        });
};

module.exports = sendToken;
