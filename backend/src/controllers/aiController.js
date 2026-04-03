const aiService = require('../services/ai/aiService');
const Material = require('../models/Material');
const AIChat = require('../models/AIChat');

exports.askAI = async (req, res) => {
    try {
        const { question, classroomId, materialId } = req.body;
        const userId = req.user.id;

        if (!question) {
            return res.status(400).json({ message: "Question is required." });
        }

        // 1. Get answer from AI Service
        const filter = {};
        if (classroomId) filter.classroomId = classroomId;
        if (materialId) filter.materialId = materialId;

        const answer = await aiService.askQuestion(question, filter);

        // 2. Save to History
        const chat = new AIChat({
            user: userId,
            classroom: classroomId || null,
            material: materialId || null,
            question,
            answer
        });

        // Classroom is required in the model, let's find it if not provided but materialId is
        if (!classroomId && materialId) {
            const mat = await Material.findById(materialId);
            if (mat) chat.classroom = mat.classroom;
        }

        if (chat.classroom) {
            await chat.save();
        } else {
            console.warn("AI Chat not saved: classroomId is missing and could not be inferred.");
        }

        res.json({ success: true, answer });
    } catch (error) {
        console.error("Error in askAI controller:", error);
        res.status(500).json({ message: "Error processing AI request.", error: error.message });
    }
};

/**
 * Get AI Chat History for a user
 * Optional filters: classroomId, materialId
 */
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { classroomId, materialId } = req.query;

        const query = { user: userId };
        if (classroomId) query.classroom = classroomId;
        if (materialId) query.material = materialId;

        const history = await AIChat.find(query)
            .sort({ createdAt: 1 }) // Chronological order
            .limit(50)
            .populate('material', 'title');

        res.json({ success: true, history });
    } catch (error) {
        console.error("Error fetching AI history:", error);
        res.status(500).json({ message: "Error fetching AI history.", error: error.message });
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
