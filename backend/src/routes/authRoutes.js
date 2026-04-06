const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { auth, authorize } = require('../middleware/authMiddleware');

// Multer configuration for Avatar Uploads
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ được phép tải lên file ảnh (jpeg, jpg, png, gif, webp)'));
        }
    }
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

// New Routes
router.put('/change-password', auth, authController.changePassword);
router.post('/upload-avatar', auth, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
