import { useCallback, useEffect, useMemo, useState } from 'react'
import api from 'app/utils/api'

const normalizePostType = (value) => {
  const mapped = String(value || 'UPDATE').toUpperCase()
  if (['UPDATE', 'ACHIEVEMENT', 'QUESTION', 'EVENT'].includes(mapped)) return mapped
  return 'UPDATE'
}

const formatTimeAgo = (value) => {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const toUiPost = (post) => {
  const authorName = post.author_name || 'Unknown'
  const roleLabel = post.author_role || 'Community'
  return {
    id: post.id,
    author: authorName,
    role: roleLabel,
    avatar:
      post.author_avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=f3f4f6&color=4f46e5`,
    verified: false,
    verifiedType: null,
    time: formatTimeAgo(post.created_at),
    type: normalizePostType(post.post_type),
    content: post.content || '',
    images: [],
    reactions: post.reaction_counts || {},
    comments: post.comment_count || 0,
    shares: 0,
    mockComments: (post.comments || []).map((c) => ({
      id: c.id,
      author: c.author_name || 'Unknown',
      avatar:
        c.author_avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name || 'User')}&background=f1f5f9&color=334155`,
      text: c.content || '',
      time: formatTimeAgo(c.created_at),
      likes: 0,
      replies: [],
    })),
  }
}

export const useFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/posts/')
      const data = res.data.results ?? res.data
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load posts:', err)
      setError('Failed to load posts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const addPost = async ({ text, postType }) => {
    const payload = {
      content: text,
      reaction_counts: {},
    }
    const res = await api.post('/posts/', payload)
    setPosts((prev) => [res.data, ...prev])
    return res.data
  }

  const uiPosts = useMemo(() => posts.map(toUiPost), [posts])

  return {
    posts,
    uiPosts,
    loading,
    error,
    addPost,
    refetch: fetchPosts,
  }
}
