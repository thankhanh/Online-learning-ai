const Exam = require('../models/Exam');
const Result = require('../models/Result');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        /**
         * @event join-exam
         * @desc  Student joins a specific exam room
         */
        socket.on('join-exam', async ({ examId, userId }) => {
            try {
                if (!examId || !userId) return;

                socket.join(`exam_${examId}`);
                socket.userId = userId;
                socket.examId = examId;

                console.log(`User ${userId} joined exam room: ${examId}`);

                // Optionally notify student of their current violation count
                const result = await Result.findOne({ exam: examId, student: userId });
                if (result) {
                    socket.emit('violation-update', {
                        totalViolations: result.totalViolations,
                        maxViolations: (await Exam.findById(examId)).maxViolations
                    });
                }
            } catch (error) {
                console.error('Socket join-exam error:', error.message);
            }
        });

        /**
         * @event violation
         * @desc  Record a violation (e.g., tab switch)
         */
        socket.on('violation', async (data) => {
            try {
                const { type, examId, userId } = data;
                const eId = examId || socket.examId;
                const uId = userId || socket.userId;

                if (!eId || !uId) return;

                const exam = await Exam.findById(eId);
                if (!exam) return;

                let result = await Result.findOne({ exam: eId, student: uId });
                if (!result) {
                    // Create partial result if it doesn't exist yet (student started but hasn't submitted)
                    result = new Result({
                        exam: eId,
                        student: uId,
                        violations: [],
                        totalViolations: 0
                    });
                }

                // Add violation
                result.violations.push({ type, timestamp: new Date() });
                result.totalViolations += 1;

                // Check for auto-submit
                if (result.totalViolations >= exam.maxViolations && !result.autoSubmitted) {
                    result.autoSubmitted = true;
                    // In a real scenario, we might also want to set submittedAt and grade it
                    await result.save();

                    socket.emit('auto-submit-triggered', {
                        message: 'Violation limit exceeded. Your exam has been automatically submitted.',
                        totalViolations: result.totalViolations
                    });
                    console.log(`Auto-submit triggered for user ${uId} in exam ${eId}`);
                } else {
                    await result.save();
                    socket.emit('violation-update', {
                        totalViolations: result.totalViolations,
                        maxViolations: exam.maxViolations
                    });
                }
            } catch (error) {
                console.error('Socket violation handling error:', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
