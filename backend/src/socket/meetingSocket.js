/**
 * meetingSocket.js
 * WebRTC Signaling Server cho tính năng Video Meeting (Google Meet style)
 * Hỗ trợ tối đa 4 người: 1 giáo viên + 3 sinh viên (Mesh P2P)
 */

// roomId -> Map(socketId -> userInfo)
const rooms = new Map();

module.exports = (io) => {
    const meetingNamespace = io.of('/meeting');

    meetingNamespace.on('connection', (socket) => {
        console.log(`[Meeting] Client connected: ${socket.id}`);

        /**
         * Tham gia phòng họp
         * @param {string} roomId - ID phòng
         * @param {object} userInfo - { name, role, userId }
         */
        socket.on('join-meeting', ({ roomId, userInfo }) => {
            socket.join(roomId);
            socket.roomId = roomId;

            // Khởi tạo room nếu chưa có
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Map());
            }

            const room = rooms.get(roomId);

            // Gửi danh sách người đang có mặt trong phòng cho người mới vào
            const existingUsers = [...room.entries()].map(([socketId, info]) => ({
                socketId,
                userInfo: info,
            }));
            socket.emit('existing-users', existingUsers);

            // Thông báo cho tất cả người trong phòng biết có người mới
            socket.to(roomId).emit('user-joined', {
                socketId: socket.id,
                userInfo,
            });

            // Lưu user vào room
            room.set(socket.id, userInfo);

            console.log(`[Meeting] ${userInfo.name} (${socket.id}) joined room: ${roomId}. Total: ${room.size}`);
        });

        /**
         * Relay SDP Offer (người gọi gửi cho người nhận)
         */
        socket.on('offer', ({ to, sdp }) => {
            socket.to(to).emit('offer', { from: socket.id, sdp });
        });

        /**
         * Relay SDP Answer (người nhận phản hồi lại)
         */
        socket.on('answer', ({ to, sdp }) => {
            socket.to(to).emit('answer', { from: socket.id, sdp });
        });

        /**
         * Relay ICE Candidate (trao đổi thông tin kết nối mạng)
         */
        socket.on('ice-candidate', ({ to, candidate }) => {
            socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
        });

        /**
         * Toggle mic/camera — broadcast trạng thái cho người trong phòng
         */
        socket.on('media-state-change', ({ roomId, isMicOn, isCameraOn }) => {
            socket.to(roomId).emit('peer-media-state', {
                socketId: socket.id,
                isMicOn,
                isCameraOn,
            });
        });

        /**
         * Bắt đầu share màn hình
         */
        socket.on('screen-share-start', ({ roomId }) => {
            socket.to(roomId).emit('peer-screen-share-start', { socketId: socket.id });
        });

        /**
         * Dừng share màn hình
         */
        socket.on('screen-share-stop', ({ roomId }) => {
            socket.to(roomId).emit('peer-screen-share-stop', { socketId: socket.id });
        });

        /**
         * Xử lý khi client ngắt kết nối
         */
        socket.on('disconnect', () => {
            const roomId = socket.roomId;
            if (roomId && rooms.has(roomId)) {
                const room = rooms.get(roomId);
                const userInfo = room.get(socket.id);
                room.delete(socket.id);

                // Thông báo cho mọi người trong phòng
                socket.to(roomId).emit('user-left', { socketId: socket.id });

                console.log(`[Meeting] ${userInfo?.name || socket.id} left room: ${roomId}. Remaining: ${room.size}`);

                // Dọn dẹp room nếu trống
                if (room.size === 0) {
                    rooms.delete(roomId);
                    console.log(`[Meeting] Room ${roomId} is empty, cleaned up.`);
                }
            }
        });
    });
};
