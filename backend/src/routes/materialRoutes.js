const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for disk storage
const uploadDir = path.join(__dirname, '../../uploads/materials');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use original name but sanitize and add timestamp to avoid collisions
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, Date.now() + '-' + sanitizedName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only document files are allowed (pdf, doc, docx, ppt, pptx, txt)'));
        }
    }
});

// All routes require authentication
router.use(auth);

// GET /api/materials/classroom/:id
router.get('/classroom/:classroomId', materialController.getMaterialsByClassroom);

// GET /api/materials (Lecturer/Admin own materials, or Student's classes)
router.get('/', materialController.getMaterials);

// POST /api/materials/upload
router.post('/upload', authorize('lecturer', 'admin'), upload.single('file'), materialController.uploadMaterial);

// DELETE /api/materials/:id
router.delete('/:id', authorize('lecturer', 'admin'), materialController.deleteMaterial);

module.exports = router;
