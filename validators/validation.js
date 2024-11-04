const { body } = require('express-validator');

const registerValidation = [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('profile.dateOfBirth', 'Date of Birth is required').isISO8601(),
];

const loginValidation = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
];

module.exports = {
    registerValidation,
    loginValidation,
};
