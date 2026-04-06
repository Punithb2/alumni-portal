import { useCallback, useEffect, useMemo, useState } from 'react'
import api from 'app/utils/api'
import { getAvatarDataUrl } from 'app/utils/avatar'

const ROLE_LABELS = {
  alumni: 'Alumni',
  student: 'Student',
  admin: 'Admin',
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

const normalizeComment = (comment = {}) => ({
  id: comment.id,
  author: comment.author_name || 'Unknown',
  avatar: comment.author_avatar || getAvatarDataUrl(comment.author_name || 'User'),
  text: comment.content || '',
  time: formatTimeAgo(comment.created_at),
  createdAt: comment.created_at || null,
})

const normalizePost = (post = {}) => {
  const authorName = post.author_name || 'Unknown'
  const authorRole = ROLE_LABELS[post.author_role] || post.author_role || 'Community'
  const comments = Array.isArray(post.comments) ? post.comments.map(normalizeComment) : []

  return {
    id: post.id,
    author: authorName,
    authorId: post.author_id ?? null,
    authorProfileId: post.author_profile_id ?? null,
    authorConnectionStatus: post.author_connection_status ?? 'none',
    authorConnectionRequestId: post.author_connection_request_id ?? null,
    role: authorRole,
    avatar: post.author_avatar || getAvatarDataUrl(authorName),
    time: formatTimeAgo(post.created_at),
    content: post.content || '',
    createdAt: post.created_at || null,
    reactions: post.reaction_counts || {},
    myReaction: post.current_user_reaction || null,
    comments,
    commentCount: post.comment_count ?? comments.length,
  }
}

const extractList = (payload) => payload?.results ?? payload ?? []

export const useFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/posts/')
      const data = extractList(res.data)
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load posts:', err)
      setError('Failed to load feed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const addPost = async ({ text }) => {
    setActionError(null)
    try {
      const res = await api.post('/posts/', {
        content: text,
        reaction_counts: {},
      })
      setPosts((prev) => [res.data, ...prev])
      return normalizePost(res.data)
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to create post.'
      setActionError(message)
      throw err
    }
  }

  const addComment = async (postId, content) => {
    setActionError(null)
    try {
      const res = await api.post('/comments/', {
        post: postId,
        content,
      })

      setPosts((prev) =>
        prev.map((post) => {
          if (String(post.id) !== String(postId)) return post
          const nextComments = [res.data, ...(Array.isArray(post.comments) ? post.comments : [])]
          return {
            ...post,
            comments: nextComments,
            comment_count: nextComments.length,
          }
        })
      )

      return normalizeComment(res.data)
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to add comment.'
      setActionError(message)
      throw err
    }
  }

  const reactToPost = async (postId, reaction) => {
    setActionError(null)
    try {
      const res = await api.post(`/posts/${postId}/react/`, { reaction })
      setPosts((prev) => prev.map((post) => (String(post.id) === String(postId) ? res.data : post)))
      return normalizePost(res.data)
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to react to post.'
      setActionError(message)
      throw err
    }
  }

  const followAuthor = async (profileId) => {
    if (!profileId) return null
    setActionError(null)
    try {
      await api.post(`/profiles/${profileId}/send_connection_request/`)
      setPosts((prev) =>
        prev.map((post) =>
          String(post.author_profile_id) === String(profileId)
            ? {
                ...post,
                author_connection_status: 'outgoing_pending',
              }
            : post
        )
      )
      return true
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to follow this member.'
      setActionError(Array.isArray(message) ? message[0] : message)
      throw err
    }
  }

  const uiPosts = useMemo(() => posts.map(normalizePost), [posts])

  return {
    posts,
    uiPosts,
    loading,
    error,
    actionError,
    addPost,
    addComment,
    reactToPost,
    followAuthor,
    refetch: fetchPosts,
  }
}
