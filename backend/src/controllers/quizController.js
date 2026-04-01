const quizService = require('../services/ai/quizService');

exports.generateQuiz = async (req, res) => {
    try {
        const { classroomId } = req.body;
        
        // Generating a quiz might take up to 20-30 seconds depending on LLM
        // the client must implement loading state
        const quizList = await quizService.generateQuiz(classroomId);

        if (!Array.isArray(quizList) || quizList.length === 0) {
            return res.status(500).json({ message: "AI generated empty or invalid quiz payload." });
        }

        res.json({ quiz: quizList });
    } catch (error) {
        console.error("Error in generateQuiz controller:", error);
        res.status(500).json({ message: "Error generating quiz.", error: error.message || error });
    }
};
