const { ChatGroq } = require('@langchain/groq');
const ragPipeline = require('./ragPipeline');

class QuizService {
    constructor() {
        // ✅ Hybrid: Dùng Groq Cloud cho Quiz Generation
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,   // Hơi cao hơn để tạo câu hỏi đa dạng
            maxRetries: 2,
        });
    }

    async generateQuiz(classroomId, numQuestions = 10) {
        try {
            // 1. Fetch context từ MongoDB Atlas Vector Search
            const filter = classroomId ? { classroomId } : {};
            const vectorStore = await ragPipeline.getVectorStore();
            let contextText = "";
            
            if (vectorStore) {
                const results = await vectorStore.similaritySearch(
                    "Quy định, khái niệm, tóm tắt bài học quan trọng", 
                    10, 
                    filter
                );
                if (results && results.length > 0) {
                    contextText = results.map(doc => doc.pageContent).join('\n\n');
                }
            }

            if (!contextText) {
                throw new Error("Không tìm thấy văn bản nào cho lớp học này. Vui lòng nạp File PDF/Tài liệu trước khi sinh câu hỏi.");
            }

            // 2. Prompt tối ưu cho Groq
            const prompt = `Bạn là giáo viên chuyên xây dựng đề thi trắc nghiệm. Dựa vào nội dung dưới đây, hãy tạo bài kiểm tra gồm chính xác ${numQuestions} câu hỏi trắc nghiệm.
            
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

            const response = await this.model.invoke(prompt);
            
            // 3. Parse JSON từ response
            let jsonStr = response.content.trim();
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.substring(7);
            }
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith('```')) {
                jsonStr = jsonStr.substring(0, jsonStr.length - 3);
            }
            
            let quizData = JSON.parse(jsonStr.trim());
            console.log("Raw parsed AI response:", quizData);

            // Handle various JSON structures
            if (!Array.isArray(quizData)) {
                if (quizData.quiz && Array.isArray(quizData.quiz)) quizData = quizData.quiz;
                else if (quizData.questions && Array.isArray(quizData.questions)) quizData = quizData.questions;
                else if (quizData.data && Array.isArray(quizData.data)) quizData = quizData.data;
                else {
                    for (let key in quizData) {
                        if (Array.isArray(quizData[key])) {
                            quizData = quizData[key];
                            break;
                        }
                    }
                }
            }
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
