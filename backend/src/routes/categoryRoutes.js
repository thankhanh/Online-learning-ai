const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/authMiddleware');

// Public or Student/Lecturer can GET categories, but only Admin can modify
router.get('/', categoryController.getAllCategories);

// Admin only routes
router.post('/', auth, authorize('admin'), categoryController.createCategory);
router.put('/:id', auth, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', auth, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
