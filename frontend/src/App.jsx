import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import MainLayout from './components/layout/MainLayout'
import ChatBox from './components/ChatBox'
import ExamViewer from './components/ExamViewer'
import './App.css'

const socket = io('http://localhost:5000')

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [socketStatus, setSocketStatus] = useState('Disconnected')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check API
    axios.get('http://localhost:5000/')
      .then(res => setApiStatus(res.data.message))
      .catch(err => setApiStatus('Error: ' + err.message))

    // Check Socket
    socket.on('connect', () => setSocketStatus('Connected: ' + socket.id))
    socket.on('disconnect', () => setSocketStatus('Disconnected'))

    // Check existing login
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
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
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '0.8rem', opacity: 0.7 }}>
        API: {apiStatus} | Socket: {socketStatus}
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <Login onLoginSuccess={onLoginSuccess} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLoginSuccess={onLoginSuccess} /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          user ? (
            <MainLayout user={user} onLogout={onLogout}>
              <Dashboard user={user} onLogout={onLogout} />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile" element={
          user ? (
            <MainLayout user={user} onLogout={onLogout}>
              <Profile user={user} />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />

        {/* Active Routes for Demo */}
        <Route path="/classroom/:id" element={user ? (
          <div style={{ display: 'flex', gap: '1rem', height: '100vh', padding: '1rem' }}>
            <div style={{ flex: 3, background: '#111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2>Live Video Stream (Placeholder)</h2>
            </div>
            <div style={{ flex: 1 }}>
              <ChatBox />
            </div>
          </div>
        ) : <Navigate to="/login" />} />

        <Route path="/exam/:id" element={user ? <ExamViewer /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  )
}

export default App
