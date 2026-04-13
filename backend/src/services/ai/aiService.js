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
        // Simple timeout promise
        const timeout = (ms) => new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`AI Request timed out after ${ms / 1000}s`)), ms)
        );

        try {
            console.log("🤖 AI Service: Processing question...");

            // Step 1: Retrieval with its own potential hang
            const retrievalTask = (async () => {
                console.log("🔍 AI Service: Retrieving context...");
                return await ragPipeline.retrieveContext(question, filter);
            })();

            // Step 2: Combine retrieval and timeout
            const context = await Promise.race([retrievalTask, timeout(25000)]);
            console.log("📝 AI Service: Context retrieved. Sending to Groq...");

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

            // Step 3: Generation with Groq
            const response = await Promise.race([this.model.invoke(prompt), timeout(15000)]);
            console.log("✅ AI Service: Answer generated.");
            return response.content;
        } catch (error) {
            console.error("❌ Error in AIService.askQuestion:", error.message);
            if (error.message.includes("timed out")) {
                throw new Error("Dịch vụ AI đang quá tải hoặc không thể kết nối tới Ollama/Groq. Vui lòng thử lại sau.");
            }
            throw error;
        }
    }
}

module.exports = new AIService();
