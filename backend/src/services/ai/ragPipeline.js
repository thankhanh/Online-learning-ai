// This file will hold the RAG processing logic
// 1. Load PDF
// 2. Split Text
// 3. Vectorize
// 4. Store

const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const pdf = require('pdf-parse');

class RagPipeline {
    constructor() {
        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            model: 'nomic-embed-text', // Or whatever embedding model user has
        });
        this.vectorStore = null;
    }

    async ingestDocument(fileBuffer) {
        try {
            console.log("Starting document ingestion...");
            const data = await pdf(fileBuffer);
            const text = data.text;

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            const docs = await textSplitter.createDocuments([text]);
            console.log(`Split document into ${docs.length} chunks.`);

            this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this.embeddings);
            console.log("Vector store initialized.");
            return true;
        } catch (error) {
            console.error("Error in ingestDocument:", error);
            throw error;
        }
    }

    async retrieveContext(query) {
        if (!this.vectorStore) {
            console.warn("Vector store not initialized. Returning empty context.");
            return "";
        }
        try {
            const results = await this.vectorStore.similaritySearch(query, 4);
            return results.map(doc => doc.pageContent).join("\n\n");
        } catch (error) {
            console.error("Error in retrieveContext:", error);
            throw error;
        }
    }
}

module.exports = new RagPipeline();

