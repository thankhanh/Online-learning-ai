import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import './App.css'

const socket = io('http://localhost:5000')

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [socketStatus, setSocketStatus] = useState('Disconnected')

  useEffect(() => {
    // Check API
    axios.get('http://localhost:5000/')
      .then(res => setApiStatus(res.data.message))
      .catch(err => setApiStatus('Error: ' + err.message))

    // Check Socket
    socket.on('connect', () => setSocketStatus('Connected: ' + socket.id))
    socket.on('disconnect', () => setSocketStatus('Disconnected'))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Learning AI - Project Status</h1>
        <div className="status-card">
          <p><strong>API Backend:</strong> {apiStatus}</p>
          <p><strong>Socket.io:</strong> {socketStatus}</p>
        </div>
      </header>
    </div>
  )
}

export default App
