const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
    coursesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Middleware to update slug before saving if name changes
categorySchema.pre('validate', function(next) {
    if (this.name && (this.isModified('name') || !this.slug)) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
