const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { name, role, status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (role) user.role = role;
        if (status) user.status = status;
        
        await user.save();
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   PUT /api/users/:id/reset-password
 * @desc    Reset user password to default '123456'
 * @access  Private/Admin
 */
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash('123456', salt);
        await user.save();

        res.json({ success: true, message: 'Mật khẩu đã được đặt lại về 123456' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/users
exports.createUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and role' });
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456', salt);

        // Create user
        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            displayName: name
        });

        await user.save();

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
