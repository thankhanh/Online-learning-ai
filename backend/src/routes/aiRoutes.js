const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for disk storage
const uploadDir = path.join(__dirname, '../../temp_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'));
        }
    }
});

// @route   POST /api/ai/ask
// @desc    Ask a question to AI (RAG)
// @access  Private
router.post('/ask', auth, aiController.askAI);

// @route   GET /api/ai/history
// @desc    Get AI Chat History for a user
// @access  Private
router.get('/history', auth, aiController.getChatHistory);

// @route   POST /api/ai/upload (alias: /ingest)
// @desc    Upload and ingest a document
// @access  Private
router.post('/upload', auth, upload.single('file'), aiController.ingestDocument);

// @route   POST /api/ai/ingest (same as /upload, AI branch alias)
router.post('/ingest', auth, upload.single('file'), aiController.ingestDocument);

module.exports = router;
