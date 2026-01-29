import Login from './pages/Login'

const socket = io('http://localhost:5000')

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [socketStatus, setSocketStatus] = useState('Disconnected')
  const [user, setUser] = useState(null)

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
  }

  const onLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Learning AI - Project Status</h1>
        
        {!user ? (
          <Login onLoginSuccess={onLoginSuccess} />
        ) : (
          <div className="dashboard">
            <h3>Welcome, {user.name} ({user.role})</h3>
            <button onClick={onLogout}>Logout</button>
            <div className="status-card">
              <p><strong>API Backend:</strong> {apiStatus}</p>
              <p><strong>Socket.io:</strong> {socketStatus}</p>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}

export default App
