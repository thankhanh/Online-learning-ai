const Category = require('../models/Category');
const Classroom = require('../models/Classroom');

// GET /api/categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        
        // Dynamic coursesCount for each category
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const count = await Classroom.countDocuments({ category: cat._id });
            const catObj = cat.toObject();
            catObj.coursesCount = count;
            return catObj;
        }));

        res.json({ success: true, categories: categoriesWithCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
        
        const category = new Category({ name, description, status });
        await category.save();
        
        res.status(201).json({ success: true, category });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Category already exists' });
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const category = await Category.findById(req.params.id);
        
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        
        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (status) category.status = status;
        
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        // Constraint: Cannot delete if there are active classrooms
        const classroomCount = await Classroom.countDocuments({ category: req.params.id });
        if (classroomCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa danh mục này vì đang có ${classroomCount} lớp học đang hoạt động.` 
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
