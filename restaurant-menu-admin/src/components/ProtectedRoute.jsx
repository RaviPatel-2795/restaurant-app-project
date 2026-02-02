import { useContext } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { restaurantId } = useParams()
  const auth = useContext(AuthContext)
  if (!restaurantId) return <Navigate to="/" replace />
  if (!auth.isAuthed(restaurantId)) return <Navigate to={`/admin/${restaurantId}`} replace />
  return children
}
