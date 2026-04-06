import { useCallback, useEffect, useState } from 'react'
import api from 'app/utils/api'
import { getAvatarDataUrl } from 'app/utils/avatar'

const titleCaseRole = (role) => {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'admin') return 'University'
  if (normalized === 'alumni') return 'Alumni'
  if (normalized === 'student') return 'Student'
  return 'Alumni'
}

const roleToApi = (role) => {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'university' || normalized === 'admin') return 'admin'
  if (normalized === 'student') return 'student'
  return 'alumni'
}

const mapProfileToUser = (profile) => {
  const fullName = `${profile.user?.first_name || ''} ${profile.user?.last_name || ''}`.trim() || 'Unknown User'
  return {
    id: profile.id,
    profileId: profile.id,
    userId: profile.user?.id,
    name: fullName,
    role: titleCaseRole(profile.role),
    company: profile.current_company || profile.current_position || '—',
    location: profile.city || '—',
    avatar:
      profile.avatar ||
      getAvatarDataUrl(fullName),
    status: profile.account_status || (profile.user?.is_active ? 'Active' : 'Suspended'),
    graduationYear: profile.graduation_year || '',
    email: profile.user?.email || '',
    department: profile.department || '',
    raw: profile,
  }
}

export const useUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/profiles/')
      const data = res.data.results ?? res.data
      const mapped = (Array.isArray(data) ? data : []).map(mapProfileToUser)
      setUsers(mapped)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const changeRole = async (profileId, role) => {
    const res = await api.patch(`/profiles/${profileId}/`, { role: roleToApi(role) })
    setUsers((prev) =>
      prev.map((u) => (String(u.profileId) === String(profileId) ? mapProfileToUser(res.data) : u))
    )
    return res.data
  }

  const deleteUser = async (profileId) => {
    await api.delete(`/profiles/${profileId}/`)
    setUsers((prev) => prev.filter((u) => String(u.profileId) !== String(profileId)))
  }

  const updateStatus = async (profileId, status) => {
    const res = await api.post(`/profiles/${profileId}/set_status/`, { status })
    setUsers((prev) =>
      prev.map((u) => (String(u.profileId) === String(profileId) ? mapProfileToUser(res.data) : u))
    )
    return res.data
  }

  const inviteUser = async ({ name, email, role }) => {
    const res = await api.post('/admin-users/invite/', { name, email, role })
    const mapped = mapProfileToUser(res.data.user)
    setUsers((prev) => [mapped, ...prev])
    return res.data
  }

  const bulkImportUsers = async ({ users: importUsers, defaultRole }) => {
    const res = await api.post('/admin-users/bulk-import/', {
      users: importUsers,
      default_role: roleToApi(defaultRole),
    })
    const createdUsers = (res.data.created || []).map(mapProfileToUser)
    if (createdUsers.length) {
      setUsers((prev) => [...createdUsers, ...prev])
    }
    return res.data
  }

  return {
    users,
    loading,
    error,
    changeRole,
    deleteUser,
    updateStatus,
    inviteUser,
    bulkImportUsers,
    refetch: fetchUsers,
  }
}
