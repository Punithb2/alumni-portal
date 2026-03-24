import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Power, Eye, UserCog, X, UserPlus, CheckCircle } from 'lucide-react'
import { dummyProfiles } from '../../data/dummyData'
import { Table, Modal } from '../../components/GenericComponents'

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState(dummyProfiles.map((u) => ({ ...u, status: 'Active' })))
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Alumni' })
  const [inviteSent, setInviteSent] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkFileName, setBulkFileName] = useState('')
  const [bulkDefaultRole, setBulkDefaultRole] = useState('Alumni')
  const [bulkPreview, setBulkPreview] = useState([])
  const [bulkError, setBulkError] = useState('')

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'All' || user.role === filterRole
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsModalOpen(true)
  }

  const handleRoleChange = () => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u)))
      setIsModalOpen(false)
      setSelectedUser(null)
    }
  }

  const toggleStatus = (userId) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
      )
    )
  }

  const handleDelete = (userId) => {
    setUsers(users.filter((u) => u.id !== userId))
    setDeleteConfirm(null)
  }

  const handleInvite = (e) => {
    e.preventDefault()
    const newUser = {
      id: String(Date.now()),
      name: inviteForm.name,
      role: inviteForm.role,
      company: 'Invited',
      location: '—',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inviteForm.name)}&background=e0e7ff&color=4f46e5`,
      status: 'Pending',
      graduationYear: new Date().getFullYear(),
    }
    setUsers([newUser, ...users])
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setIsInviteOpen(false)
      setInviteForm({ name: '', email: '', role: 'Alumni' })
    }, 1500)
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

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    return lines.slice(1).map((line) => {
      const cols = line.split(',')
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = (cols[i] || '').trim()
      })
      return obj
    })
  }

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBulkError('')
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
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ede9fe&color=4c1d95`,
            status: 'Active',
            graduationYear: Number.isNaN(gradYear) ? new Date().getFullYear() : gradYear,
            email,
          }
        })
        setBulkPreview(mapped)
      } catch (err) {
        setBulkError('Unable to read this CSV file. Please check the format.')
        setBulkPreview([])
      }
    }
    reader.readAsText(file)
  }

  const applyBulkImport = () => {
    if (!bulkPreview.length) return
    setUsers((prev) => [...bulkPreview, ...prev])
    setIsBulkOpen(false)
    setBulkPreview([])
    setBulkFileName('')
    setBulkError('')
  }

  const statusBadge = (status) => {
    const map = {
      Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
      Pending: 'bg-amber-50   text-amber-700   ring-1 ring-inset ring-amber-600/20',
      Suspended: 'bg-rose-50    text-rose-700    ring-1 ring-inset ring-rose-600/20',
    }
    return map[status] || 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Heading — Tailwind UI */}
      <div className="border-b border-slate-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-7 text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage alumni, students, and admins across the portal.
          </p>
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors"
          >
            <UserPlus size={15} aria-hidden="true" /> Invite User
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors"
          >
            Bulk CSV Import
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-0 bg-white pl-9 pr-4 py-1.5 text-slate-900
                                   shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400
                                   focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow outline-none"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none"
        >
          <option value="All">All Roles</option>
          <option value="University">University</option>
          <option value="Alumni">Alumni</option>
          <option value="Student">Student</option>
          <option value="Mentor">Mentor</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Table — Tailwind UI */}
      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-900/5 bg-white">
        <div className="overflow-x-auto">
          <Table
            headers={['User', 'Role / Company', 'Status', 'Actions']}
            data={filteredUsers}
            emptyMessage="No users found matching current filters."
            renderRow={(user) => (
              <>
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 flex-none rounded-full object-cover ring-1 ring-slate-900/5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.location}</p>
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
                      className="p-1.5 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openRoleModal(user)}
                      className="p-1.5 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Change Role"
                    >
                      <UserCog size={15} />
                    </button>
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`p-1.5 rounded-lg transition-colors ${user.status === 'Active' ? 'hover:text-amber-500 hover:bg-amber-50' : 'hover:text-emerald-500 hover:bg-emerald-50'}`}
                      title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                    >
                      <Power size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="p-1.5 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>
            Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
            {users.length} users
          </span>
          <div className="flex gap-1">
            <button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              Prev
            </button>
            <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
              1
            </button>
            <button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Invite User Modal ── */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false)
          setInviteSent(false)
        }}
        title="Invite New User"
        size="sm"
      >
        {inviteSent ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <p className="font-bold text-slate-800">Invitation Sent!</p>
            <p className="text-sm text-slate-500">User has been added to the list.</p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jane Smith"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none"
              >
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
                <option value="University">University</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition-colors"
              >
                Send Invite
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Bulk CSV Import Modal ── */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => {
          setIsBulkOpen(false)
          setBulkPreview([])
          setBulkFileName('')
          setBulkError('')
        }}
        title="Bulk Add Users from CSV"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a CSV exported from your alumni or student onboarding form. The header should
            include at least{' '}
            <span className="font-semibold text-slate-800">
              full_name, email, role, graduation_year, department
            </span>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkFileChange}
                className="block w-full text-sm text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              {bulkFileName && (
                <p className="mt-1 text-xs text-slate-500">Selected: {bulkFileName}</p>
              )}
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Role (if missing)
              </label>
              <select
                value={bulkDefaultRole}
                onChange={(e) => setBulkDefaultRole(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
                <option value="University">University</option>
                <option value="Mentor">Mentor</option>
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
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                {bulkPreview.length} rows ready to import
              </span>
            )}
          </div>

          {bulkError && (
            <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {bulkError}
            </div>
          )}

          {bulkPreview.length > 0 && (
            <div className="border border-slate-200 rounded-xl max-h-52 overflow-auto text-xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Role</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Graduation Year
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkPreview.slice(0, 10).map((u) => (
                    <tr key={u.id}>
                      <td className="px-3 py-1.5">{u.name}</td>
                      <td className="px-3 py-1.5">{u.email}</td>
                      <td className="px-3 py-1.5">{u.role}</td>
                      <td className="px-3 py-1.5">{u.graduationYear}</td>
                      <td className="px-3 py-1.5">{u.company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bulkPreview.length > 10 && (
                <div className="px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50">
                  Showing first 10 rows of {bulkPreview.length} total.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!bulkPreview.length}
              onClick={applyBulkImport}
              className={`px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition-colors ${
                bulkPreview.length
                  ? 'bg-indigo-600 hover:bg-indigo-500'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Add {bulkPreview.length || ''} Users
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
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
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* ── Role Change Modal ── */}
      <Modal
        isOpen={isModalOpen && !!selectedUser}
        onClose={() => setIsModalOpen(false)}
        title="Change Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl ring-1 ring-slate-900/5">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-900/10"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">Current: {selectedUser.role}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">New Role</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="University">University</option>
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
                <option value="Mentor">Mentor</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
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
