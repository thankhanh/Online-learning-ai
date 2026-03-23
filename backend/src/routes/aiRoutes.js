const express = require('express');
const router = express.Router();
const aiService = require('../services/ai/aiService');
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

const upload = multer({ storage });

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ success: false, message: 'Question is required' });
        }

        const answer = await aiService.askQuestion(question);
        
        res.json({
            success: true,
            answer: answer.trim()
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process AI request. Is Ollama running?', 
            error: error.message 
        });
    }
});

// POST /api/ai/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const result = await aiService.processDocument(filePath);

        // Delete the file after processing to save space
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: "Document processed and stored in memory.",
            chunks: result.chunks
        });

    } catch (error) {
        console.error("AI Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process document.",
            error: error.message
        });
    }
});

module.exports = router;
