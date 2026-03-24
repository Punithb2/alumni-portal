import { createContext, useEffect, useReducer } from 'react'

// ─── Demo user template (no backend needed) ──────────────────────────────────
const DEMO_USER = {
  id: 1,
  email: 'demo@alumni.com',
  first_name: 'Alex',
  last_name: 'Johnson',
  name: 'Alex Johnson',
  username: 'alex_johnson',
  role: 'SA',
  is_admin_role: true,
  avatar: '',
  profile: {
    graduation_year: 2020,
    department: 'Computer Science',
    connections_count: 142,
    bio: 'Software Engineer & Alumni Community Leader',
  },
}

// ─── Session helpers ──────────────────────────────────────────────────────────
const SESSION_KEY = 'alumni_session'

const getStoredSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const setStoredSession = (user) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

const clearStoredSession = () => {
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext({
  user: null,
  isInitialized: false,
  isAuthenticated: false,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
})

export default AuthContext

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState = { user: null, isAuthenticated: false, isInitialized: false }

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
      }
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload.user }
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null }
    case 'REGISTER':
      return { ...state }
    default:
      return state
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount: check for an existing session in sessionStorage
  useEffect(() => {
    const storedUser = getStoredSession()
    if (storedUser) {
      dispatch({
        type: 'INIT',
        payload: { isAuthenticated: true, user: storedUser },
      })
    } else {
      // No stored session → user must sign in
      dispatch({
        type: 'INIT',
        payload: { isAuthenticated: false, user: null },
      })
    }
  }, [])

  const login = async (email, password, role) => {
    // TODO: Replace with real API call when backend is ready
    const userRole = role || 'Alumni'
    const userWithRole = {
      ...DEMO_USER,
      role: userRole,
      is_admin_role: userRole === 'University' || userRole === 'SA',
    }
    setStoredSession(userWithRole)
    dispatch({ type: 'LOGIN', payload: { user: userWithRole } })
  }

  const register = async (/* formData */) => {
    // TODO: Replace with real API call when backend is ready
    dispatch({ type: 'REGISTER' })
  }

  const logout = async () => {
    // TODO: Replace with real API call when backend is ready
    clearStoredSession()
    dispatch({ type: 'LOGOUT' })
  }

  const forgotPassword = (/* email */) => {
    return Promise.resolve()
  }

  const resetPassword = (/* uid, token, password, password_confirm */) => {
    return Promise.resolve()
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
