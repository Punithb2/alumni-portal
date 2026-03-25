import { Navigate, useLocation } from 'react-router-dom'
import useAuth from 'app/hooks/useAuth'

export default function RoleGuard({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has an allowed role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
