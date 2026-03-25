import React, { useState, useMemo } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { CampaignSheet } from '../../components/campaigns/CampaignSheet'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  HeartHandshake,
  TrendingUp,
  Users,
  BarChart3,
  List,
  Megaphone,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Award,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react'

const CATEGORY_OPTIONS = [
  'scholarship',
  'infrastructure',
  'emergency',
  'research',
  'health',
  'sports',
  'events',
]
const CATEGORY_LABELS = {
  scholarship: 'Scholarship',
  infrastructure: 'Infrastructure',
  emergency: 'Crisis Relief',
  research: 'Research',
  health: 'Health',
  sports: 'Sports',
  events: 'Events',
}
const CATEGORY_COLORS = {
  scholarship: 'bg-blue-100 text-blue-700',
  infrastructure: 'bg-amber-100 text-amber-700',
  emergency: 'bg-rose-100 text-rose-700',
  research: 'bg-purple-100 text-purple-700',
  health: 'bg-emerald-100 text-emerald-700',
  sports: 'bg-orange-100 text-orange-700',
  events: 'bg-teal-100 text-teal-700',
}

function StatCard({ icon: _Icon, label, value, sub, color = 'violet' }) {
  const cls = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cls[color]}`}
      >
        <_Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  )
}

export default function CampaignManager() {
  const { campaigns, myDonations, addCampaign, updateCampaign, deleteCampaign } = useCampaigns()
  const [activeTab, setActiveTab] = useState('campaigns') // 'analytics' | 'campaigns' | 'donors'
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    story: '',
    goal: '',
    deadline: '',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    currency: 'INR',
    category: 'scholarship',
    campaignType: 'donation',
    featured: false,
    urgent: false,
    allowAnonymous: true,
    allowRecurring: true,
    showDonorList: true,
  })

  // Analytics
  const monetaryCampaigns = campaigns.filter((c) => c.campaignType !== 'participation')
  const totalRaised = monetaryCampaigns.reduce((s, c) => s + c.raised, 0)
  const totalGoal = monetaryCampaigns.reduce((s, c) => s + c.goal, 0)
  const totalDonors = campaigns.reduce((s, c) => s + c.donorCount, 0)
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')
  const monetaryDonations = myDonations.filter((d) => typeof d.amount === 'number')
  const avgGift =
    monetaryDonations.length > 0
      ? Math.round(monetaryDonations.reduce((s, d) => s + d.amount, 0) / monetaryDonations.length)
      : 0
  // const topCampaign = [...monetaryCampaigns].sort((a, b) => b.raised - a.raised)[0]
  const overallPct = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((c) => {
        const q = searchQuery.toLowerCase()
        const matchQ =
          !q || c.title.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)
        const matchS = statusFilter === 'all' || c.status === statusFilter
        return matchQ && matchS
      }),
    [campaigns, searchQuery, statusFilter]
  )

  // All recent donors across all campaigns
  const allDonors = useMemo(() => {
    return campaigns
      .flatMap((c) =>
        (c.recentDonors || []).map((d) => ({ ...d, campaignTitle: c.title, campaignId: c.id }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [campaigns])

  const handleCampaignClick = (c) => {
    setSelectedCampaign(c)
    setIsSheetOpen(true)
  }
  const closeSheet = () => {
    setIsSheetOpen(false)
    setTimeout(() => setSelectedCampaign(null), 300)
  }

  const handleOpenModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setFormData({
        title: campaign.title,
        story: campaign.story,
        goal: campaign.goal,
        deadline: campaign.deadline,
        imageUrl: campaign.imageUrl,
        currency: campaign.currency || 'INR',
        category: campaign.category || 'scholarship',
        campaignType: campaign.campaignType || 'donation',
        featured: campaign.featured || false,
        urgent: campaign.urgent || false,
        allowAnonymous: campaign.allowAnonymous !== false,
        allowRecurring: campaign.allowRecurring !== false,
        showDonorList: campaign.showDonorList !== false,
      })
    } else {
      setEditingCampaign(null)
      setFormData({
        title: '',
        story: '',
        goal: '',
        deadline: '',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
        currency: 'INR',
        category: 'scholarship',
        campaignType: 'donation',
        featured: false,
        urgent: false,
        allowAnonymous: true,
        allowRecurring: true,
        showDonorList: true,
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...formData, goal: Number(formData.goal) }
    editingCampaign ? updateCampaign(editingCampaign.id, data) : addCampaign(data)
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this campaign?')) deleteCampaign(id)
  }

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'donors', label: 'Donor CRM', icon: Users },
  ]

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Campaign Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Create, monitor, and analyse fundraising campaigns.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={18} strokeWidth={3} /> New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-1">
        {TABS.map(({ id, label, icon: _Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors relative ${activeTab === id ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <_Icon size={15} /> {label}
            {activeTab === id && (
              <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-violet-600 rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Total Raised"
              value={`₹${totalRaised.toLocaleString()}`}
              sub={`${overallPct}% of all goals`}
              color="violet"
            />
            <StatCard
              icon={Users}
              label="Total Donors"
              value={totalDonors.toLocaleString()}
              sub="across all campaigns"
              color="blue"
            />
            <StatCard
              icon={Megaphone}
              label="Active Campaigns"
              value={activeCampaigns.length}
              sub={`${campaigns.filter((c) => c.status === 'completed').length} completed`}
              color="emerald"
            />
            <StatCard
              icon={Award}
              label="Avg Gift Size"
              value={`₹${avgGift.toLocaleString()}`}
              sub="from recorded donations"
              color="rose"
            />
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-violet-600" /> Overall Fundraising Progress
            </h2>
            <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-1000"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>₹{totalRaised.toLocaleString()} raised</span>
              <span>{overallPct}%</span>
              <span>₹{totalGoal.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Campaign-by-campaign table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Campaign Performance</h2>
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <Download size={12} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Campaign
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Goal
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Raised
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      %
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Donors/Participants
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...campaigns]
                    .sort((a, b) => b.raised - a.raised)
                    .map((c) => {
                      const pct = Math.min(100, Math.round((c.raised / c.goal) * 100))
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <div className="font-bold text-slate-900 truncate max-w-xs">
                              {c.title}
                            </div>
                            {c.category && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[c.category] || 'bg-slate-100 text-slate-500'}`}
                              >
                                {CATEGORY_LABELS[c.category]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right text-slate-600 font-semibold">
                            {c.campaignType === 'participation'
                              ? c.goal.toLocaleString()
                              : `₹${c.goal.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                            {c.campaignType === 'participation'
                              ? c.raised.toLocaleString()
                              : `₹${c.raised.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-violet-500' : 'bg-amber-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-600 w-10 text-right">
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                            {c.donorCount}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaigns Tab ── */}
      {activeTab === 'campaigns' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl outline-none font-medium text-slate-900 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Campaign
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Raised
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      %
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Donors/Participants
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                      Deadline
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => {
                    const pct = Math.min(100, Math.round((c.raised / c.goal) * 100))
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((new Date(c.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    )
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                              <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{c.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {c.category && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[c.category] || 'bg-slate-100 text-slate-500'}`}
                                  >
                                    {CATEGORY_LABELS[c.category]}
                                  </span>
                                )}
                                {c.urgent && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                                    Urgent
                                  </span>
                                )}
                                {c.featured && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center hidden sm:table-cell">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-extrabold text-slate-900 hidden md:table-cell">
                          {c.campaignType === 'participation'
                            ? c.raised.toLocaleString()
                            : `₹${c.raised.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-4 text-right hidden md:table-cell">
                          <span
                            className={`text-xs font-bold ${pct >= 100 ? 'text-emerald-600' : pct > 60 ? 'text-violet-600' : 'text-amber-600'}`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-slate-600 font-semibold hidden lg:table-cell">
                          {c.donorCount}
                        </td>
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <span className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                            <Clock size={11} /> {c.status === 'completed' ? 'Done' : `${daysLeft}d`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleCampaignClick(c)}
                              title="Preview"
                              className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenModal(c)}
                              title="Edit"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Delete"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredCampaigns.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <Megaphone size={36} className="mx-auto mb-3 text-slate-200" />
                <p className="font-bold text-slate-700">No campaigns match your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Donor CRM Tab ── */}
      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              {allDonors.length} donation records across all campaigns
            </p>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-slate-600 transition-colors">
              <Download size={13} /> Export
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Donor
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Campaign
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allDonors.map((d, i) => {
                    const initials = d.anonymous
                      ? '?'
                      : d.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                    const colors = [
                      'bg-violet-500',
                      'bg-blue-500',
                      'bg-emerald-500',
                      'bg-rose-500',
                      'bg-amber-500',
                    ]
                    const color = d.anonymous
                      ? 'bg-slate-400'
                      : colors[d.name.charCodeAt(0) % colors.length]
                    return (
                      <tr
                        key={i}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                            >
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800 truncate">
                              {d.anonymous ? 'Anonymous' : d.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-slate-500 text-xs truncate max-w-48 block font-medium">
                            {d.campaignTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                          {typeof d.amount === 'number'
                            ? `₹${d.amount.toLocaleString()}`
                            : d.amount}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400 font-medium hidden sm:table-cell">
                          {d.date}
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          {d.anonymous ? (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              anon
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                              public
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {allDonors.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-3 text-slate-200" />
                <p className="font-semibold text-slate-600">No donor records yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CampaignSheet isOpen={isSheetOpen} onClose={closeSheet} campaignId={selectedCampaign?.id} />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-[520px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <form id="campaign-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Campaign Title
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-medium bg-white"
                    placeholder="E.g., Alumni Scholarship Fund 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Campaign Story
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none resize-none text-sm font-medium bg-white"
                    placeholder="Describe the goals and impact..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={formData.campaignType}
                      onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 outline-none text-sm font-medium bg-white text-slate-700"
                    >
                      <option value="donation">Fundraising</option>
                      <option value="participation">Free Participation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 outline-none text-sm font-medium bg-white text-slate-700"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {formData.campaignType === 'participation'
                        ? 'Target Participants'
                        : 'Goal Amount (₹)'}
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-medium bg-white"
                      placeholder={formData.campaignType === 'participation' ? '100' : '50000'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deadline</label>
                    <input
                      required
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-medium bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-sm font-medium bg-white mb-3"
                    placeholder="https://..."
                  />
                  {formData.imageUrl && (
                    <div className="h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Flags */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Campaign Flags
                  </p>
                  {[
                    {
                      key: 'featured',
                      label: 'Featured',
                      sub: 'Show in featured section',
                      icon: Star,
                    },
                    {
                      key: 'urgent',
                      label: 'Mark as Urgent',
                      sub: 'Show urgent banner',
                      icon: Zap,
                    },
                    { key: 'allowAnonymous', label: 'Allow anonymous donations', sub: '' },
                    { key: 'allowRecurring', label: 'Allow recurring donations', sub: '' },
                    { key: 'showDonorList', label: 'Show public donor list', sub: '' },
                  ].map(({ key, label, sub, icon: _I }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setFormData((f) => ({ ...f, [key]: !f[key] }))}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${formData[key] ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}
                      >
                        {formData[key] && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{label}</p>
                        {sub && <p className="text-xs text-slate-400">{sub}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button
                form="campaign-form"
                type="submit"
                className="px-6 py-2.5 font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
              >
                {editingCampaign ? (
                  <>
                    <RefreshCw size={14} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Create Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
