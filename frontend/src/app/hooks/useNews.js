import { useCallback, useEffect, useState } from 'react'
import api from 'app/utils/api'

const normalizeNews = (article = {}) => ({
  ...article,
  summary: article.summary ?? '',
  content: article.content ?? '',
  category_name: article.category_name ?? article.categoryName ?? 'Campus',
  image: article.image ?? '',
  is_published: Boolean(article.is_published),
})

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
      setNews((Array.isArray(data) ? data : []).map(normalizeNews))
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

  const createNews = async ({ title, summary, content, category, image, isPublished }) => {
    const res = await api.post('/news/', {
      title,
      summary: summary || '',
      content: content || '',
      category_name: category || 'Campus',
      image: image || '',
      is_published: Boolean(isPublished),
    })
    const normalized = normalizeNews(res.data)
    setNews((prev) => [normalized, ...prev])
    return normalized
  }

  const updateNews = async (id, { title, summary, content, category, image, isPublished }) => {
    const res = await api.patch(`/news/${id}/`, {
      title,
      summary: summary || '',
      content: content || '',
      category_name: category || 'Campus',
      image: image || '',
      is_published: Boolean(isPublished),
    })
    const normalized = normalizeNews(res.data)
    setNews((prev) => prev.map((item) => (String(item.id) === String(id) ? normalized : item)))
    return normalized
  }

  const deleteNews = async (id) => {
    await api.delete(`/news/${id}/`)
    setNews((prev) => prev.filter((item) => String(item.id) !== String(id)))
  }

  return { news, loading, error, createNews, updateNews, deleteNews, refetch: fetchNews }
}
