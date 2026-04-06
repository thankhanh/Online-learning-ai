const { Ollama } = require('@langchain/ollama');
const ragPipeline = require('./ragPipeline');

class QuizService {
    constructor() {
        this.model = new Ollama({
            baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            model: 'qwen2.5:1.5b',
            format: 'json' // Request ollama to format as JSON if supported by model/server. Often helps.
        });
    }

    async generateQuiz(classroomId, numQuestions = 10) {
        try {
            // 1. Fetch larger context. Since we want a quiz, we fetch up to 12 chunks.
            const filter = classroomId ? { classroomId } : {};
            const vectorStore = await ragPipeline.getVectorStore();
            let contextText = "";
            
            if (vectorStore) {
                // Broad query to get a good mix of concepts
                const results = await vectorStore.similaritySearch("Quy định, khái niệm, tóm tắt bài học quan trọng", 10, filter);
                if (results && results.length > 0) {
                    contextText = results.map(doc => doc.pageContent).join('\n\n');
                }
            }

            if (!contextText) {
                // Fallback message if no context found
                throw new Error("Không tìm thấy văn bản nào cho lớp học này. Vui lòng nạp File PDF/Tài liệu trước khi sinh câu hỏi.");
            }

<<<<<<< Updated upstream
            // 2. Strong Prompt to force JSON format
            const prompt = `Bạn là giáo viên chuyên xây dựng đề thi trắc nghiệm. Dựa vào nội dung dưới đây, hãy tạo bài kiểm tra gồm chính xác 10 câu hỏi trắc nghiệm.
=======
            // 2. Prompt tối ưu cho Groq
            const prompt = `Bạn là giáo viên chuyên xây dựng đề thi trắc nghiệm. Dựa vào nội dung dưới đây, hãy tạo bài kiểm tra gồm chính xác ${numQuestions} câu hỏi trắc nghiệm.
>>>>>>> Stashed changes
            
Nội dung tài liệu:
${contextText}

Bạn PHẢI trả lời BẰNG ĐỊNH DẠNG JSON. Không giải thích thêm, không sinh thêm bất kỳ văn bản nào ngoài JSON. 
Định dạng JSON yêu cầu là một mảng Array chứa chính xác ${numQuestions} objects, mỗi object có cấu trúc như sau:
[
  {
    "question": "Nội dung câu hỏi của bạn?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "answer": "Đáp án A"
  }
]
> Lưu ý, "answer" phải giống y hệt chuỗi trong một "options". 
`;

            const rawResponse = await this.model.invoke(prompt);
            
            // 3. Clean and parse JSON
            // Ollama might still output some markdown blocks like ```json ... ```
            let jsonStr = rawResponse.trim();
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.substring(7); // remove ```json
            }
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith('```')) {
                jsonStr = jsonStr.substring(0, jsonStr.length - 3);
            }
            
            let quizData = JSON.parse(jsonStr.trim());
            console.log("Raw parsed AI response:", quizData);

            // Sometimes models return {"quiz": [...]} instead of just [...]
            if (!Array.isArray(quizData)) {
                if (quizData.quiz && Array.isArray(quizData.quiz)) quizData = quizData.quiz;
                else if (quizData.questions && Array.isArray(quizData.questions)) quizData = quizData.questions;
                else if (quizData.data && Array.isArray(quizData.data)) quizData = quizData.data;
                else {
                    // Try to find any property that is an array
                    for (let key in quizData) {
                        if (Array.isArray(quizData[key])) {
                            quizData = quizData[key];
                            break;
                        }
                    }
                }
            }
            // If it's STILL not an array, convert to an array to avoid crashes if it returned just 1 object
            if (!Array.isArray(quizData)) {
                quizData = [quizData]; 
            }

            return quizData;
        } catch (error) {
            console.error("Error in generateQuiz service:", error);
            throw new Error(error.message || "Lỗi tạo bài tập từ AI");
        }
    }
}

module.exports = new QuizService();
