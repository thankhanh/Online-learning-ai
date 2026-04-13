const Material = require('../models/Material');
const Classroom = require('../models/Classroom');
const fs = require('fs');
const path = require('path');
const aiService = require('../services/ai/aiService');

// @desc    Get all materials for a classroom
// @route   GET /api/materials/classroom/:classroomId
// @access  Private
exports.getMaterialsByClassroom = async (req, res) => {
    try {
        const materials = await Material.find({ classroom: req.params.classroomId })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: materials.length,
            materials
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all materials (Lecturer's own, Student's enrolled classes, or Admin)
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'lecturer') {
            query.uploadedBy = req.user.id;
        } else if (req.user.role === 'student') {
            // Find classrooms where student is enrolled
            const enrolledClassrooms = await Classroom.find({ students: req.user.id });
            const classroomIds = enrolledClassrooms.map(c => c._id);
            query.classroom = { $in: classroomIds };
        }

        const materials = await Material.find(query)
            .populate('classroom', 'name')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: materials.length,
            materials
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Upload a new material
// @route   POST /api/materials/upload
// @access  Private (Lecturer/Admin)
exports.uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { classroomId, title } = req.body;

        if (!classroomId) {
            // Delete the uploaded file if classroomId is missing
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Classroom ID is required' });
        }

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }

        // Relative path for storing in DB so it can be served statically
        const fileUrl = `/uploads/materials/${req.file.filename}`;

        const material = new Material({
            title: title || req.file.originalname,
            fileUrl,
            classroom: classroomId,
            uploadedBy: req.user.id,
            vectorsStored: false // Future RAG integration
        });

        await material.save();

        // Process document for AI RAG asynchronously
        // We do it in background so the user doesn't wait for vectorization to finish
        // but for now we'll just log success/fail.
        setImmediate(async () => {
            try {
                console.log(`[AI] Vectorizing material: ${material.title}`);
                await aiService.processDocument(path.join(__dirname, '../../', material.fileUrl), {
                    classroomId: material.classroom.toString(),
                    materialId: material._id.toString()
                });
                material.vectorsStored = true;
                await material.save();
                console.log(`[AI] Vectorization complete for: ${material.title}`);
            } catch (err) {
                console.error(`[AI] Vectorization failed for ${material.title}:`, err.message);
            }
        });

        res.status(201).json({
            success: true,
            material
        });
    } catch (err) {
        console.error(err.message);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private (Lecturer/Admin)
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }

        // Check ownership
        if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '../../', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await material.deleteOne();

        res.json({
            success: true,
            message: 'Material removed'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
