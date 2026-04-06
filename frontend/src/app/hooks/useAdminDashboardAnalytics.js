import { useCallback, useEffect, useState } from 'react'
import api from 'app/utils/api'

export const useAdminDashboardAnalytics = (dateRange, segment) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/admin-analytics/', {
        params: {
          date_range: dateRange,
          segment,
        },
      })
      setAnalytics(res.data)
    } catch (err) {
      console.error('Failed to load admin analytics:', err)
      setError('Failed to load admin analytics.')
    } finally {
      setLoading(false)
    }
  }, [dateRange, segment])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}
