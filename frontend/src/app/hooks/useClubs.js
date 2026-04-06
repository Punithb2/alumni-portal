// src/app/hooks/useClubs.js
// Custom hook providing reactive state for the Clubs feature using the real backend API
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'
import { getAvatarDataUrl } from 'app/utils/avatar'

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400'

const CATEGORY_LABEL_TO_VALUE = {
  Technology: 'technical',
  Business: 'professional',
  Arts: 'cultural',
  Sports: 'sports',
  Geography: 'social',
  'Class Year': 'academic',
  Department: 'academic',
  Interest: 'social',
  Alumni: 'professional',
  Other: 'other',
}

const CATEGORY_VALUE_TO_LABEL = {
  technical: 'Technology',
  professional: 'Business',
  cultural: 'Arts',
  sports: 'Sports',
  social: 'Interest',
  academic: 'Class Year',
  other: 'Other',
}

const getSafeCoverImage = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('blob:')) return ''
  return trimmed
}

const getDisplayName = (userLike = {}) => {
  const explicit =
    userLike.name ||
    userLike.full_name ||
    userLike.fullName ||
    [userLike.first_name, userLike.last_name].filter(Boolean).join(' ').trim()

  return explicit || userLike.email || 'Member'
}

const normalizeClub = (club = {}) => {
  const categoryValue = club.categoryValue || club.category || 'other'
  const memberAvatars = club.memberAvatars || club.member_avatars || []
  const createdByName = club.createdByName || club.created_by_name || ''

  return {
    ...club,
    category: CATEGORY_VALUE_TO_LABEL[categoryValue] || categoryValue,
    categoryValue,
    coverPhoto: club.coverPhoto || club.cover_image || DEFAULT_COVER_IMAGE,
    cover_image: club.cover_image || club.coverPhoto || DEFAULT_COVER_IMAGE,
    isPrivate: club.isPrivate ?? club.is_private ?? false,
    is_private: club.is_private ?? club.isPrivate ?? false,
    membersCount: club.membersCount ?? club.members_count ?? 0,
    members_count: club.members_count ?? club.membersCount ?? 0,
    createdAt: club.createdAt || club.created_at || '',
    created_at: club.created_at || club.createdAt || '',
    memberAvatars,
    member_avatars: memberAvatars,
    createdByName,
    created_by_name: createdByName,
    admins:
      club.admins ||
      (createdByName
        ? [
            {
              id: `club-owner-${club.id || 'new'}`,
              name: createdByName,
              role: 'Owner',
              avatar: memberAvatars[0] || '',
            },
          ]
        : []),
  }
}

const normalizeMember = (member = {}) => ({
  ...member,
  name: getDisplayName(member.user || member),
  avatar: member.avatar || member.user?.avatar || getAvatarDataUrl(getDisplayName(member.user || member)),
  title: member.title || member.user?.headline || member.user?.role || '',
  role: member.role
    ? `${member.role.charAt(0).toUpperCase()}${member.role.slice(1)}`
    : 'Member',
  roleValue: member.role || 'member',
  joinedAt: member.joinedAt || member.joined_at || '',
  userId: member.user?.id ?? member.userId ?? null,
})

const normalizeJoinRequest = (request = {}) => ({
  ...request,
  name: getDisplayName(request.user || request),
  avatar:
    request.avatar || request.user?.avatar || getAvatarDataUrl(getDisplayName(request.user || request)),
  title: request.title || request.user?.headline || '',
  requestedAt: request.requestedAt || request.requested_at || '',
})

const normalizePost = (post = {}) => ({
  ...post,
  author: post.author || post.author_name || 'Member',
  authorId: post.authorId || post.author_id || null,
  avatar: post.avatar || post.author_avatar || getAvatarDataUrl(post.author || post.author_name || 'Member'),
  time: post.time || post.created_at || '',
  isPinned: post.isPinned ?? post.is_pinned ?? false,
})

const normalizeMessage = (message = {}) => ({
  ...message,
  sender: message.sender || message.sender_name || 'Member',
  avatar: message.avatar || message.sender_avatar || '',
  time: message.time || message.sent_at || '',
})

const serializeClubPayload = (data = {}, { isUpdate = false } = {}) => {
  const payload = {}

  if ('name' in data) payload.name = (data.name || '').trim()
  if ('description' in data) payload.description = data.description || ''
  if ('type' in data) payload.type = data.type || 'Interest Group'

  if ('category' in data || 'categoryValue' in data) {
    const categoryInput = data.categoryValue || data.category
    payload.category = CATEGORY_LABEL_TO_VALUE[categoryInput] || categoryInput || 'other'
  }

  if ('isPrivate' in data || 'is_private' in data) {
    payload.is_private = Boolean(data.isPrivate ?? data.is_private)
  }

  if ('status' in data) payload.status = data.status
  if ('tags' in data) payload.tags = Array.isArray(data.tags) ? data.tags : []
  if ('rules' in data) payload.rules = Array.isArray(data.rules) ? data.rules : []
  if ('icon' in data) payload.icon = data.icon || ''

  const coverImage = getSafeCoverImage(data.coverPhoto || data.cover_image)
  if (coverImage) {
    payload.cover_image = coverImage
  } else if (!isUpdate) {
    payload.cover_image = DEFAULT_COVER_IMAGE
  }

  return payload
}

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
      setClubs((res.data.results ?? res.data).map(normalizeClub))
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

  const joinedIds = new Set(clubs.filter((c) => c.is_member).map((c) => c.id))
  const pendingIds = new Set(clubs.filter((c) => c.is_pending).map((c) => c.id))

  const createClub = async (data) => {
    const res = await api.post('/clubs/', serializeClubPayload(data))
    const nextClub = normalizeClub(res.data)
    setClubs((prev) => [nextClub, ...prev])
    return nextClub
  }

  const updateClub = async (id, data) => {
    const res = await api.patch(`/clubs/${id}/`, serializeClubPayload(data, { isUpdate: true }))
    const nextClub = normalizeClub(res.data)
    setClubs((prev) => prev.map((c) => (c.id === id ? nextClub : c)))
    return nextClub
  }

  const deleteClub = async (id) => {
    await api.delete(`/clubs/${id}/`)
    setClubs((prev) => prev.filter((c) => c.id !== id))
  }

  const approveClub = async (id) => {
    const res = await api.post(`/clubs/${id}/approve/`)
    setClubs((prev) =>
      prev.map((c) =>
        c.id === id ? normalizeClub({ ...c, status: res.data.status || 'active' }) : c
      )
    )
  }

  const suspendClub = async (id) => {
    const res = await api.post(`/clubs/${id}/suspend/`)
    setClubs((prev) =>
      prev.map((c) =>
        c.id === id ? normalizeClub({ ...c, status: res.data.status || 'suspended' }) : c
      )
    )
  }

  const joinClub = async (clubId) => {
    const res = await api.post(`/clubs/${clubId}/join/`)
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              is_member: res.data.status === 'joined',
              is_pending: res.data.status === 'pending',
              members_count:
                res.data.status === 'joined' ? (c.members_count || 0) + 1 : c.members_count,
              membersCount:
                res.data.status === 'joined' ? (c.membersCount || 0) + 1 : c.membersCount,
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
          ? {
              ...c,
              is_member: false,
              members_count: Math.max(0, (c.members_count || 0) - 1),
              membersCount: Math.max(0, (c.membersCount || 0) - 1),
            }
          : c
      )
    )
  }

  const cancelRequest = async (clubId) => {
    await api.post(`/clubs/${clubId}/cancel_request/`)
    setClubs((prev) => prev.map((c) => (c.id === clubId ? { ...c, is_pending: false } : c)))
  }

  const fetchMembers = useCallback(async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/members/`)
    const nextMembers = res.data.map(normalizeMember)
    setMembers((prev) => ({ ...prev, [clubId]: nextMembers }))
    return nextMembers
  }, [])

  const removeMember = async (clubId, membershipId) => {
    await api.delete(`/club-memberships/${membershipId}/`)
    setMembers((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((m) => m.id !== membershipId),
    }))
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              members_count: Math.max(0, (c.members_count || 0) - 1),
              membersCount: Math.max(0, (c.membersCount || 0) - 1),
            }
          : c
      )
    )
  }

  const promoteMember = async (clubId, membershipId, newRole) => {
    const res = await api.patch(`/club-memberships/${membershipId}/`, { role: newRole })
    setMembers((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).map((m) =>
        m.id === membershipId ? normalizeMember(res.data) : m
      ),
    }))
  }

  const fetchJoinRequests = useCallback(async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/join_requests/`)
    const nextRequests = res.data.map(normalizeJoinRequest)
    setJoinRequests((prev) => ({ ...prev, [clubId]: nextRequests }))
    return nextRequests
  }, [])

  const approveJoinRequest = async (clubId, requestId) => {
    await api.post(`/clubs/${clubId}/approve_request/`, { request_id: requestId })
    setJoinRequests((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((r) => r.id !== requestId),
    }))
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              members_count: (c.members_count || 0) + 1,
              membersCount: (c.membersCount || 0) + 1,
            }
          : c
      )
    )
  }

  const rejectJoinRequest = async (clubId, requestId) => {
    await api.post(`/clubs/${clubId}/reject_request/`, { request_id: requestId })
    setJoinRequests((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((r) => r.id !== requestId),
    }))
  }

  const fetchPosts = useCallback(async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/posts/`)
    const nextPosts = res.data.map(normalizePost)
    setPosts((prev) => ({ ...prev, [clubId]: nextPosts }))
    return nextPosts
  }, [])

  const createPost = async (clubId, postData) => {
    const payload = {
      content: (postData?.content || '').trim(),
    }
    const image = getSafeCoverImage(postData?.image)
    if (image) payload.image = image

    const res = await api.post(`/clubs/${clubId}/create_post/`, payload)
    const nextPost = normalizePost(res.data)
    setPosts((prev) => ({ ...prev, [clubId]: [nextPost, ...(prev[clubId] || [])] }))
    return nextPost
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
        p.id === postId ? { ...p, is_pinned: res.data.is_pinned, isPinned: res.data.is_pinned } : p
      ),
    }))
  }

  const fetchChat = useCallback(async (clubId) => {
    const res = await api.get(`/clubs/${clubId}/chat/`)
    const nextMessages = res.data.map(normalizeMessage)
    setMessages((prev) => ({ ...prev, [clubId]: nextMessages }))
    return nextMessages
  }, [])

  const sendMessage = async (clubId, text) => {
    const res = await api.post(`/clubs/${clubId}/send_message/`, { text })
    const nextMessage = normalizeMessage(res.data)
    setMessages((prev) => ({ ...prev, [clubId]: [...(prev[clubId] || []), nextMessage] }))
    return nextMessage
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
    createClub,
    updateClub,
    deleteClub,
    approveClub,
    suspendClub,
    refetch: fetchClubs,
    joinClub,
    leaveClub,
    cancelRequest,
    fetchMembers,
    removeMember,
    promoteMember,
    fetchJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    fetchPosts,
    createPost,
    deletePost,
    likePost,
    pinPost,
    fetchChat,
    sendMessage,
  }
}
