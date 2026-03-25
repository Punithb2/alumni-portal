import React, { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Shield,
  Clock,
  MoreHorizontal,
  TrendingUp,
  Globe,
  Lock,
  Eye,
  RefreshCw,
  Settings,
  BarChart3,
  X,
  Crown,
  Tag,
} from 'lucide-react'
import { useClubs } from '../../hooks/useClubs'

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Clock size={12} />,
  },
  suspended: {
    label: 'Suspended',
    cls: 'bg-red-50 text-red-700 border-red-200',
    icon: <XCircle size={12} />,
  },
}

const TYPE_COLORS = {
  'Interest Group': 'bg-blue-50 text-blue-700',
  Chapter: 'bg-purple-50 text-purple-700',
  Cohort: 'bg-amber-50 text-amber-700',
}

export default function ClubsManager() {
  const { clubs, approveClub, suspendClub, deleteClub, updateClub, createClub } = useClubs()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Interest Group',
    category: 'Technology',
    isPrivate: false,
    coverPhoto: '',
  })
  const [settingsMenuId, setSettingsMenuId] = useState(null)

  const stats = {
    total: clubs.length,
    active: clubs.filter((c) => c.status === 'active').length,
    pending: clubs.filter((c) => c.status === 'pending').length,
    suspended: clubs.filter((c) => c.status === 'suspended').length,
    members: clubs.reduce((s, c) => s + (c.membersCount || 0), 0),
  }

  const filtered = clubs.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchType = typeFilter === 'all' || c.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const openCreate = () => {
    setEditingClub(null)
    setForm({
      name: '',
      description: '',
      type: 'Interest Group',
      category: 'Technology',
      isPrivate: false,
      coverPhoto:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400',
    })
    setIsDrawerOpen(true)
  }

  const openEdit = (club) => {
    setEditingClub(club)
    setForm({
      name: club.name,
      description: club.description,
      type: club.type,
      category: club.category,
      isPrivate: club.isPrivate,
      coverPhoto: club.coverPhoto,
    })
    setIsDrawerOpen(true)
    setSettingsMenuId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingClub) {
      updateClub(editingClub.id, form)
    } else {
      // Clubs created from the University admin panel are treated
      // as university-created and can go live immediately.
      createClub({
        ...form,
        status: 'active',
        createdByRole: 'University',
        createdByName: 'University Admin',
      })
    }
    setIsDrawerOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this group?')) {
      deleteClub(id)
    }
    setSettingsMenuId(null)
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-1 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Clubs Management
          </h1>
          <p className="text-slate-500 font-medium">
            Approve, manage, and monitor all clubs and groups.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={3} /> Create Club
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Groups',
            value: stats.total,
            icon: <Shield size={20} className="text-indigo-600" />,
            bg: 'bg-indigo-50',
          },
          {
            label: 'Active',
            value: stats.active,
            icon: <CheckCircle size={20} className="text-emerald-600" />,
            bg: 'bg-emerald-50',
          },
          {
            label: 'Pending Approval',
            value: stats.pending,
            icon: <Clock size={20} className="text-amber-600" />,
            bg: 'bg-amber-50',
          },
          {
            label: 'Total Members',
            value: stats.members.toLocaleString(),
            icon: <Users size={20} className="text-blue-600" />,
            bg: 'bg-blue-50',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 min-w-0 w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search clubs by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {['all', 'active', 'pending', 'suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {s === 'all' ? 'All Status' : s}
                </button>
              ))}
            </div>
            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="Interest Group">Interest Groups</option>
              <option value="Chapter">Chapters</option>
              <option value="Cohort">Cohorts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Approvals banner */}
      {stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Clock size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-bold flex-1">
            {stats.pending} group{stats.pending > 1 ? 's are' : ' is'} awaiting your approval.
          </p>
          <button
            onClick={() => setStatusFilter('pending')}
            className="text-xs font-bold text-amber-700 underline hover:no-underline"
          >
            Review now
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Group</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1 text-center">Members</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Shield size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No clubs found</p>
              <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
            </div>
          )}
          {filtered.map((club) => {
            const statusCfg = STATUS_CONFIG[club.status] || STATUS_CONFIG.pending
            return (
              <div
                key={club.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition-colors items-center relative"
              >
                {/* Group Info */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={club.coverPhoto}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{club.name}</p>
                      {club.isPrivate ? (
                        <Lock size={12} className="text-slate-400 shrink-0" />
                      ) : (
                        <Globe size={12} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{club.category}</p>
                    {/* Admins */}
                    {club.admins?.[0] && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown size={10} className="text-amber-500" />
                        <span className="text-[11px] text-slate-400">{club.admins[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-1 rounded-full ${TYPE_COLORS[club.type] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {club.type}
                  </span>
                </div>

                {/* Members */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={13} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                      {club.membersCount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-center">
                  <span
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusCfg.cls}`}
                  >
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>

                {/* Created */}
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 font-medium">{club.createdAt}</p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1 relative">
                  {club.status === 'pending' && (
                    <button
                      onClick={() => approveClub(club.id)}
                      title="Approve"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setSettingsMenuId(settingsMenuId === club.id ? null : club.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {settingsMenuId === club.id && (
                    <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1">
                      <button
                        onClick={() => openEdit(club)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Edit3 size={15} /> Edit Details
                      </button>
                      <button
                        onClick={() => {
                          setSettingsMenuId(null)
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={15} /> View Members
                      </button>
                      {club.status === 'active' && (
                        <button
                          onClick={() => {
                            suspendClub(club.id)
                            setSettingsMenuId(null)
                          }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <XCircle size={15} /> Suspend
                        </button>
                      )}
                      {club.status === 'suspended' && (
                        <button
                          onClick={() => {
                            approveClub(club.id)
                            setSettingsMenuId(null)
                          }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <RefreshCw size={15} /> Reactivate
                        </button>
                      )}
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={() => handleDelete(club.id)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Click outside handler for menus */}
      {settingsMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setSettingsMenuId(null)} />
      )}

      {/* Create / Edit Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative bg-white shadow-2xl w-full max-w-[500px] flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingClub ? 'Edit Club' : 'Create New Club'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {editingClub
                    ? 'Update club details.'
                    : 'Fill in details to create a new community.'}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 bg-slate-50 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
              <form id="club-form" onSubmit={handleSubmit} className="space-y-5">
                {[
                  {
                    label: 'Club Name *',
                    field: 'name',
                    type: 'text',
                    placeholder: 'e.g. NYC Alumni Network',
                  },
                  {
                    label: 'Cover Photo URL',
                    field: 'coverPhoto',
                    type: 'url',
                    placeholder: 'https://...',
                  },
                ].map((f) => (
                  <div key={f.field} className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800">{f.label}</label>
                    <input
                      required={f.field === 'name'}
                      type={f.type}
                      value={form[f.field]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.field]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">Description</label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What is this club about?"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none resize-none font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    >
                      <option>Interest Group</option>
                      <option>Chapter</option>
                      <option>Cohort</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    >
                      {[
                        'Technology',
                        'Business',
                        'Geography',
                        'Class Year',
                        'Department',
                        'Interest',
                        'Alumni',
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isPrivate}
                    onChange={(e) => setForm((p) => ({ ...p, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Private Group</p>
                    <p className="text-xs text-slate-500 font-medium">
                      Members must request to join
                    </p>
                  </div>
                </label>
                {form.coverPhoto && (
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={form.coverPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.opacity = 0)}
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-5 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                form="club-form"
                type="submit"
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                {editingClub ? 'Save Changes' : 'Create Club'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
