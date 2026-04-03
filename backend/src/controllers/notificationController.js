const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
        
        // If no notifications, create some dummy ones for demo purposes (on first load)
        if (notifications.length === 0) {
            const dummy = [
                { user: req.user.id, type: 'system', title: 'Chào mừng bạn!', content: 'Chào mừng bạn đến với AI Hub. Hãy bắt đầu khám phá các lớp học nhé.', read: false },
                { user: req.user.id, type: 'course', title: 'Thông báo lớp học', content: 'Bạn đã được thêm vào lớp học mới.', read: true }
            ];
            const added = await Notification.insertMany(dummy);
            return res.json({ success: true, count: added.length, notifications: added });
        }

        res.json({ success: true, count: notifications.length, notifications });
    } catch (error) {
        console.error('Get Notifications Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        notification.read = true;
        await notification.save();

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Mark Read Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All Read Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await notification.deleteOne();
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete Notification Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for current user
 * @access  Private
 */
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.json({ success: true, message: 'All notifications deleted' });
    } catch (error) {
        console.error('Delete All Notifications Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
