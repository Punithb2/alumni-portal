import { Navigate, useLocation } from 'react-router-dom'
import useAuth from 'app/hooks/useAuth'

export default function RoleGuard({ children, allowedRoles }) {
  const { user, isInitialized, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isInitialized) return null // Wait for auth to load

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has an allowed role
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
