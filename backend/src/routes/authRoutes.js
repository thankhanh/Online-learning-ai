const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { auth, authorize } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
