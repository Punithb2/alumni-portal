import { Navigate, useLocation } from 'react-router-dom'
import useAuth from 'app/hooks/useAuth'

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) return null // Wait for auth to load

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
