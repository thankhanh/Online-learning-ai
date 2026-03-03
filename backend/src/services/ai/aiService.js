const { Ollama } = require('@langchain/ollama');
const ragPipeline = require('./ragPipeline');
const fs = require('fs').promises;

class AIService {
    constructor() {
        this.model = new Ollama({
            baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            model: 'qwen2.5:1.5b',
        });
    }

    async processDocument(filePath) {
        try {
            // Decode URI component to handle %20 and other encoded characters
            const decodedPath = decodeURIComponent(filePath);
            const fileBuffer = await fs.readFile(decodedPath);
            const isPdf = decodedPath.toLowerCase().endsWith('.pdf');
            return await ragPipeline.ingestDocument(fileBuffer, isPdf);
        } catch (error) {
            console.error("Error processing document:", error);
            throw error;
        }
    }

    async askQuestion(question) {
        try {
            const context = await ragPipeline.retrieveContext(question);

            const prompt = `Bạn là một trợ lý học tập thông minh. 
Sử dụng ngữ cảnh dưới đây để trả lời câu hỏi của người dùng. 
Nếu không có ngữ cảnh hoặc ngữ cảnh không đủ thông tin, hãy trả lời dựa trên kiến thức của bạn và ghi chú rõ điều đó.

Ngữ cảnh:
${context}

Câu hỏi: ${question}
Trả lời:`;

            const response = await this.model.invoke(prompt);
            return response;
        } catch (error) {
            console.error("Error asking question:", error);
            throw error;
        }
    }
}

module.exports = new AIService();

