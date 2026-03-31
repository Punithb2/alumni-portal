import { createContext, useEffect, useReducer } from 'react'
import api from 'app/utils/api'

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
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const setStoredSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

const getStoredSettingsProfile = (userId) => {
  if (!userId) return {}
  try {
    const raw = localStorage.getItem(`settings_profile_${userId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const clearStoredSession = () => {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

const buildSessionUser = (profileData, fallbackUser = null) => {
  const profileUser = profileData?.user || {}
  const firstName = profileUser.first_name || ''
  const lastName = profileUser.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const resolvedUserId = profileUser.id ?? fallbackUser?.id ?? null
  const localSettingsProfile = getStoredSettingsProfile(resolvedUserId)
  const localAvatar = localSettingsProfile.avatar || ''
  const resolvedProfile = profileData ?? fallbackUser?.profile ?? null

  return {
    id: resolvedUserId,
    email: profileUser.email ?? fallbackUser?.email ?? '',
    name: fullName || fallbackUser?.name || profileUser.username || '',
    role: profileData?.role ?? fallbackUser?.role ?? 'student',
    is_admin_role: (profileData?.role ?? fallbackUser?.role) === 'admin',
    avatar: localAvatar || profileData?.avatar || fallbackUser?.avatar || '',
    profile: resolvedProfile
      ? {
          ...resolvedProfile,
          avatar: localAvatar || resolvedProfile.avatar || '',
        }
      : resolvedProfile,
  }
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

  useEffect(() => {
    const handleForcedLogout = () => {
      clearStoredSession()
      dispatch({ type: 'LOGOUT' })
    }
    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [])

  const login = async (email, password) => {
    try {
      // 1. Get JWT Tokens
      const response = await api.post('/auth/token/', { username: email, password })
      const { access, refresh } = response.data

      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)

      // 2. Fetch User Profile & Role from Backend
      const profileResponse = await api.get('/auth/me/')
      const profileData = profileResponse.data

      const user = buildSessionUser(profileData, state.user)

      setStoredSession(user)
      dispatch({ type: 'LOGIN', payload: { user } })
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
  }

  const register = async (formData) => {
    try {
      await api.post('/auth/register/', formData)
      // After registration, user should log in
    } catch (error) {
      console.error('Registration failed', error)
      throw error
    }
  }

  const logout = async () => {
    clearStoredSession()
    dispatch({ type: 'LOGOUT' })
  }

  const updateProfileInSession = (profileData) => {
    const currentSession = getStoredSession() || state.user
    const user = buildSessionUser(profileData, currentSession)
    setStoredSession(user)
    dispatch({ type: 'LOGIN', payload: { user } })
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
        updateProfileInSession,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
