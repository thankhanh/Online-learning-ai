const { Ollama, OllamaEmbeddings } = require('@langchain/ollama');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MemoryVectorStore } = require('@langchain/classic/vectorstores/memory');

class AIService {
    constructor() {
        this.model = new Ollama({
            baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
            model: 'qwen2.5:1.5b',
            temperature: 0.3
        });
        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
            model: 'nomic-embed-text',
        });
        this.vectorStore = null;
    }

    async processDocument(filePath) {
        try {
            const loader = new PDFLoader(filePath);
            const docs = await loader.load();
            
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const splitDocs = await splitter.splitDocuments(docs);
            
            this.vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, this.embeddings);
            return { success: true, chunks: splitDocs.length };
        } catch (error) {
            console.error("Error processing document:", error);
            throw error;
        }
    }

    async askQuestion(question) {
        try {
            if (!this.vectorStore) {
                // Fallback: Answer generally if no document is loaded
                const prompt = `Bạn là một Gia sư AI thông minh và thân thiện. Hãy trả lời câu hỏi sau bằng tiếng Việt thật ngắn gọn và chính xác:\n\nHọc viên hỏi: ${question}\nTrả lời:`;
                return await this.model.invoke(prompt);
            }
            
            // RAG execution
            const results = await this.vectorStore.similaritySearch(question, 3);
            const context = results.map(r => r.pageContent).join('\n\n---\n\n');
            
            const prompt = `Bạn là một Gia sư AI. Dựa NHỮNG THÔNG TIN TRONG TÀI LIỆU DƯỚI ĐÂY, hãy trả lời câu hỏi của học viên bằng tiếng Việt. Nếu tài liệu không có thông tin, hãy nói "Tôi không tìm thấy thông tin này trong bài giảng."\n\n[TÀI LIỆU CUNG CẤP]:\n${context}\n\n[CÂU HỎI]: ${question}\n\n[GIA SƯ TRẢ LỜI]:`;
            
            const response = await this.model.invoke(prompt);
            return response;
        } catch (error) {
            console.error("Error in askQuestion:", error);
            throw error;
        }
    }
}

module.exports = new AIService();
