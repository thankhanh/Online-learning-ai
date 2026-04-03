const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
require('dotenv').config();

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/classrooms', require('./src/routes/classroomRoutes'));
app.use('/api/exams', require('./src/routes/examRoutes'));
app.use('/api/materials', require('./src/routes/materialRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/quiz', require('./src/routes/quizRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));

// Serve uploads folder static
app.use('/uploads', express.static('backend/uploads'));
app.use('/uploads', express.static('uploads')); // Local serve fallback

app.get(['/api', '/api/'], (req, res) => {
    res.json({ success: true, message: "API is reachable" });
});

app.get('/', (req, res) => {
    res.json({ message: "Online Learning AI Backend - Monolithic Modular is running!" });
});

// Import Socket Handlers
require('./src/socket/examSocket')(io);
require('./src/socket/classroomSocket')(io);
// Start Server Function
const startServer = async () => {
    try {
        console.log('⏳ Connecting to Database...');
        await connectDB();
        
        const initCronJobs = require('./src/cronJobs');
        initCronJobs();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
