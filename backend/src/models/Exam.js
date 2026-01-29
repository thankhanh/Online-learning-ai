const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    duration: { type: Number, required: true }, // in minutes
    questions: [{
        questionText: { type: String, required: true },
        options: [String],
        correctAnswer: String,
        type: { type: String, enum: ['multiple-choice', 'essay'], default: 'multiple-choice' }
    }],
    status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
    maxViolations: { type: Number, default: 3 },
    startTime: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);
