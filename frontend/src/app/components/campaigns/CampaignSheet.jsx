import React, { useState, useEffect } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { ProgressBar } from './ProgressBar'
import {
  X,
  Clock,
  Users,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  EyeOff,
  BookOpen,
  Zap,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORY_COLORS = {
  scholarship: 'bg-blue-100 text-blue-700',
  infrastructure: 'bg-amber-100 text-amber-700',
  emergency: 'bg-rose-100 text-rose-700',
  research: 'bg-purple-100 text-purple-700',
  health: 'bg-emerald-100 text-emerald-700',
  sports: 'bg-orange-100 text-orange-700',
  events: 'bg-teal-100 text-teal-700',
}
const CATEGORY_LABELS = {
  scholarship: 'Scholarship',
  infrastructure: 'Infrastructure',
  emergency: 'Crisis Relief',
  research: 'Research',
  health: 'Health',
  sports: 'Sports',
  events: 'Events',
}

export const CampaignSheet = ({ isOpen, onClose, campaignId }) => {
  const { getCampaignById, donateToCampaign, participateInCampaign } = useCampaigns()
  const [isVisible, setIsVisible] = useState(false)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [donorName, setDonorName] = useState('You')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('monthly')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tab, setTab] = useState('about') // 'about' | 'donate'

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsVisible(true)
        setIsSuccess(false)
        setPledgeAmount('')
        setIsAnonymous(false)
        setIsRecurring(false)
        setTab('about')
      }, 0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  const campaign = getCampaignById(campaignId)
  if (!campaign) return null

  const {
    id,
    title,
    story,
    longStory,
    raised,
    goal,
    donorCount,
    imageUrl,
    deadline,
    category,
    featured,
    urgent,
    impactExamples,
    recentDonors,
    allowAnonymous,
    allowRecurring,
    showDonorList,
    status,
    campaignType,
  } = campaign

  const isCompleted = status === 'completed'
  const isParticipation = campaignType === 'participation'
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  const pct = Math.min(100, Math.round((raised / goal) * 100))

  const PRESET_AMOUNTS =
    impactExamples?.length > 0
      ? impactExamples.slice(0, 4).map((e) => e.amount)
      : [250, 500, 1000, 2000]

  const handlePledge = (e) => {
    e.preventDefault()
    if (isParticipation) {
      participateInCampaign(id, { participantName: isAnonymous ? 'Anonymous' : donorName })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 4500)
    } else if (Number(pledgeAmount) > 0) {
      donateToCampaign(id, Number(pledgeAmount), {
        donorName: isAnonymous ? 'Anonymous' : donorName,
        anonymous: isAnonymous,
        recurring: isRecurring && allowRecurring,
        frequency: isRecurring ? recurringFreq : null,
      })
      setIsSuccess(true)
      setPledgeAmount('')
      setTimeout(() => setIsSuccess(false), 4500)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-[520px] bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
        >
          <X size={18} />
        </button>

        {/* Hero */}
        <div className="relative h-52 sm:h-64 shrink-0 bg-slate-100">
          <img
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover ${isCompleted ? 'grayscale' : ''}`}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            {urgent && !isCompleted && (
              <span className="flex items-center gap-1 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Zap size={10} className="fill-white" /> Urgent
              </span>
            )}
            {featured && !urgent && !isCompleted && (
              <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Star size={10} className="fill-white" /> Featured
              </span>
            )}
            {category && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 ${CATEGORY_COLORS[category] || ''}`}
              >
                {CATEGORY_LABELS[category] || category}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight drop-shadow-md mb-1">
              {title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
              <span className="flex items-center gap-1">
                <Users size={12} /> {donorCount.toLocaleString()}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={12} /> {pct}% funded
              </span>
              {!isCompleted && (
                <span>
                  · <Clock size={12} className="inline" /> {daysLeft}d left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-slate-200 bg-white">
          <button
            onClick={() => setTab('about')}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${tab === 'about' ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            About
            {tab === 'about' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600" />
            )}
          </button>
          {!isCompleted && (
            <button
              onClick={() => setTab('donate')}
              className={`flex-1 py-3 text-sm font-bold transition-colors relative ${tab === 'donate' ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {isParticipation ? 'Participate' : 'Donate'}
              {tab === 'donate' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600" />
              )}
            </button>
          )}
          {showDonorList && recentDonors?.length > 0 && (
            <button
              onClick={() => setTab('donors')}
              className={`flex-1 py-3 text-sm font-bold transition-colors relative ${tab === 'donors' ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {isParticipation ? 'Participants' : 'Donors'}
              {tab === 'donors' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600" />
              )}
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* About Tab */}
          {tab === 'about' && (
            <div className="p-5 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100">
                <ProgressBar current={raised} goal={goal} isParticipation={isParticipation} />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium px-1">
                  <span>
                    {isParticipation
                      ? `${raised.toLocaleString()} joined`
                      : `₹${raised.toLocaleString()} raised`}
                  </span>
                  <span>
                    of{' '}
                    {isParticipation
                      ? `${goal.toLocaleString()} spots`
                      : `₹${goal.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                {(longStory || story || '')
                  .split('\n')
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((para, i) => (
                    <p key={i}>{para.replace(/^[•-]\s*/, '')}</p>
                  ))}
              </div>

              {impactExamples?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Your Impact
                  </p>
                  <div className="space-y-2">
                    {impactExamples.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3 border border-violet-100"
                      >
                        <span className="text-xs font-extrabold text-violet-700 w-14 shrink-0">
                          ₹{ex.amount >= 1000 ? `${ex.amount / 1000}K` : ex.amount}
                        </span>
                        <p className="text-xs text-slate-600 font-medium">{ex.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/campaigns/${id}`}
                className="flex items-center gap-2 text-violet-600 hover:text-violet-800 font-semibold text-sm"
                onClick={onClose}
              >
                <BookOpen size={14} /> Read full campaign story <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Donate Tab */}
          {tab === 'donate' && !isCompleted && (
            <div className="p-5">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 mb-1">Thank You!</p>
                    <p className="text-slate-600 text-sm">Your contribution has been recorded.</p>
                    {isRecurring && allowRecurring && (
                      <p className="text-xs text-violet-600 font-semibold mt-2 bg-violet-50 px-3 py-1.5 rounded-full inline-block">
                        Recurring {recurringFreq} donation set up
                      </p>
                    )}
                  </div>
                  <Link
                    to="/giving"
                    onClick={onClose}
                    className="text-sm text-violet-600 underline font-semibold"
                  >
                    View in My Giving →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handlePledge} className="space-y-5">
                  {!isParticipation && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        Quick Select
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {PRESET_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPledgeAmount(amt)}
                            className={`py-3 rounded-xl text-sm font-extrabold border-2 transition-all ${Number(pledgeAmount) === amt ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}
                          >
                            ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                            {impactExamples?.find((e) => e.amount === amt) && (
                              <span className="block text-[10px] font-medium opacity-60 truncate px-1">
                                {impactExamples.find((e) => e.amount === amt).impact.slice(0, 28)}…
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          required={!isParticipation}
                          value={pledgeAmount}
                          onChange={(e) => setPledgeAmount(e.target.value)}
                          placeholder="Custom amount"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  {!isAnonymous && (
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your name (shown publicly)"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none text-sm font-medium text-slate-700"
                    />
                  )}

                  {/* Options */}
                  {!isParticipation && (
                    <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                        Options
                      </p>
                      {allowAnonymous && (
                        <label
                          className="flex items-start gap-3 cursor-pointer"
                          onClick={() => setIsAnonymous(!isAnonymous)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${isAnonymous ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}
                          >
                            {isAnonymous && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                              <EyeOff size={13} /> Donate anonymously
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Your name won't appear in the donor list
                            </p>
                          </div>
                        </label>
                      )}
                      {allowRecurring && (
                        <div>
                          <label
                            className="flex items-start gap-3 cursor-pointer"
                            onClick={() => setIsRecurring(!isRecurring)}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${isRecurring ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}
                            >
                              {isRecurring && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                <RefreshCw size={13} /> Make this recurring
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Automatically donate every period
                              </p>
                            </div>
                          </label>
                          {isRecurring && (
                            <select
                              value={recurringFreq}
                              onChange={(e) => setRecurringFreq(e.target.value)}
                              className="ml-8 mt-2 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 font-semibold bg-white outline-none"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-violet-600 text-white font-extrabold py-4 rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                  >
                    <HeartHandshake size={18} />
                    {isParticipation
                      ? 'Confirm Participation'
                      : `Contribute ${pledgeAmount ? `₹${Number(pledgeAmount).toLocaleString()}` : 'Now'}`}
                    {isRecurring && (
                      <span className="text-violet-200 text-xs font-medium">/{recurringFreq}</span>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                    Mock portal — no real transactions.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* Donors Tab */}
          {tab === 'donors' && (
            <div className="p-5">
              {recentDonors?.length > 0 ? (
                <div className="space-y-3">
                  {recentDonors.map((donor, i) => {
                    const initials = donor.anonymous
                      ? '?'
                      : donor.name
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
                    const color = donor.anonymous
                      ? 'bg-slate-400'
                      : colors[donor.name.charCodeAt(0) % colors.length]
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {donor.anonymous ? 'Anonymous Donor' : donor.name}
                          </p>
                          <p className="text-xs text-slate-400">{donor.date}</p>
                        </div>
                        <p className="text-sm font-extrabold text-violet-700">
                          {isParticipation ? donor.amount : `₹${donor.amount.toLocaleString()}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <HeartHandshake size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold">
                    {isParticipation ? 'Be the first to join!' : 'Be the first to donate!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA — only shown on About tab when not completed */}
        {tab === 'about' && !isCompleted && (
          <div className="shrink-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.04)]">
            <button
              onClick={() => setTab('donate')}
              className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <HeartHandshake size={18} />{' '}
              {isParticipation ? 'Register Now' : 'Contribute to Campaign'}{' '}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
