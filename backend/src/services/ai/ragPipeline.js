// This file will hold the RAG processing logic
// 1. Load PDF
// 2. Split Text
// 3. Vectorize
// 4. Store

class RagPipeline {
    async ingestDocument(fileBuffer) {
        throw new Error("Method not implemented.");
    }

    async retrieveContext(query) {
        throw new Error("Method not implemented.");
    }
}

module.exports = new RagPipeline();
