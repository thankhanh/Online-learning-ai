const mongoose = require('mongoose');

const studyProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    viewedMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    lastAccessedAt: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness per student & classroom
studyProgressSchema.index({ student: 1, classroom: 1 }, { unique: true });

module.exports = mongoose.model('StudyProgress', studyProgressSchema);
