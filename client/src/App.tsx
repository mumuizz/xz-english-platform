import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import CheckIn from './pages/CheckIn'
import Ebbinghaus from './pages/Ebbinghaus'
import EditProfile from './pages/EditProfile'
import Reading from './pages/Reading'
import Listening from './pages/Listening'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
          <Route path="/ebbinghaus" element={<ProtectedRoute><Ebbinghaus /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
          <Route path="/listening" element={<ProtectedRoute><Listening /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
