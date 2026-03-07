const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { OllamaEmbeddings } = require('@langchain/ollama');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testSearch() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected");

        const embeddings = new OllamaEmbeddings({
            baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
            model: 'nomic-embed-text',
        });

        const collection = mongoose.connection.db.collection("vectors");
        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        });

        const query = "Mục tiêu nghiên cứu là gì?";
        const classroomId = "6980e7970960e0fbd8c2b675";

        console.log(`Searching for: "${query}" with classroomId: ${classroomId}`);

        // Test WITHOUT filter
        const resultsNoFilter = await vectorStore.similaritySearch(query, 1);
        console.log("Results (No Filter):", resultsNoFilter.length > 0 ? "FOUND" : "NOT FOUND");
        if (resultsNoFilter.length > 0) console.log("Sample Result (No Filter):", resultsNoFilter[0].pageContent.substring(0, 100));

        // Test WITH filter
        const filter = { classroomId: classroomId };
        console.log("Applying filter:", JSON.stringify(filter));
        const resultsWithFilter = await vectorStore.similaritySearch(query, 1, filter);
        console.log("Results (With Filter):", resultsWithFilter.length > 0 ? "FOUND" : "NOT FOUND");

        process.exit(0);
    } catch (error) {
        console.error("❌ Search test failed:", error);
        process.exit(1);
    }
}

testSearch();
