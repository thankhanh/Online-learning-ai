const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    score: { type: Number },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        essayAnswer: String,
        isCorrect: { type: Boolean, default: false }
    }],
    status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
    violations: [{
        type: { type: String }, // e.g., 'tab-switch'
        count: { type: Number, default: 1 },
        timestamp: { type: Date, default: Date.now }
    }],
    totalViolations: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
