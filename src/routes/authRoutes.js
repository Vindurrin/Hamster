const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { csrfProtection } = require('../middleware/csrf');
const { protect } = require('../middleware/auth');

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', csrfProtection, authController.resetPassword);
router.post('/refresh-token', protect, authController.refreshToken);
router.post('/logout', protect, authController.logout);

module.exports = router;