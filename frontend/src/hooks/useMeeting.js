/**
 * useMeeting.js
 * Custom Hook quản lý toàn bộ logic WebRTC cho tính năng Video Meeting
 *
 * Kiến trúc: Mesh P2P — mỗi client kết nối trực tiếp với từng client khác
 * Signaling: qua Socket.io namespace /meeting
 *
 * @param {object} params
 * @param {object} params.socket - socket.io-client instance (namespace /meeting)
 * @param {string} params.roomId - ID phòng học
 * @param {object} params.userInfo - { name, role, userId }
 * @param {MediaStream|null} params.localStream - luồng camera/mic local
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';

const ICE_SERVERS = {
    iceServers: [
        // STUN servers miễn phí (hoạt động tốt trong LAN và nhiều môi trường internet)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TURN server miễn phí (Metered.ca) — cần thiết khi deploy lên cloud
        // Uncomment và điền credentials khi deploy:
        // {
        //   urls: 'turn:a.relay.metered.ca:80',
        //   username: 'YOUR_USERNAME',
        //   credential: 'YOUR_CREDENTIAL',
        // },
    ],
};

export function useMeeting({ socket, roomId, userInfo, localStream }) {
    // Map: socketId -> { peer: SimplePeer, stream: MediaStream, userInfo: object, isMicOn: bool, isCameraOn: bool }
    const [peers, setPeers] = useState(new Map());
    const peersRef = useRef(new Map()); // ref để dùng trong event listeners không bị stale closure

    /**
     * Tạo một SimplePeer mới
     * @param {string} targetSocketId - socket ID của peer cần kết nối
     * @param {boolean} initiator - true nếu mình là người khởi tạo kết nối
     * @param {object} peerUserInfo - userInfo của peer
     */
    const createPeer = useCallback((targetSocketId, initiator, peerUserInfo) => {
        if (!socket || !localStream) return null;

        const peer = new SimplePeer({
            initiator,
            stream: localStream,
            config: ICE_SERVERS,
            trickle: true, // Trickle ICE: gửi candidates ngay khi có
        });

        // Relay SDP offer/answer qua signaling server
        peer.on('signal', (data) => {
            if (data.type === 'offer') {
                socket.emit('offer', { to: targetSocketId, sdp: data });
            } else if (data.type === 'answer') {
                socket.emit('answer', { to: targetSocketId, sdp: data });
            } else if (data.candidate) {
                socket.emit('ice-candidate', { to: targetSocketId, candidate: data });
            }
        });

        // Nhận stream video/audio từ peer
        peer.on('stream', (remoteStream) => {
            setPeers((prev) => {
                const updated = new Map(prev);
                const existing = updated.get(targetSocketId) || {};
                updated.set(targetSocketId, { ...existing, stream: remoteStream });
                return updated;
            });
        });

        peer.on('error', (err) => {
            console.error(`[useMeeting] Peer error with ${targetSocketId}:`, err);
        });

        peer.on('close', () => {
            removePeer(targetSocketId);
        });

        // Lưu vào ref ngay
        peersRef.current.set(targetSocketId, {
            peer,
            stream: null,
            userInfo: peerUserInfo,
            isMicOn: true,
            isCameraOn: true,
        });

        // Cập nhật state
        setPeers((prev) => {
            const updated = new Map(prev);
            updated.set(targetSocketId, {
                peer,
                stream: null,
                userInfo: peerUserInfo,
                isMicOn: true,
                isCameraOn: true,
            });
            return updated;
        });

        return peer;
    }, [socket, localStream]);

    const removePeer = useCallback((socketId) => {
        const entry = peersRef.current.get(socketId);
        if (entry?.peer) {
            entry.peer.destroy();
        }
        peersRef.current.delete(socketId);
        setPeers((prev) => {
            const updated = new Map(prev);
            updated.delete(socketId);
            return updated;
        });
    }, []);

    useEffect(() => {
        if (!socket || !roomId || !userInfo || !localStream) return;

        // --- Tham gia phòng ---
        socket.emit('join-meeting', { roomId, userInfo });

        // --- Nhận danh sách người đã có mặt ---
        // Mình là người mới → mình là initiator, tạo offer cho từng người
        socket.on('existing-users', (existingUsers) => {
            existingUsers.forEach(({ socketId, userInfo: peerInfo }) => {
                if (!peersRef.current.has(socketId)) {
                    createPeer(socketId, true, peerInfo);
                }
            });
        });

        // --- Có người mới tham gia ---
        // Họ là initiator → mình chờ offer, không tự tạo peer ở đây
        socket.on('user-joined', ({ socketId, userInfo: peerInfo }) => {
            if (!peersRef.current.has(socketId)) {
                createPeer(socketId, false, peerInfo);
            }
        });

        // --- Nhận SDP Offer ---
        socket.on('offer', ({ from, sdp }) => {
            const entry = peersRef.current.get(from);
            if (entry?.peer) {
                entry.peer.signal(sdp);
            }
        });

        // --- Nhận SDP Answer ---
        socket.on('answer', ({ from, sdp }) => {
            const entry = peersRef.current.get(from);
            if (entry?.peer) {
                entry.peer.signal(sdp);
            }
        });

        // --- Nhận ICE Candidate ---
        socket.on('ice-candidate', ({ from, candidate }) => {
            const entry = peersRef.current.get(from);
            if (entry?.peer) {
                entry.peer.signal(candidate);
            }
        });

        // --- Peer thay đổi trạng thái mic/camera ---
        socket.on('peer-media-state', ({ socketId, isMicOn, isCameraOn }) => {
            peersRef.current.set(socketId, { ...peersRef.current.get(socketId), isMicOn, isCameraOn });
            setPeers((prev) => {
                const updated = new Map(prev);
                const existing = updated.get(socketId) || {};
                updated.set(socketId, { ...existing, isMicOn, isCameraOn });
                return updated;
            });
        });

        // --- Peer rời phòng ---
        socket.on('user-left', ({ socketId }) => {
            removePeer(socketId);
        });

        // Cleanup
        return () => {
            socket.off('existing-users');
            socket.off('user-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('peer-media-state');
            socket.off('user-left');

            // Đóng tất cả peer connections
            peersRef.current.forEach(({ peer }) => {
                if (peer && !peer.destroyed) peer.destroy();
            });
            peersRef.current.clear();
            setPeers(new Map());
        };
    }, [socket, roomId, userInfo, localStream, createPeer, removePeer]);

    return { peers };
}
