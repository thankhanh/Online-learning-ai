const cron = require('node-cron');
const Exam = require('./models/Exam');
const Classroom = require('./models/Classroom');
const Notification = require('./models/Notification');

const initCronJobs = () => {
    console.log('Cron jobs initialized.');
    
    // Chạy mỗi giờ (mỗi phút số 0 của các giờ)
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            // Tìm các kỳ thi bắt đầu trong khoảng từ 24h đến 25h tới
            // Giới hạn 1 tiếng để Job này chỉ quét trúng 1 lần duy nhất cho mỗi bài thi.
            const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

            const upcomingExams = await Exam.find({
                startTime: { $gte: tomorrowStart, $lt: tomorrowEnd }
            });

            for (const exam of upcomingExams) {
                const classroom = await Classroom.findById(exam.classroom);
                if (!classroom || !classroom.students || classroom.students.length === 0) continue;

                const startDate = new Date(exam.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

                for (const studentId of classroom.students) {
                    await Notification.create({
                        user: studentId,
                        title: 'Nhắc nhở lịch thi',
                        content: `Bạn có một bài thi "${exam.title}" thuộc môn ${classroom.name} sẽ diễn ra vào lúc ${startDate}. Vui lòng chuẩn bị và ôn tập thật tốt.`,
                        type: 'exam'
                    });

                    // (In the real world, you might also broadcast socket.io if user is online, 
                    // but they will see the notification when they open the app).
                }
            }
        } catch (error) {
            console.error('Error running exam reminder cron job:', error);
        }
    });
};

module.exports = initCronJobs;
