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
         * @event join-exam-monitor
         * @desc  Lecturer joins to monitor a specific exam
         */
        socket.on('join-exam-monitor', async ({ examId }) => {
            if (!examId) return;
            const roomName = `monitor_exam_${examId}`;
            socket.join(roomName);
            
            try {
                // Return current violation status for all students in this exam
                const Result = require('../models/Result');
                const results = await Result.find({ exam: examId, totalViolations: { $gt: 0 } })
                                            .populate('student', 'name email')
                                            .lean();
                
                const initialData = results.map(r => ({
                    examId: String(examId),
                    userId: String(r.student?._id || r.student),
                    username: r.student?.name || 'Unknown',
                    email: r.student?.email || '',
                    type: 'Lịch sử',
                    totalViolations: r.totalViolations,
                    timestamp: r.submittedAt || new Date(),
                    status: r.autoSubmitted ? 'Đã đình chỉ' : 'Đang thi'
                }));
                
                socket.emit('initial-monitor-data', { examId, data: initialData });
                
                const room = io.sockets.adapter.rooms.get(roomName);
                const numClients = room ? room.size : 0;
                console.log(`Lecturer ${socket.id} joined ${roomName}. Monitors: ${numClients}. Sent ${initialData.length} history records.`);
            } catch (err) {
                console.error('Error fetching initial monitor data:', err);
            }
        });

        socket.on('reset-student-violation', async ({ examId, userId }) => {
            try {
                const Result = require('../models/Result');
                await Result.findOneAndDelete({ exam: examId, student: userId });
                console.log(`ADMIN RESET: User ${userId} violations cleared in exam ${examId}`);
                socket.emit('reset-success', { userId });
                // Broadcast to update other monitors
                io.to(`monitor_exam_${examId}`).emit('student-violation-reset', { userId });
            } catch (err) {
                console.error('Reset error:', err);
            }
        });

        /**
         * @event violation
         * @desc  Record a violation (e.g., tab switch)
         */
        socket.on('violation', async (data) => {
            try {
                const { type, examId, userId } = data;
                const eId = String(examId || socket.examId);
                const uId = String(userId || socket.userId);

                if (!eId || !uId) {
                    console.log('CRITICAL: Missing IDs in violation packet:', { eId, uId });
                    socket.emit('violation-error', { message: 'Missing examId or userId' });
                    return;
                }

                const exam = await Exam.findById(eId);
                if (!exam) {
                    console.log('CRITICAL: Exam NOT FOUND in DB for violation:', eId);
                    socket.emit('violation-error', { message: 'Exam not found' });
                    return;
                }

                const Result = require('../models/Result');
                let result = await Result.findOne({ exam: eId, student: uId }).populate('student', 'name email');
                if (!result) {
                    const User = require('../models/User');
                    const studentUser = await User.findById(uId);
                    result = new Result({
                        exam: eId,
                        student: uId,
                        violations: [],
                        totalViolations: 0
                    });
                    result.student = studentUser;
                }

                // If already auto-submitted, we still broadcast but with a special flag
                if (result.autoSubmitted) {
                    console.log(`POST-SUBMISSION VIOLATION: User ${uId} in room monitor_exam_${eId}`);
                    io.to(`monitor_exam_${eId}`).emit('student-violation', {
                        examId: eId,
                        userId: uId,
                        username: result.student?.name || 'Unknown',
                        email: result.student?.email || '',
                        type: `${type} (Sau khi nộp bài)`,
                        totalViolations: result.totalViolations,
                        timestamp: new Date(),
                        isPostSubmission: true
                    });

                    socket.emit('violation-update', {
                        totalViolations: result.totalViolations,
                        maxViolations: Number(exam.maxViolations) || 3,
                        ignoredReason: 'already-submitted'
                    });
                    return;
                }

                // Add violation
                result.violations.push({ type, timestamp: new Date() });
                result.totalViolations += 1;

                // Broadcast to lecturers monitoring this exam
                const monitorRoom = `monitor_exam_${eId}`;
                const room = io.sockets.adapter.rooms.get(monitorRoom);
                const numMonitors = room ? room.size : 0;
                
                console.log(`BROADCASTING: To ${monitorRoom} (${numMonitors} monitors). Student: ${result.student?.name || uId}, Violation: ${type}`);
                
                io.to(monitorRoom).emit('student-violation', {
                    examId: eId,
                    userId: uId,
                    username: result.student?.name || 'Unknown',
                    email: result.student?.email || '',
                    type,
                    totalViolations: result.totalViolations,
                    timestamp: new Date(),
                    serverDebugger: { monitorRoom, numMonitors }
                });

                // Check for auto-submit
                const maxV = Number(exam.maxViolations) || 3;
                if (result.totalViolations >= maxV) {
                    result.autoSubmitted = true;
                    await result.save();

                    socket.emit('auto-submit-triggered', {
                        message: `Violation limit (${maxV}) exceeded. Your exam has been automatically submitted.`,
                        totalViolations: result.totalViolations
                    });
                    console.log(`AUTO-SUBMIT: Tripped for ${uId} at count ${result.totalViolations}`);
                } else {
                    await result.save();
                    socket.emit('violation-update', {
                        totalViolations: result.totalViolations,
                        maxViolations: maxV,
                        monitorRoom,
                        numMonitorsSeenByServer: numMonitors
                    });
                    console.log(`VIOLATION: Event sent to student ${uId}, new count ${result.totalViolations}`);
                }
            } catch (error) {
                console.error('CRITICAL SERVER ERROR in violation handler:', error);
                socket.emit('violation-error', { message: 'Internal server error' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
