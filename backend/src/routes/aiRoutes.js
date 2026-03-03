const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// All routes prefixed with /api/ai
router.post('/ask', aiController.askAI);
router.post('/ingest', aiController.ingestDocument);

module.exports = router;
