// This file manages interactions with the Vector Database
// Separated to make it easier to switch DBs (Memory -> MongoDB -> Chroma)

class VectorStorage {
    async saveVectors(vectors) {
        // Logic to save vectors to DB
    }

    async searchSimilar(queryVector, limit = 5) {
        // Logic to query DB
    }
}

module.exports = new VectorStorage();
