import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, InputGroup, Tab, Tabs, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import api from '../../utils/api';

const VideoStream = ({ stream, muted = false }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            playsInline
            autoPlay
            muted={muted}
            ref={ref}
            className="w-100 h-100 object-fit-cover bg-black"
        />
    );
}

export default function VirtualClassroom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const classId = id || 'demo-class';

    const [peers, setPeers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [chatMode, setChatMode] = useState('class'); // 'class' or 'ai'
    const [aiMessages, setAiMessages] = useState([]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [pinnedPeerId, setPinnedPeerId] = useState(null); // null or peerID
    const [remoteStreams, setRemoteStreams] = useState({}); // { peerID: stream }



    // Controls state
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const streamRef = useRef();
    const screenTrackRef = useRef(null);


    // The user running this client
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'Guest_' + Math.floor(Math.random() * 100) };

    useEffect(() => {
        let isMounted = true;
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socketRef.current = socket;
        let localStream = null;

        const myName = currentUser.name || currentUser.username || 'Khách';

        // Basic socket listeners that don't need media
        socket.on("new-message", data => {
            if (isMounted) setMessages(prev => {
                // Prevent duplicate messages by ID
                if (data.id && prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
        });

        socket.on("user-disconnected", userID => {
            if (!isMounted) return;
            const peerObj = peersRef.current.find(p => p.peerID === userID);
            if (peerObj) peerObj.peer.destroy();
            const newPeers = peersRef.current.filter(p => p.peerID !== userID);
            peersRef.current = newPeers;
            setPeers(newPeers);
            setRemoteStreams(prev => {
                const updated = { ...prev };
                delete updated[userID];
                return updated;
            });
            if (pinnedPeerId === userID) setPinnedPeerId(null);
        });


        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            if (!isMounted) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            localStream = stream;
            streamRef.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socket.emit("join-class", { classId, username: myName });

            socket.on("all-users", users => {
                const newPeers = [];
                users.forEach(userObj => {
                    const peer = createPeer(userObj.id, socket.id, stream, socket, myName);
                    peer.on("stream", remoteStream => {
                        setRemoteStreams(prev => ({ ...prev, [userObj.id]: remoteStream }));
                    });
                    peersRef.current.push({ peerID: userObj.id, username: userObj.username, peer });
                    newPeers.push({ peerID: userObj.id, username: userObj.username, peer });
                });

                setPeers(newPeers);
            });

            socket.on("user-connected", userObj => {
                console.log("User connected", userObj.username);
            });

            socket.on("webrtc-offer", payload => {
                const existing = peersRef.current.find(p => p.peerID === payload.callerID);
                if (existing) {
                    existing.peer.signal(payload.signal);
                    return;
                }
                const peer = addPeer(payload.signal, payload.callerID, stream, socket);
                peer.on("stream", remoteStream => {
                    setRemoteStreams(prev => ({ ...prev, [payload.callerID]: remoteStream }));
                });
                peersRef.current.push({ peerID: payload.callerID, username: payload.callerName, peer });
                setPeers(users => [...users, { peerID: payload.callerID, username: payload.callerName, peer }]);

            });

            socket.on("webrtc-answer", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) {
                    item.peer.signal(payload.signal);
                }
            });
        }).catch(err => {
            console.error("Failed to access media devices", err);
            if (isMounted) setCameraError(err.message || 'Không thể lấy luồng Camera/Mic.');
        });

        return () => {
            isMounted = false;
            socket.disconnect();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            peersRef.current.forEach(p => p.peer.destroy());
            peersRef.current = [];
            setPeers([]);
            setRemoteStreams({});
        }

    }, [classId]);

    function createPeer(userToSignal, callerID, stream, socketInstance, callerName) {
        const peer = new Peer({
            initiator: true,
            trickle: true,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] },
            stream,
        });

        peer.on("signal", signal => {
            socketInstance.emit("webrtc-offer", { userToSignal, callerID, callerName, signal });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream, socketInstance) {
        const peer = new Peer({
            initiator: false,
            trickle: true,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] },
            stream,
        });

        peer.on("signal", signal => {
            socketInstance.emit("webrtc-answer", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        if (chatMode === 'ai') {
            handleSendAiMessage(inputValue);
            return;
        }

        const msg = {
            id: Date.now(),
            classId,
            sender: currentUser.name || currentUser.username || 'Khách',
            text: inputValue,
        };
        socketRef.current.emit('chat-message', msg);
        setInputValue('');
    };

    const handleSendAiMessage = async (text) => {
        const newMsg = { sender: 'Bạn', text, isAi: false };
        setAiMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsAiTyping(true);

        try {
            const res = await api.post('/ai/ask', { question: text });
            if (res.data.success) {
                setAiMessages(prev => [...prev, { sender: 'Gia sư AI', text: res.data.answer, isAi: true }]);
            } else {
                setAiMessages(prev => [...prev, { sender: 'Hệ thống', text: 'Lỗi: Không thể nhận câu trả lời từ AI.', isAi: true, error: true }]);
            }
        } catch (error) {
            setAiMessages(prev => [...prev, { sender: 'Hệ thống', text: 'Lỗi kết nối tới AI Tutor. ' + (error.response?.data?.message || ''), isAi: true, error: true }]);
        } finally {
            setIsAiTyping(false);
        }
    };

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

    const toggleAudio = () => {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
                setIsScreenSharing(true);
                const screenVideoTrack = screenStream.getVideoTracks()[0];
                screenTrackRef.current = screenVideoTrack;

                peersRef.current.forEach(peerObj => {
                    const currentVideoTrack = streamRef.current.getVideoTracks()[0];
                    if (currentVideoTrack) {
                        peerObj.peer.replaceTrack(currentVideoTrack, screenVideoTrack, streamRef.current);
                    }
                });

                if (userVideo.current) {
                    userVideo.current.srcObject = screenStream;
                }

                screenVideoTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (err) {
                console.error("Screen sharing failed", err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        const currentVideoTrack = streamRef.current.getVideoTracks()[0];
        const screenTrack = screenTrackRef.current;

        peersRef.current.forEach(peerObj => {
            if (screenTrack && currentVideoTrack) {
                peerObj.peer.replaceTrack(screenTrack, currentVideoTrack, streamRef.current);
            }
        });

        if (userVideo.current) {
            userVideo.current.srcObject = streamRef.current;
        }
        if (screenTrack) {
            screenTrack.stop();
            screenTrackRef.current = null;
        }
        setIsScreenSharing(false);
    }

    return (
        <div className="virtual-classroom bg-black vh-100 text-white d-flex flex-column">
            <div className="classroom-header p-2 bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <Button variant="outline-light" size="sm" className="me-3" onClick={() => navigate('/dashboard')}><i className="bi bi-arrow-left"></i> Thoát</Button>
                    <h5 className="m-0">Lớp {classId}</h5>
                </div>
                <div>
                    <Badge bg="danger" className="me-2 animate-pulse">🔴 LIVE</Badge>
                </div>
            </div>

            <div className="flex-grow-1 d-flex overflow-hidden">
                <div className="flex-grow-1 p-3 d-flex flex-column" style={{ maxWidth: '75%' }}>
                    <div className="flex-grow-1 bg-secondary rounded position-relative mb-3 d-flex align-items-center justify-content-center overflow-hidden">
                        {cameraError ? (
                            <div className="text-center p-4 bg-dark rounded text-danger border border-danger shadow w-75 position-absolute z-3">
                                <h5><i className="bi bi-exclamation-triangle"></i> Lỗi thiết bị</h5>
                                <p>{cameraError}</p>
                                <small className="text-muted">Vui lòng cấp quyền Camera/Mic trên trình duyệt (hiển thị ổ khóa trên thanh URL) hoặc cắm camera và tải lại trang (F5).</small>
                            </div>
                        ) : null}
                        
                        {pinnedPeerId && remoteStreams[pinnedPeerId] ? (
                            <VideoStream stream={remoteStreams[pinnedPeerId]} />
                        ) : (
                            <video playsInline muted autoPlay ref={userVideo} className="w-100 h-100 object-fit-cover bg-black" />
                        )}


                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 p-2 bg-dark rounded-pill bg-opacity-75 d-flex gap-3">
                            <Button variant={isAudioOn ? "secondary" : "danger"} className="rounded-circle" onClick={toggleAudio}>
                                <i className={`bi bi-mic${isAudioOn ? '' : '-mute'}`}></i>
                            </Button>
                            <Button variant={isVideoOn ? "secondary" : "danger"} className="rounded-circle" onClick={toggleVideo}>
                                <i className={`bi bi-camera-video${isVideoOn ? '' : '-off'}`}></i>
                            </Button>
                            <Button variant={isScreenSharing ? "primary" : "info"} className="rounded-circle" onClick={toggleScreenShare}>
                                <i className="bi bi-display"></i>
                            </Button>
                            <Button variant="warning" className="rounded-circle" onClick={() => navigate('/dashboard')}>
                                <i className="bi bi-telephone-x"></i>
                            </Button>
                        </div>
                        <div className="position-absolute top-0 start-0 m-2 p-1 bg-dark bg-opacity-75 rounded small d-flex align-items-center shadow-sm">
                            <span className="fw-bold me-1">
                                {pinnedPeerId && peers.find(p => p.peerID === pinnedPeerId) 
                                    ? peers.find(p => p.peerID === pinnedPeerId).username 
                                    : (currentUser.name || currentUser.username || 'Khách')}
                            </span>
                            <Badge bg={pinnedPeerId ? "info" : (currentUser.role === 'lecturer' ? "danger" : "secondary")}>
                                {pinnedPeerId 
                                    ? "Đã ghim" 
                                    : (currentUser.role === 'lecturer' ? 'Giảng viên' : 'Học viên') + " (Bạn)"}
                            </Badge>
                            {pinnedPeerId && (
                                <Button variant="link" size="sm" className="text-white ms-2 p-0" onClick={() => setPinnedPeerId(null)}>
                                    <i className="bi bi-pin-angle-fill"></i> Bỏ ghim
                                </Button>
                            )}
                        </div>
                    </div>


                    <div className="d-flex gap-2 overflow-auto" style={{ height: '150px' }}>
                        {peers.map((peerObj) => (
                            <div key={peerObj.peerID} className="bg-dark border border-secondary rounded overflow-hidden position-relative" style={{ minWidth: '200px', height: '100%' }}>
                                <VideoStream stream={remoteStreams[peerObj.peerID]} />
                                <div className="position-absolute top-0 end-0 m-1">

                                    <Button 
                                        variant="dark" 
                                        size="sm" 
                                        className="bg-opacity-50 p-1" 
                                        onClick={() => setPinnedPeerId(pinnedPeerId === peerObj.peerID ? null : peerObj.peerID)}
                                    >
                                        <i className={`bi bi-pin-angle${pinnedPeerId === peerObj.peerID ? '-fill' : ''}`}></i>
                                    </Button>
                                </div>
                                <div className="position-absolute bottom-0 start-0 p-1 small bg-black bg-opacity-50 w-100">
                                    {peerObj.username}
                                </div>
                            </div>
                        ))}
                        {/* Always show own video as thumbnail if someone else is pinned */}
                        {pinnedPeerId && (
                            <div className="bg-dark border border-secondary rounded overflow-hidden position-relative" style={{ minWidth: '200px', height: '100%' }}>
                                <video playsInline muted autoPlay ref={userVideo} className="w-100 h-100 object-fit-cover bg-black" />
                                <div className="position-absolute bottom-0 start-0 p-1 small bg-black bg-opacity-50 w-100">
                                    Bạn
                                </div>
                            </div>
                        )}

                        {peers.length === 0 && (
                            <div className="d-flex align-items-center justify-content-center w-100 text-muted h-100 border border-secondary border-dashed rounded">
                                Chưa có thành viên nào khác tham gia
                            </div>
                        )}
                    </div>
                </div>

                <div className="d-flex flex-column border-start border-secondary bg-dark" style={{ width: '25%', minWidth: '300px' }}>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-0 border-bottom border-secondary" variant="pills" fill>
                        <Tab eventKey="chat" title="💬 Chat">
                            <div className="d-flex flex-column h-100" style={{ height: 'calc(100vh - 110px)' }}>
                                <div className="p-2 border-bottom border-secondary d-flex justify-content-center gap-2">
                                    <Button size="sm" variant={chatMode === 'class' ? 'primary' : 'outline-primary'} onClick={() => setChatMode('class')}>
                                        Hỏi Lớp
                                    </Button>
                                    <Button size="sm" variant={chatMode === 'ai' ? 'success' : 'outline-success'} onClick={() => setChatMode('ai')}>
                                        ✨ Hỏi AI Tutor
                                    </Button>
                                </div>
                                <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar">
                                    {chatMode === 'class' ? (
                                        messages.length === 0 ? <p className="text-muted text-center small mt-3">Chưa có đoạn chat nào.</p> :
                                            messages.map((msg, idx) => {
                                                const isMe = msg.senderId === socketRef.current?.id;
                                                return (
                                                    <div key={idx} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                                                        <div className={`small fw-bold mb-1 ${isMe ? 'text-primary' : 'text-info'}`}>
                                                            {msg.sender} {isMe ? '(Bạn)' : ''}
                                                        </div>
                                                        <div className={`p-2 px-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white border-primary' : 'bg-secondary bg-opacity-75 text-white border-secondary'}`}
                                                            style={{ maxWidth: '85%', fontSize: '0.9rem', border: '1px solid transparent' }}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <>
                                            <div className="text-center mb-3">
                                                <Badge bg="success" className="px-3 py-2 rounded-pill fw-normal">Tính năng RAG AI: Tra cứu nội dung môn học</Badge>
                                            </div>

                                            {currentUser.role === 'lecturer' && (
                                                <div className="mb-3 p-2 border border-success border-dashed rounded bg-success bg-opacity-10">
                                                    <h6 className="small fw-bold mb-2">Tải tài liệu Bài giảng cho AI:</h6>
                                                    <Form.Control
                                                        type="file"
                                                        accept=".pdf"
                                                        size="sm"
                                                        onChange={handleFileUpload}
                                                        className="bg-dark text-white border-secondary mb-1"
                                                        disabled={isUploading}
                                                    />
                                                    {uploadStatus && <div className="small text-success mt-1">{uploadStatus}</div>}
                                                    {isUploading && (
                                                        <div className="text-secondary small mt-1">
                                                            <span className="spinner-grow spinner-grow-sm me-1" role="status"></span>
                                                            Đang xử lý PDF...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {aiMessages.map((msg, idx) => {
                                                const isMe = !msg.isAi;
                                                return (
                                                    <div key={idx} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                                                        <div className={`small fw-bold mb-1 ${isMe ? 'text-primary' : 'text-success'}`}>
                                                            {msg.sender}
                                                        </div>
                                                        <div className={`p-2 px-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white border-primary' : (msg.error ? 'bg-danger text-white border-danger' : 'bg-success bg-opacity-10 text-white border border-success border-opacity-25')}`}
                                                            style={{ maxWidth: '85%', fontSize: '0.9rem' }}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {isAiTyping && (
                                                <div className="d-flex flex-column mb-3 align-items-start">
                                                    <div className="small text-muted mb-1">Gia sư AI</div>
                                                    <div className="p-2 rounded bg-success bg-opacity-25 text-white border border-success">
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Đang suy nghĩ...
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="p-2 border-top border-secondary">
                                    <InputGroup>
                                        <Form.Control
                                            placeholder={"Nhập tin nhắn..."}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-dark text-white border-secondary"
                                        />
                                        <Button variant="primary" onClick={handleSendMessage}>
                                            <i className="bi bi-send-fill"></i>
                                        </Button>
                                    </InputGroup>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="people" title={`👥 (${peers.length + 1})`}>
                            <div className="p-3">
                                <h6>Trong phòng ({peers.length + 1})</h6>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary rounded-circle me-2 pt-1 text-center" style={{ width: 30, height: 30, lineHeight: '30px' }}>
                                        <i className="bi bi-person"></i>
                                    </div>
                                    <span>Bạn</span>
                                </div>
                                {peers.map((peer) => (
                                    <div key={peer.peerID} className="d-flex align-items-center mb-3 text-muted">
                                        <div className="bg-secondary rounded-circle me-2 pt-1 text-center text-white" style={{ width: 30, height: 30, lineHeight: '30px' }}>
                                            {peer.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span>{peer.username}</span>
                                    </div>
                                ))}
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
