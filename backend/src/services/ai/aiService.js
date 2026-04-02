const { ChatGroq } = require('@langchain/groq');
const ragPipeline = require('./ragPipeline');
const fs = require('fs').promises;

class AIService {
    constructor() {
        // ✅ Hybrid: Dùng Groq Cloud cho Generation (nhanh, model 70B, miễn phí)
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,   // Giảm hallucination, trả lời chính xác
            maxRetries: 2,
        });
    }

    async processDocument(filePath, metadata = {}) {
        try {
            // ✅ Embedding vẫn chạy LOCAL qua Ollama (bảo mật tài liệu)
            const decodedPath = decodeURIComponent(filePath);
            const fileBuffer = await fs.readFile(decodedPath);
            const isPdf = decodedPath.toLowerCase().endsWith('.pdf');
            return await ragPipeline.ingestDocument(fileBuffer, metadata, isPdf);
        } catch (error) {
            console.error("Error processing document:", error);
            throw error;
        }
    }

    async askQuestion(question, filter = {}) {
        try {
            // Bước 1: Tìm context từ MongoDB (qua Ollama Embedding LOCAL)
            const context = await ragPipeline.retrieveContext(question, filter);

            // Bước 2: Gửi lên Groq Cloud để sinh câu trả lời
            const prompt = `Bạn là một giáo sư, trợ lý học tập chuyên nghiệp.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên Ngữ cảnh bên dưới. KHÔNG bịa thông tin.
2. Nếu Ngữ cảnh không đủ, hãy nói rõ "Tài liệu không đề cập đến vấn đề này" rồi mới bổ sung kiến thức chung.
3. Trả lời bằng Tiếng Việt, ngắn gọn, rõ ràng, có cấu trúc (dùng bullet point khi cần).
4. Trích dẫn nội dung cụ thể từ Ngữ cảnh để minh chứng.

Ngữ cảnh:
${context}

Câu hỏi: ${question}
Trả lời:`;

            const response = await this.model.invoke(prompt);
            return response.content;
        } catch (error) {
            console.error("Error asking question:", error);
            throw error;
        }
    }
}

module.exports = new AIService();
