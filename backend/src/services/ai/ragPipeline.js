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

            let results;
            try {
                results = await vectorStore.similaritySearch(query, 10, filter);
            } catch (searchError) {
                if (searchError.message.includes("needs to be indexed as filter")) {
                    console.warn("⚠️ Database filter index missing. Falling back to manual filtering.");
                    // Fallback: search without filter and filter manually in-memory
                    const allResults = await vectorStore.similaritySearch(query, 20);
                    results = allResults.filter(doc => {
                        let match = true;
                        if (filter.classroomId && doc.metadata.classroomId !== filter.classroomId) match = false;
                        if (filter.materialId && doc.metadata.materialId !== filter.materialId) match = false;
                        return match;
                    }).slice(0, 4); // Keep only top 4 matches after filtering
                } else {
                    throw searchError;
                }
            }

            console.log(`AI Search: Found ${results.length} relevant chunks.`);
            
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


