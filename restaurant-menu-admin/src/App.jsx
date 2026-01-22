import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import RestaurantLogin from './pages/RestaurantLogin'
import EditItems from './pages/EditItems'

// admin portal to dos:
// - store hashed password
// - store salt
// - use bcrypt

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/:restaurantId" element={<RestaurantLogin />} />
        <Route path="/admin/:restaurantId/edit-items" element={
          <ProtectedRoute>
            <EditItems />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App