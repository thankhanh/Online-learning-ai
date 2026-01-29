module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-class', (classId) => {
            socket.join(`class_${classId}`);
            console.log(`User joined class: ${classId}`);
        });

        socket.on('chat-message', (data) => {
            io.to(`class_${data.classId}`).emit('new-message', data);
        });
    });
};
