const usersInRoom = {}; // Tracks objects { id, username } per class room { classId: [{id, username}...] }

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-class', (data) => {
            const classId = data.classId;
            const username = data.username || 'Khách';

            const role = data.role || 'student';
            
            socket.join(`class_${classId}`);
            console.log(`User ${socket.id} (${username}, ${role}) joined class: ${classId}`);
            
            // Add user to local tracker
            if (!usersInRoom[classId]) {
                usersInRoom[classId] = [];
            }
            usersInRoom[classId].push({ id: socket.id, username, role, isSharing: false });

            // Get all other users in this room to initiate connections
            const otherUsers = usersInRoom[classId].filter(u => u.id !== socket.id);
            socket.emit('all-users', otherUsers);

            // Let others know a new user connected
            socket.to(`class_${classId}`).emit('user-connected', { id: socket.id, username, role, isSharing: false });
            
            // Store classId for cleanup on disconnect
            socket.classId = classId;
        });

        // Forward WebRTC Offer with callerName
        socket.on('webrtc-offer', (payload) => {
            io.to(payload.userToSignal).emit('webrtc-offer', {
                signal: payload.signal,
                callerID: payload.callerID,
                callerName: payload.callerName
            });
        });

        // Forward WebRTC Answer
        socket.on('webrtc-answer', (payload) => {
            io.to(payload.callerID).emit('webrtc-answer', {
                signal: payload.signal,
                id: socket.id
            });
        });

        // Handle screen share status
        socket.on('screen-share-status', (data) => {
            // data: { classId, isSharing }
            // Update local tracker
            const classId = data.classId;
            if (usersInRoom[classId]) {
                const user = usersInRoom[classId].find(u => u.id === socket.id);
                if (user) user.isSharing = data.isSharing;
            }

            socket.to(`class_${data.classId}`).emit('screen-share-status', { 
                userID: socket.id, 
                isSharing: data.isSharing 
            });
        });

        // Handle chat messages
        socket.on('chat-message', (data) => {
            // Append explicit socket.id for frontend to differentiate
            io.to(`class_${data.classId}`).emit('new-message', { ...data, senderId: socket.id });
        });

        // Clean up on disconnect
        socket.on('disconnect', () => {
            const classId = socket.classId;
            if (classId && usersInRoom[classId]) {
                usersInRoom[classId] = usersInRoom[classId].filter(u => u.id !== socket.id);
                if (usersInRoom[classId].length === 0) {
                    delete usersInRoom[classId];
                }
                
                socket.to(`class_${classId}`).emit('user-disconnected', socket.id);
                console.log(`User ${socket.id} disconnected from class: ${classId}`);
            }
        });
    });
};
