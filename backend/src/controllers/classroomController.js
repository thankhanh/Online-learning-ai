const Classroom = require('../models/Classroom');
const User = require('../models/User');
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
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Classroom name is required' });
        }

        const classCode = generateClassCode();

        const classroom = new Classroom({
            name,
            description,
            lecturer: req.user.id,
            code: classCode, // Assuming we add 'code' to the model or handle it
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
