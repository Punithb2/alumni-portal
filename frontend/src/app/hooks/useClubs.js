// src/app/hooks/useClubs.js
// Custom hook providing reactive state for the Clubs feature using the real backend API
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'

export function useClubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Map of clubId -> posts/members/messages loaded on demand
  const [posts, setPosts] = useState({})
  const [members, setMembers] = useState({})
  const [joinRequests, setJoinRequests] = useState({})
  const [messages, setMessages] = useState({})

  const fetchClubs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/clubs/')
      setClubs(res.data.results ?? res.data)
    } catch (err) {
      console.error('Failed to load clubs:', err)
      setError('Failed to load clubs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  // ─── Computed sets ────────────────────────────────────────────────────────
  const joinedIds = new Set(clubs.filter((c) => c.is_member).map((c) => c.id))
  const pendingIds = new Set(clubs.filter((c) => c.is_pending).map((c) => c.id))

  // ─── Club CRUD ────────────────────────────────────────────────────────────
  const createClub = async (data) => {
    const res = await api.post('/clubs/', data)
    setClubs((prev) => [res.data, ...prev])
    return res.data
  }

  const updateClub = async (id, data) => {
    const res = await api.patch(`/clubs/${id}/`, data)
    setClubs((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    return res.data
  }

  const deleteClub = async (id) => {
    await api.delete(`/clubs/${id}/`)
    setClubs((prev) => prev.filter((c) => c.id !== id))
  }

  const approveClub = async (id) => {
    const res = await api.post(`/clubs/${id}/approve/`)
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, status: res.data.status } : c)))
  }

  const suspendClub = async (id) => {
    const res = await api.post(`/clubs/${id}/suspend/`)
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, status: res.data.status } : c)))
  }

  // ─── Membership ───────────────────────────────────────────────────────────
  const joinClub = async (clubId) => {
    const res = await api.post(`/clubs/${clubId}/join/`)
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              is_member: res.data.status === 'joined',
              is_pending: res.data.status === 'pending',
              members_count: res.data.status === 'joined' ? c.members_count + 1 : c.members_count,
            }
          : c
      )
    )
  }

  const leaveClub = async (clubId) => {
    await api.post(`/clubs/${clubId}/leave/`)
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? { ...c, is_member: false, members_count: Math.max(0, c.members_count - 1) }
          : c
      )
    )
  }

  const cancelRequest = async (clubId) => {
    await api.post(`/clubs/${clubId}/cancel_request/`)
    setClubs((prev) => prev.map((c) => (c.id === clubId ? { ...c, is_pending: false } : c)))
  }

  // ─── Members ──────────────────────────────────────────────────────────────
  const fetchMembers = async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/members/`)
    setMembers((prev) => ({ ...prev, [clubId]: res.data }))
    return res.data
  }

  const removeMember = async (clubId, membershipId) => {
    await api.delete(`/club-memberships/${membershipId}/`)
    setMembers((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((m) => m.id !== membershipId),
    }))
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId ? { ...c, members_count: Math.max(0, c.members_count - 1) } : c
      )
    )
  }

  const promoteMember = async (clubId, membershipId, newRole) => {
    const res = await api.patch(`/club-memberships/${membershipId}/`, { role: newRole })
    setMembers((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).map((m) => (m.id === membershipId ? res.data : m)),
    }))
  }

  // ─── Join Requests ────────────────────────────────────────────────────────
  const fetchJoinRequests = async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/join_requests/`)
    setJoinRequests((prev) => ({ ...prev, [clubId]: res.data }))
    return res.data
  }

  const approveJoinRequest = async (clubId, requestId) => {
    await api.post(`/clubs/${clubId}/approve_request/`, { request_id: requestId })
    setJoinRequests((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((r) => r.id !== requestId),
    }))
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, members_count: c.members_count + 1 } : c))
    )
  }

  const rejectJoinRequest = async (clubId, requestId) => {
    await api.post(`/clubs/${clubId}/reject_request/`, { request_id: requestId })
    setJoinRequests((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((r) => r.id !== requestId),
    }))
  }

  // ─── Posts ────────────────────────────────────────────────────────────────
  const fetchPosts = async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/posts/`)
    setPosts((prev) => ({ ...prev, [clubId]: res.data }))
    return res.data
  }

  const createPost = async (clubId, postData) => {
    const res = await api.post(`/clubs/${clubId}/create_post/`, postData)
    setPosts((prev) => ({ ...prev, [clubId]: [res.data, ...(prev[clubId] || [])] }))
    return res.data
  }

  const deletePost = async (clubId, postId) => {
    await api.delete(`/club-posts/${postId}/`)
    setPosts((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((p) => p.id !== postId),
    }))
  }

  const likePost = async (clubId, postId, isLiked) => {
    const endpoint = isLiked ? 'unlike' : 'like'
    const res = await api.post(`/club-posts/${postId}/${endpoint}/`)
    setPosts((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).map((p) =>
        p.id === postId ? { ...p, likes: res.data.likes } : p
      ),
    }))
  }

  const pinPost = async (clubId, postId) => {
    const res = await api.post(`/club-posts/${postId}/pin/`)
    setPosts((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).map((p) =>
        p.id === postId ? { ...p, is_pinned: res.data.is_pinned } : p
      ),
    }))
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const fetchChat = async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/chat/`)
    setMessages((prev) => ({ ...prev, [clubId]: res.data }))
    return res.data
  }

  const sendMessage = async (clubId, text) => {
    const res = await api.post(`/clubs/${clubId}/send_message/`, { text })
    setMessages((prev) => ({ ...prev, [clubId]: [...(prev[clubId] || []), res.data] }))
    return res.data
  }

  return {
    clubs,
    posts,
    members,
    joinRequests,
    messages,
    joinedIds,
    pendingIds,
    loading,
    error,

    // Club actions
    createClub,
    updateClub,
    deleteClub,
    approveClub,
    suspendClub,
    refetch: fetchClubs,

    // Membership
    joinClub,
    leaveClub,
    cancelRequest,

    // Members management
    fetchMembers,
    removeMember,
    promoteMember,

    // Join requests
    fetchJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,

    // Posts
    fetchPosts,
    createPost,
    deletePost,
    likePost,
    pinPost,

    // Chat
    fetchChat,
    sendMessage,
  }
}
