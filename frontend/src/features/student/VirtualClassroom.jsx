import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, InputGroup, Tab, Tabs, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import api from '../../utils/api';
import toast from 'react-hot-toast';


const VideoStream = ({ stream, muted = false }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream, stream?.id]); // Re-assign if stream ID changes

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
    const [sharingUserId, setSharingUserId] = useState(null); // ID of user who is currently sharing screen
    const [localStream, setLocalStream] = useState(null); // State for the local stream rendering
    const [className, setClassName] = useState('');


    // Controls state
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const socketRef = useRef();
    const peersRef = useRef([]);
    const streamRef = useRef(); // Original camera stream
    const activeStreamRef = useRef(); // Currently broadcasting stream (camera or screen)
    const screenTrackRef = useRef(null);


    // The user running this client
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'Guest_' + Math.floor(Math.random() * 100) };

    useEffect(() => {
        if (classId && classId !== 'demo-class') {
            api.get(`/classrooms/${classId}`)
                .then(res => {
                    if (res.data.success && res.data.classroom) {
                        const classroom = res.data.classroom;
                        setClassName(classroom.name);
                        
                        // Time Restriction Logic for Students
                        if (currentUser.role === 'student' && classroom.schedule && Array.isArray(classroom.schedule)) {
                            const checkTime = () => {
                                const now = new Date();
                                const dayMap = { 'Chủ Nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6 };
                                const currentDay = now.getDay();
                                
                                // Find any schedule slot active for TODAY or starting YESTERDAY (overnight)
                                const isAnyActive = classroom.schedule.some(slot => {
                                    const lessonDay = dayMap[slot.dayOfWeek];
                                    const [startH, startM] = slot.startTime.split(':').map(Number);
                                    const [endH, endM] = slot.endTime.split(':').map(Number);
                                    const isOvernight = (endH < startH) || (endH === startH && endM < startM);

                                    if (currentDay === lessonDay) {
                                        const startTime = new Date();
                                        startTime.setHours(startH, startM, 0, 0);
                                        const endTime = new Date();
                                        endTime.setHours(endH, endM, 0, 0);
                                        if (isOvernight) endTime.setDate(endTime.getDate() + 1);

                                        const earlyAccessTime = new Date(startTime.getTime() - 5 * 60 * 1000);
                                        return now >= earlyAccessTime && now <= endTime;
                                    } else if (currentDay === (lessonDay + 1) % 7 && isOvernight) {
                                        // "Tail" of overnight class from yesterday
                                        const endTime = new Date();
                                        endTime.setHours(endH, endM, 0, 0);
                                        return now <= endTime;
                                    }
                                    return false;
                                });

                                if (!isAnyActive) {
                                    toast.error('Hiện tại không có lịch học cho lớp này hoặc buổi học đã kết thúc.');
                                    navigate('/dashboard');
                                }
                            };

                            // Check immediately on entry
                            checkTime();

                            // Set interval to check every 30 seconds for auto-exit
                            const intervalId = setInterval(checkTime, 30000);
                            return () => clearInterval(intervalId);
                        }
                    }
                })
                .catch(err => console.error('Error fetching classroom info:', err));
        }
    }, [classId, currentUser.role, navigate]);

    useEffect(() => {
        let isMounted = true;
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socketRef.current = socket;
        let localStreamTemp = null;

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

            localStreamTemp = stream;
            streamRef.current = stream;
            activeStreamRef.current = stream;
            setLocalStream(stream);

            socket.emit("join-class", { classId, username: myName, role: currentUser.role });

            socket.on("all-users", users => {
                const newPeers = [];
                users.forEach(userObj => {
                    const peer = createPeer(userObj.id, socket.id, activeStreamRef.current, socket, myName);
                    peer.on("stream", remoteStream => {
                        setRemoteStreams(prev => ({ ...prev, [userObj.id]: remoteStream }));
                    });
                    peersRef.current.push({ peerID: userObj.id, username: userObj.username, role: userObj.role, isSharing: userObj.isSharing, peer });
                    newPeers.push({ peerID: userObj.id, username: userObj.username, role: userObj.role, isSharing: userObj.isSharing, peer });

                    // Auto-pin lecturer or screen share
                    if (userObj.isSharing) {
                        setSharingUserId(userObj.id);
                        setPinnedPeerId(userObj.id);
                    } else if (userObj.role === 'lecturer' && !newPeers.some(p => p.isSharing)) {
                        setPinnedPeerId(userObj.id);
                    }
                });

                setPeers(newPeers);
            });

            socket.on("user-connected", userObj => {
                // If the new user is a lecturer and no one is sharing, pin them
                if (userObj.role === 'lecturer' && !sharingUserId) {
                    setPinnedPeerId(userObj.id);
                }
            });

            socket.on("screen-share-status", data => {
                if (data.isSharing) {
                    setSharingUserId(data.userID);
                    setPinnedPeerId(data.userID); // Auto-pin when someone shares
                } else {
                    setSharingUserId(null);
                    // If shared user was pinned, maybe reset to lecturer?
                    setPinnedPeerId(prev => {
                        if (prev === data.userID) {
                            const lecturer = peersRef.current.find(p => p.role === 'lecturer');
                            return lecturer ? lecturer.peerID : null;
                        }
                        return prev;
                    });
                }
            });

            socket.on("webrtc-offer", payload => {
                const existing = peersRef.current.find(p => p.peerID === payload.callerID);
                if (existing) {
                    existing.peer.signal(payload.signal);
                    return;
                }
                const peer = addPeer(payload.signal, payload.callerID, activeStreamRef.current, socket);
                peer.on("stream", remoteStream => {
                    setRemoteStreams(prev => ({ ...prev, [payload.callerID]: remoteStream }));
                });
                peersRef.current.push({ peerID: payload.callerID, username: payload.callerName, role: payload.role || 'student', isSharing: payload.isSharing || false, peer });
                setPeers(users => [...users, { peerID: payload.callerID, username: payload.callerName, role: payload.role || 'student', isSharing: payload.isSharing || false, peer }]);

                if (payload.isSharing) {
                    setSharingUserId(payload.callerID);
                    setPinnedPeerId(payload.callerID);
                }
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
            socketInstance.emit("webrtc-offer", { userToSignal, callerID, callerName, role: currentUser.role, isSharing: isScreenSharing, signal });
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
            const res = await api.post('/ai/ask', { 
                question: text,
                classroomId: classId
            });
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
        if (currentUser.role !== 'lecturer') {
            toast.error('Chỉ giảng viên mới có quyền chia sẻ màn hình.');
            return;
        }

        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
                setIsScreenSharing(true);
                const screenVideoTrack = screenStream.getVideoTracks()[0];
                screenTrackRef.current = screenVideoTrack;

                // Create a new active stream to share to late joiners
                const newActiveStream = new MediaStream([screenVideoTrack]);
                const audioTracks = streamRef.current.getAudioTracks();
                if (audioTracks.length > 0) {
                    newActiveStream.addTrack(audioTracks[0]);
                }
                activeStreamRef.current = newActiveStream;
                setLocalStream(newActiveStream);

                peersRef.current.forEach(peerObj => {
                    const currentVideoTrack = streamRef.current.getVideoTracks()[0];
                    if (currentVideoTrack) {
                        peerObj.peer.replaceTrack(currentVideoTrack, screenVideoTrack, streamRef.current);
                    }
                });

                screenVideoTrack.onended = () => {
                    stopScreenShare();
                };

                // Notify others
                socketRef.current.emit('screen-share-status', { classId, isSharing: true });
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

        activeStreamRef.current = streamRef.current;
        setLocalStream(streamRef.current);

        peersRef.current.forEach(peerObj => {
            if (screenTrack && currentVideoTrack) {
                peerObj.peer.replaceTrack(screenTrack, currentVideoTrack, activeStreamRef.current);
            }
        });

        if (screenTrack) {
            screenTrack.stop();
            screenTrackRef.current = null;
        }
        setIsScreenSharing(false);
        // Notify others
        socketRef.current.emit('screen-share-status', { classId, isSharing: false });
    }

    return (
        <div className="virtual-classroom bg-light vh-100 d-flex flex-column">
            <div className="classroom-header p-3 bg-white border-bottom shadow-sm d-flex justify-content-between align-items-center z-2">
                <div className="d-flex align-items-center">
                    <Button variant="light" size="sm" className="me-3 fw-bold text-secondary shadow-sm" onClick={() => navigate('/dashboard')}><i className="bi bi-arrow-left"></i> Thoát</Button>
                    <h5 className="m-0 fw-800 text-dark">Lớp {className || classId}</h5>
                </div>
                <div>
                    <Badge bg="danger" className="me-2 animate-pulse px-3 py-2 rounded-pill shadow-sm">🔴 LIVE</Badge>
                </div>
            </div>

            <div className="flex-grow-1 d-flex overflow-hidden">
                <div className="flex-grow-1 p-3 d-flex flex-column" style={{ maxWidth: '75%' }}>
                    <div className="flex-grow-1 bg-dark rounded-4 position-relative mb-3 d-flex align-items-center justify-content-center overflow-hidden shadow-sm">
                        {cameraError ? (
                            <div className="text-center p-4 bg-white rounded-4 text-danger border border-danger shadow w-75 position-absolute z-3">
                                <h5 className="fw-bold"><i className="bi bi-exclamation-triangle"></i> Lỗi thiết bị</h5>
                                <p>{cameraError}</p>
                                <small className="text-muted">Vui lòng cấp quyền Camera/Mic trên trình duyệt (hiển thị ổ khóa trên thanh URL) hoặc cắm camera và tải lại trang (F5).</small>
                            </div>
                        ) : null}

                        {pinnedPeerId && remoteStreams[pinnedPeerId] ? (
                            <VideoStream stream={remoteStreams[pinnedPeerId]} />
                        ) : (
                            <VideoStream stream={localStream} muted={true} />
                        )}

                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 p-2 bg-white rounded-pill shadow-lg d-flex gap-3 border">
                            <Button variant={isAudioOn ? "light" : "danger"} className={`rounded-circle shadow-sm ${isAudioOn ? 'text-dark' : ''}`} style={{ width: '45px', height: '45px' }} onClick={toggleAudio}>
                                <i className={`bi bi-mic${isAudioOn ? '' : '-mute-fill'} fs-5`}></i>
                            </Button>
                            <Button variant={isVideoOn ? "light" : "danger"} className={`rounded-circle shadow-sm ${isVideoOn ? 'text-dark' : ''}`} style={{ width: '45px', height: '45px' }} onClick={toggleVideo}>
                                <i className={`bi bi-camera-video${isVideoOn ? '' : '-off-fill'} fs-5`}></i>
                            </Button>
                            {currentUser.role === 'lecturer' && (
                                <Button variant={isScreenSharing ? "primary" : "light"} className={`rounded-circle shadow-sm ${isScreenSharing ? '' : 'text-primary'}`} style={{ width: '45px', height: '45px' }} onClick={toggleScreenShare}>
                                    <i className="bi bi-display fs-5"></i>
                                </Button>
                            )}
                            <Button variant="danger" className="rounded-circle shadow-sm" style={{ width: '45px', height: '45px' }} onClick={() => navigate('/dashboard')}>
                                <i className="bi bi-telephone-x-fill fs-5"></i>
                            </Button>
                        </div>
                        <div className="position-absolute top-0 start-0 m-3 p-2 bg-white bg-opacity-75 rounded-pill small d-flex align-items-center shadow-sm backdrop-blur">
                            <span className="fw-800 me-2 text-dark">
                                {pinnedPeerId && peers.find(p => p.peerID === pinnedPeerId)
                                    ? peers.find(p => p.peerID === pinnedPeerId).username
                                    : (currentUser.name || currentUser.username || 'Khách')}
                            </span>
                            <Badge bg={pinnedPeerId ? (peers.find(p => p.peerID === pinnedPeerId)?.role === 'lecturer' ? "danger" : "info") : (currentUser.role === 'lecturer' ? "danger" : "secondary")} className="rounded-pill">
                                {pinnedPeerId
                                    ? (sharingUserId === pinnedPeerId ? "Đang chia sẻ màn hình" : "Đã ghim")
                                    : (currentUser.role === 'lecturer' ? 'Giảng viên' : 'Học viên') + " (Bạn)"}
                            </Badge>
                            {pinnedPeerId && (
                                <Button variant="link" size="sm" className="text-secondary ms-2 p-0 fw-bold" onClick={() => setPinnedPeerId(null)}>
                                    <i className="bi bi-pin-angle-fill"></i> Bỏ ghim
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-2 overflow-auto custom-scrollbar pb-2" style={{ height: '160px' }}>
                        {peers.filter(p => p.peerID !== pinnedPeerId).map((peerObj) => (
                            <div key={peerObj.peerID} className="bg-dark rounded-4 overflow-hidden position-relative shadow-sm" style={{ minWidth: '220px', height: '100%' }}>
                                <VideoStream stream={remoteStreams[peerObj.peerID]} />
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="bg-white bg-opacity-75 p-1 rounded-circle shadow-sm" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => setPinnedPeerId(pinnedPeerId === peerObj.peerID ? null : peerObj.peerID)}
                                    >
                                        <i className={`bi bi-pin-angle${pinnedPeerId === peerObj.peerID ? '-fill text-primary' : ' text-secondary'}`}></i>
                                    </Button>
                                </div>
                                <div className="position-absolute bottom-0 start-0 p-2 small bg-dark bg-opacity-50 w-100 text-white fw-600 backdrop-blur d-flex justify-content-between align-items-center">
                                    <span>{peerObj.username} {peerObj.role === 'lecturer' && <Badge bg="danger" className="ms-1" style={{ fontSize: '0.6rem' }}>GV</Badge>}</span>
                                    {sharingUserId === peerObj.peerID && <Badge bg="primary" style={{ fontSize: '0.6rem' }}><i className="bi bi-display me-1"></i>LIVE</Badge>}
                                </div>
                            </div>
                        ))}
                        {/* Always show own video as thumbnail if someone else is pinned */}
                        {pinnedPeerId && (
                            <div className="bg-dark rounded-4 overflow-hidden position-relative shadow-sm" style={{ minWidth: '220px', height: '100%' }}>
                                <VideoStream stream={localStream} muted={true} />
                                <div className="position-absolute bottom-0 start-0 p-2 small bg-dark bg-opacity-50 w-100 text-white fw-600 backdrop-blur">
                                    Bạn
                                </div>
                            </div>
                        )}

                        {peers.length === 0 && (
                            <div className="d-flex flex-column align-items-center justify-content-center w-100 text-muted h-100 border border-secondary border-dashed border-opacity-25 rounded-4 bg-white">
                                <i className="bi bi-people fs-2 mb-2 opacity-50"></i>
                                <span className="fw-600 small">Chưa có thành viên nào khác tham gia</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="d-flex flex-column bg-white shadow-sm z-2" style={{ width: '25%', minWidth: '320px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-0 border-bottom bg-light px-2 pt-2" variant="pills" fill>
                        <Tab eventKey="chat" title={<span className="fw-bold"><i className="bi bi-chat-dots-fill me-1"></i> Chat</span>}>
                            <div className="d-flex flex-column h-100" style={{ height: 'calc(100vh - 115px)' }}>
                                <div className="p-3 border-bottom d-flex justify-content-center gap-2 bg-light">
                                    <Button size="sm" variant={chatMode === 'class' ? 'primary' : 'outline-primary'} className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => setChatMode('class')}>
                                        Hỏi Lớp
                                    </Button>
                                    <Button size="sm" variant={chatMode === 'ai' ? 'success' : 'outline-success'} className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => setChatMode('ai')}>
                                        ✨ Hỏi AI Tutor
                                    </Button>
                                </div>
                                <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar bg-white">
                                    {chatMode === 'class' ? (
                                        messages.length === 0 ? <div className="text-center mt-5"><i className="bi bi-chat-square-dots fs-1 text-muted opacity-25"></i><p className="text-muted small mt-2 fw-500">Chưa có đoạn chat nào.</p></div> :
                                            messages.map((msg, idx) => {
                                                const isMe = msg.senderId === socketRef.current?.id;
                                                return (
                                                    <div key={idx} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                                                        <div className={`small fw-bold mb-1 ${isMe ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '0.75rem' }}>
                                                            {msg.sender} {isMe ? '(Bạn)' : ''}
                                                        </div>
                                                        <div className={`p-2 px-3 rounded-4 shadow-sm ${isMe ? 'bg-primary text-white border-0' : 'bg-light text-dark border-0'}`}
                                                            style={{ maxWidth: '85%', fontSize: '0.9rem', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: !isMe ? '4px' : '16px' }}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <>
                                            <div className="text-center mb-4 mt-2">
                                                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-600">
                                                    <i className="bi bi-robot me-1"></i> Trợ lý giảng dạy AI (RAG)
                                                </Badge>
                                            </div>

                                            {currentUser.role === 'lecturer' && (
                                                <div className="mb-4 p-3 border border-success border-opacity-50 border-dashed rounded-4 bg-success bg-opacity-10 shadow-sm">
                                                    <h6 className="small fw-800 text-dark mb-2"><i className="bi bi-file-earmark-pdf-fill text-danger"></i> Tải tài liệu Bài giảng cho AI:</h6>
                                                    <Form.Control
                                                        type="file"
                                                        accept=".pdf"
                                                        size="sm"
                                                        onChange={handleFileUpload}
                                                        className="bg-white text-dark border-0 shadow-sm mb-2 rounded-pill"
                                                        disabled={isUploading}
                                                    />
                                                    {uploadStatus && <div className="small text-success fw-bold">{uploadStatus}</div>}
                                                    {isUploading && (
                                                        <div className="text-secondary small fw-500">
                                                            <span className="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>
                                                            Đang xử lý PDF...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {aiMessages.map((msg, idx) => {
                                                const isMe = !msg.isAi;
                                                return (
                                                    <div key={idx} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                                                        <div className={`small fw-bold mb-1 ${isMe ? 'text-primary' : 'text-success'}`} style={{ fontSize: '0.75rem' }}>
                                                            {msg.sender}
                                                        </div>
                                                        <div className={`p-2 px-3 rounded-4 shadow-sm ${isMe ? 'bg-primary text-white border-0' : (msg.error ? 'bg-danger bg-opacity-10 text-danger border-0' : 'bg-success bg-opacity-10 text-dark border-0')}`}
                                                            style={{ maxWidth: '85%', fontSize: '0.9rem', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: !isMe ? '4px' : '16px' }}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {isAiTyping && (
                                                <div className="d-flex flex-column mb-3 align-items-start">
                                                    <div className="small text-success fw-bold mb-1" style={{ fontSize: '0.75rem' }}>Gia sư AI</div>
                                                    <div className="p-2 px-3 rounded-4 bg-light text-secondary border-0 d-flex align-items-center shadow-sm">
                                                        <span className="spinner-border spinner-border-sm me-2 text-success" role="status"></span>
                                                        <span className="small fw-500">Đang suy nghĩ...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="p-3 border-top bg-light">
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white">
                                        <Form.Control
                                            placeholder={"Nhập tin nhắn..."}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-white text-dark border-0 border-end-0 py-2 ps-4"
                                            style={{ boxShadow: 'none' }}
                                        />
                                        <Button variant="primary" onClick={handleSendMessage} className="px-4 border-0">
                                            <i className="bi bi-send-fill"></i>
                                        </Button>
                                    </InputGroup>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="people" title={<span className="fw-bold"><i className="bi bi-people-fill me-1"></i> ({peers.length + 1})</span>}>
                            <div className="p-3 bg-white h-100">
                                <h6 className="fw-800 text-dark mb-4 border-bottom pb-2">Thành viên trong lớp ({peers.length + 1})</h6>
                                <div className="d-flex align-items-center mb-3 bg-light p-2 rounded-3">
                                    <div className="bg-primary rounded-circle me-3 text-center text-white shadow-sm" style={{ width: 36, height: 36, lineHeight: '36px' }}>
                                        <i className="bi bi-person-fill fs-5"></i>
                                    </div>
                                    <span className="fw-bold text-dark">Bạn <Badge bg="secondary" className="ms-1 px-2 py-1 rounded-pill small" style={{ fontSize: '0.65rem' }}>{currentUser.role}</Badge></span>
                                </div>
                                {peers.map((peer) => (
                                    <div key={peer.peerID} className="d-flex align-items-center mb-3 text-dark p-2 hover-bg-light rounded-3 transition-fast">
                                        <div className="bg-secondary bg-opacity-25 rounded-circle me-3 text-center text-dark fw-bold shadow-sm" style={{ width: 36, height: 36, lineHeight: '36px' }}>
                                            {peer.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="fw-500">{peer.username}</span>
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
