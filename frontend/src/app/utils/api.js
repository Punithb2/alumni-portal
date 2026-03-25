// frontend/src/app/utils/api.js
import axios from 'axios'

// Create a base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/', // Use env variable
  timeout: 15000,
})

let isRefreshing = false
let pendingRequests = []
const PUBLIC_AUTH_PATHS = ['/auth/register/', '/auth/token/', '/auth/token/refresh/']

const getRequestPath = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  }
  return url
}

const isPublicAuthRequest = (url = '') => {
  const path = getRequestPath(url)
  return PUBLIC_AUTH_PATHS.some((publicPath) => path.endsWith(publicPath))
}

const flushPending = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }
    resolve(token)
  })
  pendingRequests = []
}

// Add an interceptor to automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (isPublicAuthRequest(config.url)) {
      return config
    }
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error?.response?.status
    const refreshToken = localStorage.getItem('refreshToken')
    const isPublicRequest = isPublicAuthRequest(originalRequest.url)

    if (!isPublicRequest && status === 401 && !originalRequest._retry && refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}auth/token/refresh/`,
          { refresh: refreshToken },
          { timeout: 15000 }
        )
        const newAccess = refreshResponse.data?.access
        if (!newAccess) {
          throw new Error('No access token returned during refresh.')
        }

        localStorage.setItem('accessToken', newAccess)
        flushPending(null, newAccess)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('alumni_session')
        flushPending(refreshError, null)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
