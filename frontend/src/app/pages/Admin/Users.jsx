import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Power, Eye, UserCog, UserPlus, CheckCircle } from 'lucide-react'
import { Table, Modal } from '../../components/GenericComponents'
import { useUsers } from '../../hooks/useUsers'
import { getAvatarDataUrl } from '../../utils/avatar'

const statusBadge = (status) => {
  const map = {
    Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    Pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    Suspended: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  }
  return map[status] || 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20'
}

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = (cols[index] || '').trim()
    })
    return row
  })
}

const downloadCsvTemplate = () => {
  const header = 'full_name,email,role,graduation_year,department\n'
  const example = 'Jane Doe,jane@example.com,Alumni,2018,Computer Science\n'
  const blob = new Blob([header + example], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'alumni-portal-users-template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const AdminUsers = () => {
  const navigate = useNavigate()
  const {
    users,
    loading,
    error,
    changeRole,
    deleteUser,
    updateStatus,
    inviteUser,
    bulkImportUsers,
  } = useUsers()

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Alumni' })
  const [inviteResult, setInviteResult] = useState(null)
  const [inviteError, setInviteError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkFileName, setBulkFileName] = useState('')
  const [bulkDefaultRole, setBulkDefaultRole] = useState('Alumni')
  const [bulkPreview, setBulkPreview] = useState([])
  const [bulkError, setBulkError] = useState('')
  const [bulkResult, setBulkResult] = useState(null)
  const [busyAction, setBusyAction] = useState('')

  const filteredUsers = users.filter((user) => {
    const needle = search.toLowerCase()
    const matchesSearch =
      user.name.toLowerCase().includes(needle) ||
      user.role.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle)
    const matchesRole = filterRole === 'All' || user.role === filterRole
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsRoleModalOpen(true)
  }

  const handleRoleChange = async () => {
    if (!selectedUser) return
    setBusyAction(`role-${selectedUser.profileId}`)
    try {
      await changeRole(selectedUser.profileId, newRole)
      setIsRoleModalOpen(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Failed to change role:', err)
    } finally {
      setBusyAction('')
    }
  }

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active'
    setBusyAction(`status-${user.profileId}`)
    try {
      await updateStatus(user.profileId, nextStatus)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setBusyAction('')
    }
  }

  const handleDelete = async (profileId) => {
    setBusyAction(`delete-${profileId}`)
    try {
      await deleteUser(profileId)
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
    } finally {
      setBusyAction('')
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteError('')
    setBusyAction('invite')
    try {
      const result = await inviteUser(inviteForm)
      setInviteResult(result)
      setTimeout(() => {
        setInviteResult(null)
        setIsInviteOpen(false)
        setInviteForm({ name: '', email: '', role: 'Alumni' })
      }, 2200)
    } catch (err) {
      setInviteError(
        err?.response?.data?.email?.[0] ||
          err?.response?.data?.name?.[0] ||
          'Failed to invite user.'
      )
    } finally {
      setBusyAction('')
    }
  }

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBulkError('')
    setBulkResult(null)
    setBulkFileName(file.name)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = String(evt.target?.result || '')
        const rows = parseCsv(text)
        if (!rows.length) {
          setBulkError('No valid rows found in CSV.')
          setBulkPreview([])
          return
        }
        const mapped = rows.map((row, index) => {
          const name = row.full_name || row.name || `Imported User ${index + 1}`
          const email = row.email || ''
          const gradYear = parseInt(row.graduation_year || row.graduationyear || '', 10)
          const role = row.role || bulkDefaultRole
          const department = row.department || row.program || ''
          return {
            id: `bulk-${Date.now()}-${index}`,
            name,
            role,
            company: department || 'Imported',
            location: '—',
            avatar: getAvatarDataUrl(name),
            status: 'Pending',
            graduationYear: Number.isNaN(gradYear) ? '' : gradYear,
            email,
            department,
          }
        })
        setBulkPreview(mapped)
      } catch {
        setBulkError('Unable to read this CSV file. Please check the format.')
        setBulkPreview([])
      }
    }
    reader.readAsText(file)
  }

  const applyBulkImport = async () => {
    if (!bulkPreview.length) return
    setBulkError('')
    setBusyAction('bulk-import')
    try {
      const result = await bulkImportUsers({
        users: bulkPreview.map((user) => ({
          full_name: user.name,
          email: user.email,
          role: user.role,
          graduation_year: user.graduationYear,
          department: user.department,
          location: user.location,
          company: user.company,
        })),
        defaultRole: bulkDefaultRole,
      })
      setBulkResult(result)
      setBulkPreview([])
      setBulkFileName('')
    } catch (err) {
      setBulkError(err?.response?.data?.users?.[0] || 'Bulk import failed.')
    } finally {
      setBusyAction('')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="border-b border-slate-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-7 text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage alumni, students, and admins across the portal.
          </p>
        </div>
        <div className="mt-3 flex gap-2 sm:ml-4 sm:mt-0">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            <UserPlus size={15} /> Invite User
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Bulk CSV Import
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={15}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-0 bg-white py-1.5 pl-9 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 outline-none transition-shadow focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        >
          <option value="All">All Roles</option>
          <option value="University">University</option>
          <option value="Alumni">Alumni</option>
          <option value="Student">Student</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <Table
            headers={['User', 'Role / Company', 'Status', 'Actions']}
            data={filteredUsers}
            emptyMessage={loading ? 'Loading users...' : 'No users found matching current filters.'}
            renderRow={(user) => (
              <>
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-900/5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email || user.location}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <p className="text-sm font-medium text-slate-900">{user.role}</p>
                  <p className="text-xs text-slate-500">{user.company}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusBadge(user.status)}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-slate-400">
                    <button
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
                      title="View Profile"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openRoleModal(user)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
                      title="Change Role"
                    >
                      <UserCog size={15} />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(user)}
                      disabled={busyAction === `status-${user.profileId}`}
                      className={`rounded-lg p-1.5 transition-colors ${
                        user.status === 'Active'
                          ? 'hover:bg-amber-50 hover:text-amber-500'
                          : 'hover:bg-emerald-50 hover:text-emerald-500'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                    >
                      <Power size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user.profileId)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      title="Delete User"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-500">
          <span>
            Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
            {users.length} users
          </span>
        </div>
      </div>

      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false)
          setInviteResult(null)
          setInviteError('')
        }}
        title="Invite New User"
        size="sm"
      >
        {inviteResult ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <p className="font-bold text-slate-800">Invitation Created</p>
            <p className="text-sm text-slate-500">Share this temporary password with the user.</p>
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
              Temporary password:{' '}
              <span className="font-semibold text-slate-900">{inviteResult.temporary_password}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
                <option value="University">University</option>
              </select>
            </div>
            {inviteError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {inviteError}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction === 'invite'}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === 'invite' ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isBulkOpen}
        onClose={() => {
          setIsBulkOpen(false)
          setBulkPreview([])
          setBulkFileName('')
          setBulkError('')
          setBulkResult(null)
        }}
        title="Bulk Add Users from CSV"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a CSV with at least <span className="font-semibold">full_name, email, role</span>.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkFileChange}
                className="block w-full cursor-pointer text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {bulkFileName && <p className="mt-1 text-xs text-slate-500">Selected: {bulkFileName}</p>}
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Default Role
              </label>
              <select
                value={bulkDefaultRole}
                onChange={(e) => setBulkDefaultRole(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
                <option value="University">University</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span className="underline">Download sample CSV template</span>
            </button>
            {bulkPreview.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {bulkPreview.length} rows ready
              </span>
            )}
          </div>

          {bulkError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {bulkError}
            </div>
          )}

          {bulkResult && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Imported {bulkResult.created?.length || 0} users. Skipped {bulkResult.skipped?.length || 0}.
            </div>
          )}

          {bulkPreview.length > 0 && (
            <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 text-xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Role</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Graduation Year</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkPreview.slice(0, 10).map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-1.5">{user.name}</td>
                      <td className="px-3 py-1.5">{user.email}</td>
                      <td className="px-3 py-1.5">{user.role}</td>
                      <td className="px-3 py-1.5">{user.graduationYear || '—'}</td>
                      <td className="px-3 py-1.5">{user.department || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!bulkPreview.length || busyAction === 'bulk-import'}
              onClick={applyBulkImport}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                bulkPreview.length ? 'bg-indigo-600 hover:bg-indigo-500' : 'cursor-not-allowed bg-slate-300'
              }`}
            >
              {busyAction === 'bulk-import' ? 'Importing...' : `Add ${bulkPreview.length || ''} Users`}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User?"
        description="This action cannot be undone. The user will be permanently removed from the portal."
        size="sm"
      >
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            disabled={busyAction === `delete-${deleteConfirm}`}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isRoleModalOpen && !!selectedUser}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-900/5">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-900/10"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">Current: {selectedUser.role}</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New Role</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="University">University</option>
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={busyAction === `role-${selectedUser.profileId}`}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Role
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminUsers
