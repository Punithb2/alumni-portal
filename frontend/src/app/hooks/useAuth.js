import { useContext } from 'react'
import AuthContext from 'app/contexts/FirebaseAuthContext'

export default function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    // Return default UNAUTHENTICATED state if context is not available
    return {
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve(),
      updateProfileInSession: () => {},
    }
  }

  return context
}
