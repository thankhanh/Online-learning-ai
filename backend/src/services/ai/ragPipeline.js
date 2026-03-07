// This file will hold the RAG processing logic
// 1. Load PDF
// 2. Split Text
// 3. Vectorize
// 4. Store

const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { OllamaEmbeddings } = require('@langchain/ollama');
const mongoose = require('mongoose');
const pdf = require('pdf-parse');

class RagPipeline {
    constructor() {
        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            model: 'nomic-embed-text',
        });
        this.vectorStore = null;
    }

    async getVectorStore() {
        if (this.vectorStore) return this.vectorStore;

        if (mongoose.connection.readyState !== 1) {
            console.warn("MongoDB not connected yet.");
            return null;
        }

        const collection = mongoose.connection.db.collection("vectors");
        this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
            collection: collection,
            indexName: "vector_index", // User needs to create this in Atlas
            textKey: "text",
            embeddingKey: "embedding",
        });
        return this.vectorStore;
    }

    async ingestDocument(fileBuffer, metadata = {}, isPdf = true) {
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

            const docs = await textSplitter.createDocuments([text], [metadata]);
            console.log(`Split document into ${docs.length} chunks with metadata:`, metadata);

            const vectorStore = await this.getVectorStore();
            if (!vectorStore) throw new Error("Could not initialize Vector Store");

            await vectorStore.addDocuments(docs);
            console.log("Vectors saved to MongoDB.");
            return true;
        } catch (error) {
            console.error("Error in ingestDocument:", error);
            throw error;
        }
    }

    async retrieveContext(query, filter = {}) {
        const vectorStore = await this.getVectorStore();
        if (!vectorStore) {
            console.warn("Vector store not initialized. Returning empty context.");
            return "";
        }
        try {
            // MongoDB Atlas Vector Search supports
            const results = await vectorStore.similaritySearch(query, 4, filter);
            console.log(`AI Search: Found ${results.length} relevant context chunks.`);

            if (results.length === 0) {
                console.warn("⚠️ No relevant context found! Check if classroomId matches and Atlas Search Index allows filtering.");
                return "";
            }

            return results.map(doc => doc.pageContent).join('\n\n');
        } catch (error) {
            console.error("Error during similaritySearch:", error);
            throw error;
        }
    }
}


