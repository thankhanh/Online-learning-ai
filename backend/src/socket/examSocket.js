module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-exam', (examId) => {
            socket.join(`exam_${examId}`);
            console.log(`User joined exam: ${examId}`);
        });

        socket.on('submit-answer', (data) => {
            // Handle answer submission
        });

        socket.on('violation', (data) => {
            // Broadcast violation to proctors or log it
        });
    });
};
