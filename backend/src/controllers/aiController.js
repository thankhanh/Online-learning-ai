const aiService = require('../services/ai/aiService');

exports.askAI = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: "Question is required." });
        }

        const answer = await aiService.askQuestion(question);
        res.json({ answer });
    } catch (error) {
        console.error("Error in askAI controller:", error);
        res.status(500).json({ message: "Error processing AI request.", error: error.message });
    }
};

exports.ingestDocument = async (req, res) => {
    try {
        // In a real scenario, we'd use multer to handle the file upload
        // For now, let's assume the client sends a filePath (for local testing)
        // or we'll implement multer later.
        const { filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ message: "FilePath is required." });
        }

        await aiService.processDocument(filePath);
        res.json({ message: "Document ingested successfully." });
    } catch (error) {
        console.error("Error in ingestDocument controller:", error);
        res.status(500).json({ message: "Error ingesting document.", error: error.message });
    }
};
