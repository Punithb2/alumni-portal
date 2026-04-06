import React, { useState, useMemo } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { Link } from 'react-router-dom'
import {
  HeartHandshake,
  TrendingUp,
  Gift,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Download,
  X,
  Star,
  ChevronRight,
  Award,
  Sparkles,
} from 'lucide-react'

const STATUS_COLORS = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const getValidDate = (value) => {
  const nextDate = value ? new Date(value) : null
  return nextDate && !Number.isNaN(nextDate.getTime()) ? nextDate : null
}

const formatDate = (value, options) => {
  const nextDate = getValidDate(value)
  return nextDate ? nextDate.toLocaleDateString('en-IN', options) : 'Unknown date'
}

const formatExportDate = (value) => {
  const nextDate = getValidDate(value)
  if (!nextDate) return 'Unknown date'

  const year = nextDate.getFullYear()
  const month = String(nextDate.getMonth() + 1).padStart(2, '0')
  const day = String(nextDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function MyGiving() {
  const { myDonations, cancelRecurring, loading, error } = useCampaigns()
  const [yearFilter, setYearFilter] = useState('all')
  const [exportError, setExportError] = useState('')

  const years = useMemo(() => {
    return [
      ...new Set(
        myDonations
          .map((d) => getValidDate(d.date)?.getFullYear())
          .filter((year) => Number.isFinite(year))
      ),
    ].sort((a, b) => b - a)
  }, [myDonations])

  const filtered = useMemo(() => {
    if (yearFilter === 'all') return myDonations
    return myDonations.filter((d) => getValidDate(d.date)?.getFullYear() === Number(yearFilter))
  }, [myDonations, yearFilter])

  const totalDonated = myDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const campaignsSupported = new Set(
    myDonations.map((d) => d.campaignId).filter((campaignId) => campaignId !== null)
  ).size
  const recurringDonations = myDonations.filter(
    (d) => d.recurring && d.status !== 'cancelled'
  )
  const yearTotal = filtered.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  const handleCancel = (donationId) => {
    if (window.confirm('Cancel this recurring donation? This cannot be undone.')) {
      cancelRecurring(donationId)
    }
  }

  const handleExport = () => {
    if (filtered.length === 0) {
      setExportError('No donations to export for this selection.')
      return
    }
    setExportError('')

    // CSV Header
    const headers = ['Date', 'Campaign', 'Amount', 'Status', 'Frequency', 'Anonymous'].join(',')

    // CSV Rows
    const rows = filtered.map((d) => {
      const date = `="${formatExportDate(d.date)}"`
      const title = `"${String(d.campaignTitle || 'Campaign').replace(/"/g, '""')}"`
      const amount = d.amount
      const status = d.status
      const freq = d.recurring ? d.frequency || 'monthly' : 'one-time'
      const anon = d.anonymous ? 'yes' : 'no'

      return [date, title, amount, status, freq, anon].join(',')
    })

    // Combine and create blob
    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `donation_history_${yearFilter}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            My Giving
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed">
            Track your contributions, manage recurring donations, and review your overall
            philanthropic impact in one place.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/campaigns"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <HeartHandshake size={16} /> Support a Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          {loading && (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              Loading your donation history...
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {exportError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {exportError}
            </div>
          )}
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Lifetime
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(totalDonated)}
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Gift size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Campaigns
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {campaignsSupported}
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw size={20} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Active Recurring
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {recurringDonations.length}
              </p>
            </div>
          </div>

          {/* Donation History Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-5 md:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                <Calendar size={18} className="text-slate-500" /> Payment History
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white hover:bg-slate-50 transition-colors outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake size={28} />
                </div>
                <p className="text-lg font-bold text-slate-800 mb-1">No donations yet</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Your giving history will appear here once you make your first contribution.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <div
                    key={d.id}
                    className="p-5 md:px-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${d.recurring && d.status !== 'cancelled' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {d.recurring && d.status !== 'cancelled' ? (
                        <RefreshCw size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/campaigns/${d.campaignId}`}
                          className="text-base font-bold text-slate-900 group-hover:text-violet-600 truncate block transition-colors"
                      >
                        {d.campaignTitle || 'Campaign'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 -ml-1 text-sm">
                        <span className="text-slate-500 px-1">
                          {formatDate(d.date, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {d.recurring && d.status !== 'cancelled' && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold bg-violet-100/50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-200/50">
                            {d.frequency || 'monthly'}
                          </span>
                        )}
                        {d.anonymous && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                            Anon
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <p className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {formatCurrency(d.amount)}
                      </p>
                      <span
                        className={`text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md ${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-500'}`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <div className="hidden sm:flex shrink-0 ml-4 items-center">
                      <button
                        onClick={() => {
                          const content = `Receipt for Donation\n\nCampaign: ${d.campaignTitle || 'Campaign'}\nAmount: INR ${d.amount}\nDate: ${formatDate(d.date)}\nStatus: ${d.status}\nFrequency: ${d.recurring ? d.frequency || 'monthly' : 'One-time'}`
                          const blob = new Blob([content], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.setAttribute('download', `receipt_${d.id}.txt`)
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-colors"
                        title="Download Receipt"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length > 0 && yearFilter !== 'all' && (
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  Totals for {yearFilter}
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatCurrency(yearTotal)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right/Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Badge Callout */}
          {totalDonated >= 1000 ? (
            <div className="bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center p-3 mb-4 ring-4 ring-white/10 shadow-lg backdrop-blur-sm">
                  <Award size={32} className="text-white drop-shadow-md" />
                </div>
                <h3 className="text-xl font-extrabold mb-1">Philanthropist</h3>
                <p className="text-sm text-orange-50 font-medium mb-3">Top donor community</p>
                <div className="w-full bg-black/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-orange-100 font-semibold mb-1 uppercase tracking-wider">
                    Total Impact
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight">
                    {formatCurrency(totalDonated)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Philanthropist Status</h3>
                <p className="text-xs text-slate-500 mt-0.5">Donate ₹1,000+ to unlock</p>
              </div>
            </div>
          )}

          {/* Active Recurring Box */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 md:p-6">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <RefreshCw size={16} className="text-violet-600" /> My Subscriptions
              <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {recurringDonations.length}
              </span>
            </h3>

            {recurringDonations.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 font-medium">No active recurring gifts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringDonations.map((d) => (
                  <div
                    key={d.id}
                    className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 pr-6">
                        {d.campaignTitle || 'Campaign'}
                      </p>
                      <button
                        onClick={() => handleCancel(d.id)}
                        title="Cancel"
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-extrabold text-violet-700 tracking-tight">
                        {formatCurrency(d.amount)}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold mb-1">
                        / {d.frequency || 'month'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-3 bg-slate-50 inline-block px-2 py-1 rounded">
                      Active since{' '}
                      {formatDate(d.date, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
