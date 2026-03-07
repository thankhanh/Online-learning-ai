const aiService = require('../services/ai/aiService');
const Material = require('../models/Material');

exports.askAI = async (req, res) => {
    try {
        const { question, classroomId } = req.body;
        if (!question) {
            return res.status(400).json({ message: "Question is required." });
        }

        // Optional: filter by classroom if provided
        const filter = classroomId ? { classroomId } : {};
        const answer = await aiService.askQuestion(question, filter);
        res.json({ answer });
    } catch (error) {
        console.error("Error in askAI controller:", error);
        res.status(500).json({ message: "Error processing AI request.", error: error.message });
    }
};

exports.ingestDocument = async (req, res) => {
    try {
        const { title, classroomId, userId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded. Please upload a PDF file." });
        }

        if (!classroomId || !userId) {
            return res.status(400).json({
                message: "Missing required fields: classroomId and userId are required."
            });
        }

        const filePath = file.path;

        // 1. Create Material record
        const material = new Material({
            title: title || file.originalname,
            fileUrl: filePath,
            classroom: classroomId,
            uploadedBy: userId,
            vectorsStored: false
        });
        await material.save();

        // 2. Process document with metadata
        const metadata = {
            materialId: material._id.toString(),
            classroomId: classroomId
        };

        await aiService.processDocument(filePath, metadata);

        // 3. Mark as processed
        material.vectorsStored = true;
        await material.save();

        res.json({
            message: "File uploaded and trained successfully.",
            materialId: material._id,
            fileName: file.originalname
        });
    } catch (error) {
        console.error("Error in ingestDocument controller:", error);
        res.status(500).json({ message: "Error ingesting document.", error: error.message });
    }
};
