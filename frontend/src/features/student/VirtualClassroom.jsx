/**
 * VirtualClassroom.jsx
 * Phòng học trực tuyến — Google Meet style
 * Hỗ trợ: Video, Mic, Screen Share, Chat, AI Tutor
 * WebRTC thông qua hook useMeeting
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { io } from 'socket.io-client';
import { useMeeting } from '../../hooks/useMeeting';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

// Kết nối tới namespace /meeting
const meetingSocket = io('http://localhost:5000/meeting', { autoConnect: false });

// ─── Video Tile Component ─────────────────────────────────────────────────────
function VideoTile({ stream, userInfo, isMicOn = true, isCameraOn = true, isLocal = false, isLarge = false }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div
            style={{
                position: 'relative',
                background: '#1a1a2e',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)',
                transition: 'border-color 0.2s',
                width: '100%',
                height: '100%',
                minHeight: isLarge ? '300px' : '160px',
            }}
        >
            {/* Video Element */}
            {stream && isCameraOn ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isLocal ? 'scaleX(-1)' : 'none',
                    }}
                />
            ) : (
                // Avatar placeholder khi camera tắt
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                }}>
                    <div style={{
                        width: isLarge ? '80px' : '56px',
                        height: isLarge ? '80px' : '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isLarge ? '2rem' : '1.5rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '0.5rem',
                    }}>
                        {userInfo?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>{userInfo?.name || 'Unknown'}</span>
                </div>
            )}

            {/* Overlay thông tin phía dưới */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '6px 10px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                    {userInfo?.name || 'Unknown'} {isLocal ? '(Bạn)' : ''}
                    {userInfo?.role === 'teacher' && (
                        <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.65rem' }}>GV</Badge>
                    )}
                </span>
                {!isMicOn && (
                    <i className="bi bi-mic-mute-fill text-danger" style={{ fontSize: '0.9rem' }}></i>
                )}
            </div>
        </div>
    );
}

// ─── Main VirtualClassroom Component ─────────────────────────────────────────
export default function VirtualClassroom() {
    const { id: roomId } = useParams();
    const navigate = useNavigate();

    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = { name: user.name || user.email || 'Người dùng', role: user.role || 'student', userId: user._id || user.id };

    // ── Media States ──────────────────────────────────────────────────────────
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    // ── Chat States ───────────────────────────────────────────────────────────
    const [chatMode, setChatMode] = useState('class'); // 'class' | 'ai'
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Hệ thống', text: `Chào mừng đến phòng học ${roomId}! 👋` },
    ]);
    const [aiMessages, setAiMessages] = useState([
        { id: 1, sender: 'AI Tutor', text: 'Chào bạn! Tôi có thể giải đáp thắc mắc về bài học hôm nay.', isAi: true },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'people'
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const chatEndRef = useRef(null);

    // ── Screen Share Ref ──────────────────────────────────────────────────────
    const screenVideoRef = useRef(null);

    // ── Socket & WebRTC ───────────────────────────────────────────────────────
    const { peers } = useMeeting({
        socket: isJoined ? meetingSocket : null,
        roomId,
        userInfo,
        localStream,
    });

    // ── Connect Socket khi vào trang ──────────────────────────────────────────
    useEffect(() => {
        meetingSocket.connect();

        meetingSocket.on('connect', () => {
            console.log('[Meeting] Socket connected:', meetingSocket.id);
            setIsConnected(true);
        });

        meetingSocket.on('disconnect', () => {
            setIsConnected(false);
            setIsJoined(false);
        });

        // Nhận chat message từ người khác
        meetingSocket.on('new-message', (msg) => {
            setMessages((prev) => [...prev, { ...msg, id: Date.now() }]);
        });

        return () => {
            meetingSocket.off('connect');
            meetingSocket.off('disconnect');
            meetingSocket.off('new-message');
            meetingSocket.disconnect();
            // Dọn dẹp media
            if (localStream) localStream.getTracks().forEach((t) => t.stop());
            if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, aiMessages]);

    // Cập nhật screen video ref
    useEffect(() => {
        if (screenVideoRef.current && screenStream) {
            screenVideoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    // Broadcast trạng thái media khi thay đổi
    useEffect(() => {
        if (isJoined) {
            meetingSocket.emit('media-state-change', { roomId, isMicOn, isCameraOn });
        }
    }, [isMicOn, isCameraOn, isJoined, roomId]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleJoinMeeting = async () => {
        // Bật camera + mic khi join
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setLocalStream(stream);
            setIsMicOn(true);
            setIsCameraOn(true);
        } catch (err) {
            console.warn('[Meeting] Could not get media:', err);
            // Tham gia mà không có media cũng được
        }
        setIsJoined(true);
    };

    const toggleMic = useCallback(() => {
        if (!localStream) return;
        const track = localStream.getAudioTracks()[0];
        if (track) {
            track.enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    }, [localStream, isMicOn]);

    const toggleCamera = useCallback(async () => {
        if (isCameraOn) {
            localStream?.getVideoTracks().forEach((t) => { t.enabled = false; });
            setIsCameraOn(false);
        } else {
            if (localStream?.getVideoTracks().length > 0) {
                localStream.getVideoTracks()[0].enabled = true;
                setIsCameraOn(true);
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
                    setLocalStream(stream);
                    setIsCameraOn(true);
                } catch (err) {
                    alert('Không thể truy cập camera.');
                }
            }
        }
    }, [isCameraOn, localStream, isMicOn]);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            screenStream?.getTracks().forEach((t) => t.stop());
            setScreenStream(null);
            setIsScreenSharing(false);
            meetingSocket.emit('screen-share-stop', { roomId });
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                stream.getVideoTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    setScreenStream(null);
                    meetingSocket.emit('screen-share-stop', { roomId });
                };
                setScreenStream(stream);
                setIsScreenSharing(true);
                meetingSocket.emit('screen-share-start', { roomId });
            } catch (err) {
                console.error('Screen share error:', err);
            }
        }
    }, [isScreenSharing, screenStream, roomId]);

    const handleEndCall = useCallback(() => {
        localStream?.getTracks().forEach((t) => t.stop());
        screenStream?.getTracks().forEach((t) => t.stop());
        meetingSocket.disconnect();
        navigate('/dashboard');
    }, [localStream, screenStream, navigate]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setUploadStatus('Đang tải tài liệu...');
        try {
            const res = await api.post('/ai/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setUploadStatus(`Thành công! Đã nạp ${res.data.chunks} đoạn kiến thức.`);
                setAiMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'Hệ thống',
                    text: `Giảng viên vừa cập nhật tài liệu lớp học (${file.name}). Giờ bạn có thể hỏi AI về nội dung này!`,
                    isAi: true
                }]);
            }
        } catch (error) {
            setUploadStatus('Lỗi tải tài liệu.');
            console.error(error);
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadStatus(''), 5000);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        if (chatMode === 'class') {
            const msg = { sender: userInfo.name, text: inputValue };
            meetingSocket.emit('chat-message', { roomId, ...msg });
            setMessages((prev) => [...prev, { ...msg, id: Date.now(), isMine: true }]);
            setInputValue('');
        } else {
            const question = inputValue;
            setAiMessages((prev) => [...prev, { id: Date.now(), sender: 'Me', text: question, isAi: false }]);
            setInputValue('');
            setIsAiTyping(true);
            try {
                const res = await api.post('/ai/ask', { question });
                if (res.data.success) {
                    setAiMessages(prev => [...prev, { id: Date.now(), sender: 'AI Tutor', text: res.data.answer, isAi: true }]);
                } else {
                    setAiMessages(prev => [...prev, { id: Date.now(), sender: 'Hệ thống', text: 'Lỗi: Không thể nhận câu trả lời từ AI.', isAi: true, error: true }]);
                }
            } catch (error) {
                setAiMessages(prev => [...prev, { id: Date.now(), sender: 'Hệ thống', text: 'Lỗi kết nối tới AI Tutor. ' + (error.response?.data?.message || ''), isAi: true, error: true }]);
            } finally {
                setIsAiTyping(false);
            }
        }
    };

    // ── Grid Layout tính toán ─────────────────────────────────────────────────
    const peerArray = [...peers.entries()]; // [[socketId, { peer, stream, userInfo, isMicOn, isCameraOn }]]
    const totalParticipants = peerArray.length + 1; // +1 cho local

    const getGridStyle = () => {
        if (totalParticipants <= 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
        if (totalParticipants === 2) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
        if (totalParticipants <= 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
        return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto' };
    };

    // ── Lobby Screen (chưa join) ───────────────────────────────────────────────
    if (!isJoined) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '3rem',
                    maxWidth: '440px',
                    width: '90%',
                    textAlign: 'center',
                    color: '#fff',
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
                    <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Phòng học trực tuyến</h2>
                    <p style={{ color: '#a0aec0', marginBottom: '0.25rem' }}>Mã phòng: <strong style={{ color: '#818cf8' }}>{roomId}</strong></p>
                    <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>
                        Xin chào, <strong style={{ color: '#fff' }}>{userInfo.name}</strong>!
                    </p>

                    <div style={{
                        background: 'rgba(79, 70, 229, 0.15)',
                        border: '1px solid rgba(79, 70, 229, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        color: '#c7d2fe',
                    }}>
                        <p className="mb-1">✅ Camera và Mic sẽ được bật khi tham gia</p>
                        <p className="mb-1">✅ Có thể chia sẻ màn hình</p>
                        <p className="mb-0">✅ Chat nhóm và AI Tutor</p>
                    </div>

                    <button
                        onClick={handleJoinMeeting}
                        disabled={!isConnected}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: isConnected
                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                : '#374151',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: isConnected ? 'pointer' : 'not-allowed',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {isConnected ? '🚀 Tham gia ngay' : '⏳ Đang kết nối...'}
                    </button>
                </div>
            </div>
        );
    }

    // ── Main Meeting UI ───────────────────────────────────────────────────────
    return (
        <div style={{
            height: '100vh',
            background: '#0f1117',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
        }}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{
                height: '54px',
                background: '#16181d',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>🎓 EduMeet</span>
                    <Badge bg="danger" style={{ animation: 'pulse 2s infinite', fontSize: '0.7rem' }}>🔴 LIVE</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>
                        Phòng: <strong style={{ color: '#818cf8' }}>{roomId}</strong>
                    </span>
                    <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>
                        <i className="bi bi-people-fill"></i> {totalParticipants} người
                    </span>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── Video Area ──────────────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', gap: '10px', overflow: 'hidden' }}>

                    {/* Main screen share view */}
                    {isScreenSharing && (
                        <div style={{
                            flex: 1,
                            background: '#000',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid #4f46e5',
                        }}>
                            <video
                                ref={screenVideoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: 'rgba(79,70,229,0.9)',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                            }}>
                                📺 Đang chia sẻ màn hình
                            </div>
                        </div>
                    )}

                    {/* Video Grid */}
                    <div style={{
                        flex: isScreenSharing ? '0 0 180px' : 1,
                        display: 'grid',
                        ...getGridStyle(),
                        gap: '10px',
                        overflow: 'hidden',
                    }}>
                        {/* Local Video */}
                        <VideoTile
                            stream={localStream}
                            userInfo={userInfo}
                            isMicOn={isMicOn}
                            isCameraOn={isCameraOn}
                            isLocal={true}
                            isLarge={totalParticipants <= 2}
                        />

                        {/* Remote Peers */}
                        {peerArray.map(([socketId, { stream, userInfo: peerInfo, isMicOn: pMic, isCameraOn: pCam }]) => (
                            <VideoTile
                                key={socketId}
                                stream={stream}
                                userInfo={peerInfo}
                                isMicOn={pMic}
                                isCameraOn={pCam}
                                isLocal={false}
                                isLarge={totalParticipants <= 2}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Right Sidebar ────────────────────────────────────── */}
                <div style={{
                    width: '320px',
                    background: '#16181d',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                }}>
                    {/* Tab Header */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {[
                            { key: 'chat', label: '💬 Chat' },
                            { key: 'people', label: `👥 (${totalParticipants})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
                                    color: activeTab === tab.key ? '#818cf8' : '#6b7280',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'chat' ? (
                            <>
                                {/* Chat Mode Toggle */}
                                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
                                    {['class', 'ai'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setChatMode(mode)}
                                            style={{
                                                flex: 1,
                                                padding: '6px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: chatMode === mode
                                                    ? (mode === 'class' ? 'rgba(79,70,229,0.3)' : 'rgba(34,197,94,0.2)')
                                                    : 'rgba(255,255,255,0.05)',
                                                color: chatMode === mode
                                                    ? (mode === 'class' ? '#818cf8' : '#4ade80')
                                                    : '#6b7280',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {mode === 'class' ? '👥 Lớp học' : '✨ AI Tutor'}
                                        </button>
                                    ))}
                                </div>

                                {/* Upload for AI (Teacher only) */}
                                {chatMode === 'ai' && (userInfo.role === 'teacher' || userInfo.role === 'lecturer') && (
                                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>Tải tài liệu Bài giảng cho AI:</div>
                                        <input 
                                            type="file" 
                                            accept=".pdf" 
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            style={{ color: '#fff', fontSize: '0.8rem', width: '100%' }}
                                        />
                                        {uploadStatus && <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px' }}>{uploadStatus}</div>}
                                    </div>
                                )}

                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                    {chatMode === 'class' ? (
                                        messages.map((msg) => (
                                            <div key={msg.id} style={{ marginBottom: '10px' }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: msg.isMine ? '#818cf8' : '#4ade80',
                                                    fontWeight: 600,
                                                    marginBottom: '2px',
                                                }}>
                                                    {msg.sender}
                                                </div>
                                                <div style={{
                                                    background: msg.isMine ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.06)',
                                                    border: `1px solid ${msg.isMine ? 'rgba(79,70,229,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                                    borderRadius: '10px',
                                                    padding: '8px 12px',
                                                    color: '#e2e8f0',
                                                    fontSize: '0.875rem',
                                                }}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        aiMessages.map((msg) => (
                                            <div key={msg.id} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'Me' ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '90%',
                                                    background: msg.isAi ? 'rgba(34,197,94,0.1)' : 'rgba(79,70,229,0.2)',
                                                    border: `1px solid ${msg.isAi ? 'rgba(34,197,94,0.3)' : 'rgba(79,70,229,0.3)'}`,
                                                    borderRadius: '10px',
                                                    padding: '8px 12px',
                                                    color: '#e2e8f0',
                                                    fontSize: '0.875rem',
                                                }}>
                                                    {msg.isAi && <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.75rem', marginBottom: '4px' }}>🤖 AI Tutor</div>}
                                                    {msg.text}
                                                    {msg.source && (
                                                        <div style={{ marginTop: '6px', color: '#60a5fa', fontSize: '0.75rem' }}>
                                                            📎 {msg.source}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {chatMode === 'ai' && isAiTyping && (
                                        <div style={{ padding: '8px 12px', color: '#a0aec0', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                            AI đang tạo câu trả lời...
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder={chatMode === 'class' ? 'Nhắn tin...' : 'Hỏi AI Tutor...'}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                padding: '8px 12px',
                                                color: '#fff',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                            }}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            style={{
                                                padding: '8px 14px',
                                                background: chatMode === 'class' ? '#4f46e5' : '#16a34a',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <i className="bi bi-send-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // People tab
                            <div style={{ padding: '12px', overflowY: 'auto' }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '12px' }}>Trong phòng ({totalParticipants} người)</p>

                                {/* Local user */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px', background: 'rgba(79,70,229,0.1)', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.2)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{userInfo.name} (Bạn)</div>
                                        <div style={{ color: '#a0aec0', fontSize: '0.75rem' }}>
                                            {isMicOn ? <span style={{ color: '#4ade80' }}>🎤 Mic bật</span> : <span style={{ color: '#f87171' }}>🔇 Mic tắt</span>}
                                            {' · '}
                                            {isCameraOn ? <span style={{ color: '#4ade80' }}>📹 Cam bật</span> : <span style={{ color: '#f87171' }}>📷 Cam tắt</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Remote peers */}
                                {peerArray.map(([socketId, { userInfo: pInfo, isMicOn: pMic, isCameraOn: pCam }]) => (
                                    <div key={socketId} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                            {(pInfo?.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>
                                                {pInfo?.name || 'Người dùng'}
                                                {pInfo?.role === 'teacher' && <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.65rem' }}>GV</Badge>}
                                            </div>
                                            <div style={{ color: '#a0aec0', fontSize: '0.75rem' }}>
                                                {pMic ? <span style={{ color: '#4ade80' }}>🎤 On</span> : <span style={{ color: '#f87171' }}>🔇 Off</span>}
                                                {' · '}
                                                {pCam ? <span style={{ color: '#4ade80' }}>📹 On</span> : <span style={{ color: '#f87171' }}>📷 Off</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Control Bar ──────────────────────────────────────────── */}
            <div style={{
                height: '72px',
                background: '#16181d',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexShrink: 0,
            }}>
                {/* Mic */}
                <button
                    onClick={toggleMic}
                    title={isMicOn ? 'Tắt Mic' : 'Bật Mic'}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isMicOn ? 'rgba(255,255,255,0.1)' : '#dc2626',
                        color: '#fff',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <i className={`bi ${isMicOn ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`}></i>
                </button>

                {/* Camera */}
                <button
                    onClick={toggleCamera}
                    title={isCameraOn ? 'Tắt Camera' : 'Bật Camera'}
                    style={{
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                        background: isCameraOn ? 'rgba(255,255,255,0.1)' : '#dc2626',
                        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <i className={`bi ${isCameraOn ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`}></i>
                </button>

                {/* Screen Share */}
                <button
                    onClick={toggleScreenShare}
                    title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
                    style={{
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                        background: isScreenSharing ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <i className="bi bi-display"></i>
                </button>

                {/* Chat */}
                <button
                    onClick={() => setActiveTab(activeTab === 'chat' ? 'people' : 'chat')}
                    title="Chat"
                    style={{
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <i className="bi bi-chat-dots-fill"></i>
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>

                {/* End Call */}
                <button
                    onClick={handleEndCall}
                    title="Rời phòng"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '24px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #dc2626, #c41e1e)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
                    }}
                >
                    <i className="bi bi-telephone-x-fill"></i> Rời phòng
                </button>
            </div>
        </div>
    );
}
