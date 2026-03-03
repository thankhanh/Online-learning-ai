// This file will hold the RAG processing logic
// 1. Load PDF
// 2. Split Text
// 3. Vectorize
// 4. Store

const { RecursiveCharacterTextSplitter } = require('@langchain/classic/text_splitter');
const { MemoryVectorStore } = require('@langchain/classic/vectorstores/memory');
const { OllamaEmbeddings } = require('@langchain/ollama');
const pdf = require('pdf-parse');

class RagPipeline {
    constructor() {
        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            model: 'nomic-embed-text', // Or whatever embedding model user has
        });
        this.vectorStore = null;
    }

    async ingestDocument(fileBuffer, isPdf = true) {
        try {
            console.log(`Starting document ingestion (isPdf: ${isPdf})...`);
            let text = "";

            if (isPdf) {
                const data = await pdf(fileBuffer);
                text = data.text;
            } else {
                text = fileBuffer.toString('utf-8');
            }

            if (!text || text.trim().length === 0) {
                throw new Error("No text content found in document.");
            }

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

