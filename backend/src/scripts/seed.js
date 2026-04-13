const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Classroom = require('../models/Classroom');
const Material = require('../models/Material');
const Exam = require('../models/Exam');

const seedData = async () => {
    try {
        console.log('⏳ Connecting to Database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Classroom.deleteMany({});
        await Material.deleteMany({});
        await Exam.deleteMany({});

        const hashedPassword = await bcrypt.hash('123456', 10);

        // 1. Create Users
        console.log('👤 Creating sample users...');
        const admin = await User.create({
            name: 'Hệ thống Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            displayName: 'Quản trị viên'
        });

        const lecturer = await User.create({
            name: 'Nguyễn Giảng Viên',
            email: 'gv@example.com',
            password: hashedPassword,
            role: 'lecturer',
            displayName: 'Thầy Nguyễn'
        });

        const student = await User.create({
            name: 'Trần Sinh Viên',
            email: 'sv@example.com',
            password: hashedPassword,
            role: 'student',
            displayName: 'Sinh viên Trần'
        });

        // 2. Create Categories
        console.log('📁 Creating categories...');
        const categories = await Category.insertMany([
            { name: 'Công nghệ thông tin', slug: 'cong-nghe-thong-tin', description: 'Các môn học về lập trình, phần mềm' },
            { name: 'Ngoại ngữ', slug: 'ngoai-ngu', description: 'Các khóa học tiếng Anh, Nhật, Hàn' },
            { name: 'Kinh tế', slug: 'kinh-te', description: 'Quản trị kinh doanh, Tài chính' }
        ]);

        // 3. Create Classrooms
        console.log('🏫 Creating classrooms...');
        const classroom1 = await Classroom.create({
            name: 'Lập trình Web nâng cao',
            description: 'Khóa học về React, Node.js và MongoDB',
            lecturer: lecturer._id,
            students: [student._id],
            code: 'WEB2024',
            category: categories[0]._id,
            schedule: [
                { dayOfWeek: 'Thứ 2', startTime: '08:00', endTime: '10:00' },
                { dayOfWeek: 'Thứ 4', startTime: '08:00', endTime: '10:00' }
            ]
        });

        const classroom2 = await Classroom.create({
            name: 'Tiếng Anh Giao tiếp cơ bản',
            description: 'Học giao tiếp hiệu quả trong 3 tháng',
            lecturer: lecturer._id,
            students: [student._id],
            code: 'ENG101',
            category: categories[1]._id,
            schedule: [
                { dayOfWeek: 'Thứ 3', startTime: '14:00', endTime: '16:00' },
                { dayOfWeek: 'Thứ 5', startTime: '14:00', endTime: '16:00' }
            ]
        });

        // 4. Create Materials
        console.log('📚 Creating materials...');
        await Material.create({
            title: 'Giáo trình Node.js căn bản',
            content: 'Node.js là một môi trường chạy JavaScript bên ngoài trình duyệt...',
            classroom: classroom1._id,
            uploadedBy: lecturer._id,
            fileUrl: 'materials/sample-node.pdf'
        });

        // 5. Create Exams
        console.log('📝 Creating exams...');
        await Exam.create({
            title: 'Bài kiểm tra giữa kỳ React',
            classroom: classroom1._id,
            duration: 45,
            questions: [
                {
                    questionText: 'React là gì?',
                    options: ['Thư viện JavaScript', 'Framework Java', 'Cơ sở dữ liệu', 'Ngôn ngữ lập trình'],
                    correctAnswer: 'Thư viện JavaScript',
                    type: 'multiple-choice'
                },
                {
                    questionText: 'Hook nào dùng để quản lý state?',
                    options: ['useEffect', 'useMemo', 'useState', 'useRef'],
                    correctAnswer: 'useState',
                    type: 'multiple-choice'
                }
            ],
            status: 'active',
            startTime: new Date(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
        });

        console.log('✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
