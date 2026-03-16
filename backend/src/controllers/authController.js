const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidPassword, isRequired } = require('../utils/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!isRequired(name)) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'student',
            displayName: name.trim()
        });

        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.warn('WARNING: JWT_SECRET is not defined in environment variables. Using default secret for development.');
        }

        jwt.sign(
            payload,
            jwtSecret || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        displayName: user.displayName,
                        avatar: user.avatar
                    }
                });
            }
        );
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        if (!isRequired(password)) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const jwtSecret = process.env.JWT_SECRET;
        jwt.sign(
            payload,
            jwtSecret || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        displayName: user.displayName || user.name,
                        avatar: user.avatar
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (Placeholder)
 * @access  Private
 */
exports.logout = async (req, res) => {
    // In a stateless JWT system, logout is usually handled by the client
    // removing the token. This endpoint is a placeholder for future
    // token blacklisting if required.
    res.json({ success: true, message: 'Successfully logged out' });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error('GetMe Error:', err.message);
        res.status(500).json({ message: 'Server Error retrieving profile' });
    }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { displayName, avatar } = req.body;
        const userFields = {};
        if (displayName) userFields.displayName = displayName.trim();
        if (avatar) userFields.avatar = avatar;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (err) {
        console.error('UpdateProfile Error:', err.message);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};
