import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import api from './utils/api'
import { io } from 'socket.io-client'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import MainLayout from './components/layout/MainLayout'
import './App.css'
import ExamManagement from './features/lecturer/ExamManagement'

import DocumentManagement from './features/lecturer/DocumentManagement'
import ClassroomManagement from './features/lecturer/ClassroomManagement'
import Notification from './features/Notification/Notification'
import VirtualClassroom from './features/student/VirtualClassroom'
import LearningCenter from './features/student/LearningCenter'
import ExamRoom from './features/student/ExamRoom'
import ExamList from './features/student/ExamList'
import UserManagement from './features/admin/UserManagement'
import CategoryManagement from './features/admin/CategoryManagement'

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [socketStatus, setSocketStatus] = useState('Disconnected')
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        // Map backend _id to id if needed, but Notification.jsx uses notif.id
        const mapped = res.data.notifications.map(n => ({ ...n, id: n._id }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Fetch Notifications Error:', err.message);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Mark Read Error:', err.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark All Read Error:', err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (err) {
      console.error('Delete Notification Error:', err.message);
      toast.error('Không thể xóa thông báo');
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    try {
      await api.delete('/notifications');
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo');
    } catch (err) {
      console.error('Delete All Error:', err.message);
      toast.error('Không thể xóa tất cả thông báo');
    }
  };

  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    // 1. Check existing login & persistent session
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => {
          console.error('Session validation failed:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    }

    // 2. API Status Check
    api.get('/').then(() => setApiStatus('Online')).catch(() => setApiStatus('Offline'));

    // 3. Socket Event Listeners
    const onConnect = () => setSocketStatus('Connected: ' + socket.id);
    const onDisconnect = () => setSocketStatus('Disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    }
  }, [])

  const onLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    navigate('/dashboard')
  }

  const onLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '0.8rem', opacity: 0.7 }}>
        API: {apiStatus} | Socket: {socketStatus}
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <Login onLoginSuccess={onLoginSuccess} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLoginSuccess={onLoginSuccess} /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          user ? (
            <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
              <Dashboard user={user} onLogout={onLogout} />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile" element={
          user ? (
            <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
              <Profile user={user} />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/classroom-management" element={user ?
          <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
            <ClassroomManagement user={user} />
          </MainLayout>
          : <Navigate to="/login" />} />
        <Route path="/exam-management" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <ExamManagement user={user} />
        </MainLayout> : <Navigate to="/login" />} />

        <Route path="/document-management" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <DocumentManagement user={user} />
        </MainLayout> : <Navigate to="/login" />} />

        <Route path="/notifications" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <Notification 
            user={user} 
            notifications={notifications} 
            markAsRead={markNotificationAsRead}
            markAllAsRead={markAllNotificationsAsRead}
            deleteNotification={deleteNotification}
            deleteAllNotifications={deleteAllNotifications}
          />
        </MainLayout> : <Navigate to="/login" />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <UserManagement />
        </MainLayout> : <Navigate to="/login" />} />

        <Route path="/admin/categories" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <CategoryManagement />
        </MainLayout> : <Navigate to="/login" />} />

        {/* Student Routes */}
        <Route path="/virtual-classroom/:id" element={user ? <VirtualClassroom /> : <Navigate to="/login" />} />
        <Route path="/learning-center" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <LearningCenter />
        </MainLayout> : <Navigate to="/login" />} />

        <Route path="/exams" element={user ? <MainLayout user={user} onLogout={onLogout} unreadCount={unreadCount}>
          <ExamList />
        </MainLayout> : <Navigate to="/login" />} />

        <Route path="/exam-room/:id" element={user ? <ExamRoom /> : <Navigate to="/login" />} />

        {/* Catch-all Route - Must be last */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  )
}

export default App
