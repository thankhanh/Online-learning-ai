const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileUrl: { type: String }, // For PDF/Slide
    content: { type: String }, // Extracted text for RAG
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vectorsStored: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
