const ragPipeline = require('../services/ai/ragPipeline');
const fs = require('fs').promises;
const path = require('path');

async function test() {
    try {
        console.log("Starting test ingestion...");
        // Use an existing PDF if possible
        const uploadsDir = path.join(__dirname, '../../uploads/materials');
        const files = await fs.readdir(uploadsDir);
        const pdfFile = files.find(f => f.endsWith('.pdf'));
        
        if (!pdfFile) {
            console.error("No PDF file found in uploads to test with.");
            return;
        }

        const filePath = path.join(uploadsDir, pdfFile);
        const buffer = await fs.readFile(filePath);
        
        await ragPipeline.ingestDocument(buffer, { test: true }, true);
        console.log("✅ Test Ingestion Successful!");
    } catch (err) {
        console.error("❌ Test Ingestion Failed:", err);
    }
}

test();
