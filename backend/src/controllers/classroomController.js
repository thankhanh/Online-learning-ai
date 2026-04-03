const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Material = require('../models/Material');
const StudyProgress = require('../models/StudyProgress');
const crypto = require('crypto');

/**
 * @desc    Generate a unique 6-character classroom code
 * @returns {string}
 */
const generateClassCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

/**
 * @route   POST /api/classrooms
 * @desc    Create a new classroom
 * @access  Private/Lecturer
 */
exports.createClassroom = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Classroom name is required' });
        }

        const classCode = generateClassCode();

        const classroom = new Classroom({
            name,
            description,
            category,
            lecturer: req.user.id,
            code: classCode, 
            students: []
        });

        await classroom.save();

        res.status(201).json({
            success: true,
            message: 'Classroom created successfully',
            classroom
        });
    } catch (error) {
        console.error('Create Classroom Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error creating classroom' });
    }
};

/**
 * @route   GET /api/classrooms
 * @desc    Get all classrooms for the current user
 * @access  Private
 */
exports.getClassrooms = async (req, res) => {
    try {
        let classrooms;
        if (req.user.role === 'lecturer') {
            classrooms = await Classroom.find({ lecturer: req.user.id }).populate('students', 'name email');
        } else {
            classrooms = await Classroom.find({ students: req.user.id }).populate('lecturer', 'name email');
        }

        res.json({ success: true, count: classrooms.length, classrooms });
    } catch (error) {
        console.error('Get Classrooms Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error retrieving classrooms' });
    }
};

/**
 * @route   GET /api/classrooms/:id
 * @desc    Get classroom by ID
 * @access  Private
 */
exports.getClassroomById = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('lecturer', 'name email')
            .populate('students', 'name email');

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }

        // Check if user is part of the class
        const isLecturer = classroom.lecturer._id.toString() === req.user.id;
        const isStudent = classroom.students.some(s => s._id.toString() === req.user.id);

        if (!isLecturer && !isStudent && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, classroom });
    } catch (error) {
        console.error('Get Classroom Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   POST /api/classrooms/join
 * @desc    Join a classroom via code
 * @access  Private/Student
 */
exports.joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Classroom code is required' });
        }

        const classroom = await Classroom.findOne({ code });
        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Invalid classroom code' });
        }

        // Check if student already joined
        if (classroom.students.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You have already joined this classroom' });
        }

        classroom.students.push(req.user.id);
        await classroom.save();

        res.json({
            success: true,
            message: 'Joined classroom successfully',
            classroom
        });
    } catch (error) {
        console.error('Join Classroom Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   PUT /api/classrooms/:id
 * @desc    Update classroom
 * @access  Private/Lecturer
 */
exports.updateClassroom = async (req, res) => {
    try {
        let classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ success: false, message: 'Classroom not found' });

        // Ensure user is the lecturer
        if (classroom.lecturer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this classroom' });
        }

        classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ success: true, classroom });
    } catch (error) {
        console.error('Update Classroom Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/classrooms/:id
 * @desc    Delete classroom
 * @access  Private/Lecturer
 */
exports.deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ success: false, message: 'Classroom not found' });

        if (classroom.lecturer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Classroom.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Classroom removed' });
    } catch (error) {
        console.error('Delete Classroom Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
/**
 * @route   PUT /api/classrooms/:id/schedule
 * @desc    Update classroom schedule
 * @access  Private/Lecturer
 */
exports.updateSchedule = async (req, res) => {
    try {
        const { schedule } = req.body;
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) return res.status(404).json({ success: false, message: 'Classroom not found' });
        if (classroom.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        classroom.schedule = schedule;
        await classroom.save();

        res.json({ success: true, message: 'Schedule updated', schedule: classroom.schedule });
    } catch (error) {
        console.error('Update Schedule Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   POST /api/classrooms/:id/materials/:materialId/view
 * @desc    Mark a material as viewed and update progress
 * @access  Private/Student
 */
exports.markMaterialAsViewed = async (req, res) => {
    try {
        const { id, materialId } = req.params;

        // Verify material exists
        const material = await Material.findById(materialId);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        // Update or Create StudyProgress
        let progress = await StudyProgress.findOne({ student: req.user.id, classroom: id });
        if (!progress) {
            progress = new StudyProgress({
                student: req.user.id,
                classroom: id,
                viewedMaterials: [materialId]
            });
        } else {
            if (!progress.viewedMaterials.includes(materialId)) {
                progress.viewedMaterials.push(materialId);
            }
            progress.lastAccessedAt = Date.now();
        }

        await progress.save();
        res.json({ success: true, message: 'Progress updated' });
    } catch (error) {
        console.error('Mark Material Viewed Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/classrooms/:id/progress
 * @desc    Get student's progress in a classroom
 * @access  Private/Student
 */
exports.getClassroomProgress = async (req, res) => {
    try {
        const { id } = req.params;

        const totalMaterials = await Material.countDocuments({ classroom: id });
        if (totalMaterials === 0) return res.json({ success: true, progress: 100 }); // No materials means 100% complete? or 0? Let's say 100 or N/A.

        const progress = await StudyProgress.findOne({ student: req.user.id, classroom: id });
        const viewedCount = progress ? progress.viewedMaterials.length : 0;

        const percentage = Math.round((viewedCount / totalMaterials) * 100);

        res.json({ 
            success: true, 
            progress: percentage,
            viewedCount,
            totalMaterials 
        });
    } catch (error) {
        console.error('Get Progress Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/classrooms/:id/students/:studentId
 * @desc    Remove a student from classroom
 * @access  Private/Lecturer (Admin)
 */
exports.removeStudentFromClass = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const classroom = await Classroom.findById(id).populate('students', '_id');

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }

        // Verify authorized: lecturer or admin
        if (classroom.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Remove student from array
        classroom.students = classroom.students.filter(s => s._id.toString() !== studentId);
        await classroom.save();

        res.json({ success: true, message: 'Đã gỡ sinh viên khỏi lớp học.' });
    } catch (error) {
        console.error('Remove Student Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

