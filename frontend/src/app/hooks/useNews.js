import { useCallback, useEffect, useState } from 'react'
import api from 'app/utils/api'

export const useNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/news/')
      const data = res.data.results ?? res.data
      setNews(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load news:', err)
      setError('Failed to load news.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const createNews = async ({ title, summary, category }) => {
    const res = await api.post('/news/', {
      title,
      content: summary || '',
      category_name: category || 'Campus',
    })
    setNews((prev) => [res.data, ...prev])
    return res.data
  }

  const updateNews = async (id, { title, summary, category }) => {
    const res = await api.patch(`/news/${id}/`, {
      title,
      content: summary || '',
      category_name: category || 'Campus',
    })
    setNews((prev) => prev.map((item) => (String(item.id) === String(id) ? res.data : item)))
    return res.data
  }

  const deleteNews = async (id) => {
    await api.delete(`/news/${id}/`)
    setNews((prev) => prev.filter((item) => String(item.id) !== String(id)))
  }

  return { news, loading, error, createNews, updateNews, deleteNews, refetch: fetchNews }
}
