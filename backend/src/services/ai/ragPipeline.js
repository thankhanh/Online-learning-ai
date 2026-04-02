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
            baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
            model: 'nomic-embed-text',
        });
        this.vectorStore = null;
    }

    async getVectorStore() {
        if (this.vectorStore) return this.vectorStore;

        let collection;
        const aiUri = process.env.MONGO_URI_AI;
        console.log("Checking MONGO_URI_AI...");

        if (aiUri && !aiUri.includes('<user>') && !aiUri.includes('xxxxx')) {
            console.log("✅ Using dedicated AI MongoDB database for vector storage.");
            // Use mongoose.createConnection for a separate connection
            const aiConn = mongoose.createConnection(aiUri);
            await aiConn.asPromise();
            collection = aiConn.db.collection("vectors");
            console.log("✅ Connected to AI-specific database.");
        } else {
            console.log("ℹ️ Using PRIMARY MongoDB database for vector storage (MONGO_URI_AI not configured or invalid).");
            if (mongoose.connection.readyState !== 1) {
                console.warn("Main MongoDB not connected yet. Vector store cannot be initialized.");
                return null;
            }
            collection = mongoose.connection.db.collection("vectors");
        }

        this.vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
            collection: collection,
            indexName: "vector_index",
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
                chunkSize: 500,
                chunkOverlap: 100,
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
            console.log(`AI Search Query: "${query}"`);
            console.log(`AI Search Filter: ${JSON.stringify(filter)}`);

            let results = await vectorStore.similaritySearch(query, 4, filter);
            console.log(`AI Search (Filtered): Found ${results.length} chunks.`);

            // Fallback for debugging: If filtered search returns 0, try without filter
            if (results.length === 0 && Object.keys(filter).length > 0) {
                console.log("Empty results with filter. Trying search WITHOUT filter for debugging...");
                const resultsNoFilter = await vectorStore.similaritySearch(query, 2);
                if (resultsNoFilter.length > 0) {
                    console.warn("⚠️ Found results WITHOUT filter! This confirms the Search Index 'filter' mapping might be missing or classroomId doesn't match.");
                }
            }

            if (results.length === 0) {
                return "";
            }

            return results.map(doc => doc.pageContent).join('\n\n');
        } catch (error) {
            console.error("Error during similaritySearch:", error);
            throw error;
        }
    }
}

module.exports = new RagPipeline();


