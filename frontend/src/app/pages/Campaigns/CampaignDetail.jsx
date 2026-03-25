import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useGamification } from '../../hooks/useGamification'
import { BADGES } from '../../data/gamification'
import { ProgressBar } from '../../components/campaigns/ProgressBar'
import {
  ArrowLeft,
  Clock,
  Users,
  HeartHandshake,
  CheckCircle2,
  Zap,
  Star,
  Share2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
} from 'lucide-react'

const CATEGORY_LABELS = {
  scholarship: 'Scholarship',
  infrastructure: 'Infrastructure',
  emergency: 'Crisis Relief',
  research: 'Research',
  health: 'Health',
  sports: 'Sports',
  event: 'Events',
}
const CATEGORY_COLORS = {
  scholarship: 'bg-blue-100 text-blue-700',
  infrastructure: 'bg-amber-100 text-amber-700',
  emergency: 'bg-rose-100 text-rose-700',
  research: 'bg-purple-100 text-purple-700',
  health: 'bg-emerald-100 text-emerald-700',
  sports: 'bg-orange-100 text-orange-700',
  event: 'bg-teal-100 text-teal-700',
}

function DonorAvatar({ name, amount, date, anonymous, isParticipation = false }) {
  const initials = anonymous
    ? '?'
    : name
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
    'bg-indigo-500',
  ]
  const color = anonymous ? 'bg-slate-400' : colors[name.charCodeAt(0) % colors.length]
  const daysAgo = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">
          {anonymous ? 'Anonymous Donor' : name}
        </p>
        <p className="text-xs text-slate-400">{timeLabel}</p>
      </div>
      <div className="text-sm font-extrabold text-violet-700 shrink-0">
        {isParticipation ? amount : `₹${amount.toLocaleString()}`}
      </div>
    </div>
  )
}

export default function CampaignDetail() {
  const { id } = useParams()
  const { getCampaignById, donateToCampaign, participateInCampaign } = useCampaigns()
  const { awardPoints } = useGamification()
  const campaign = getCampaignById(id)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('monthly')
  const [isSuccess, setIsSuccess] = useState(false)
  const [donorName, setDonorName] = useState('You')

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Campaign Not Found</h2>
        <Link
          to="/campaigns"
          className="text-violet-600 hover:text-violet-700 font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
      </div>
    )
  }

  const {
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
  const pct = Math.min(100, Math.round((raised / goal) * 100))
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))

  const PRESET_AMOUNTS =
    impactExamples?.length > 0
      ? impactExamples.slice(0, 4).map((e) => e.amount)
      : [250, 500, 1000, 2000]

  const handlePledge = (e) => {
    e.preventDefault()

    if (isParticipation) {
      participateInCampaign(id, { participantName: isAnonymous ? 'Anonymous' : donorName })
      awardPoints(50, 'Participated in Campaign', BADGES.CONNECTOR.id)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 4000)
    } else if (Number(pledgeAmount) > 0) {
      donateToCampaign(id, Number(pledgeAmount), {
        donorName: isAnonymous ? 'Anonymous' : donorName,
        anonymous: isAnonymous,
        recurring: isRecurring && allowRecurring,
        frequency: isRecurring ? recurringFreq : null,
      })
      awardPoints(100, 'Donated to Campaign', BADGES.PHILANTHROPIST.id)
      setIsSuccess(true)
      setPledgeAmount('')
      setTimeout(() => setIsSuccess(false), 4000)
    }
  }

  const storyParas = (longStory || story || '').split('\n').filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors"
        >
          <Share2 size={15} /> Share
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content ─────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <div className="rounded-3xl overflow-hidden bg-slate-100 relative h-72 sm:h-[400px] shadow-md border border-slate-200">
            <img
              src={imageUrl}
              alt={title}
              className={`w-full h-full object-cover ${isCompleted ? 'grayscale' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent pointer-events-none" />

            {/* Status ribbons */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {urgent && !isCompleted && (
                <span className="flex items-center gap-1 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  <Zap size={11} className="fill-white" /> Urgent
                </span>
              )}
              {featured && !urgent && !isCompleted && (
                <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  <Star size={11} className="fill-white" /> Featured
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  <CheckCircle2 size={11} /> Goal Reached
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              {category && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full shadow ${CATEGORY_COLORS[category] || 'bg-slate-200 text-slate-700'} bg-white/95 backdrop-blur`}
                >
                  {CATEGORY_LABELS[category] || category}
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-md mb-2">
                {title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {donorCount.toLocaleString()} supporters
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={14} /> {pct}% funded
                </span>
                {!isCompleted && (
                  <span>
                    · <Clock size={14} className="inline" />{' '}
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Impact Examples */}
          {impactExamples && impactExamples.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> Your Contribution Makes This
                Happen
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {impactExamples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                      <span className="text-sm font-extrabold text-violet-700">
                        ₹{ex.amount >= 1000 ? `${ex.amount / 1000}K` : ex.amount}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {ex.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Story */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-violet-500" /> About This Campaign
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
              {storyParas.map((para, i) => {
                if (para.startsWith('•') || para.startsWith('-')) {
                  return (
                    <p key={i} className="pl-4 border-l-2 border-violet-200 text-slate-600">
                      {para.replace(/^[•-]\s*/, '')}
                    </p>
                  )
                }
                return <p key={i}>{para}</p>
              })}
            </div>

            <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">
              <h3 className="text-base font-extrabold text-violet-900 mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-violet-600" /> Why Every Contribution Matters
              </h3>
              <p className="text-sm text-violet-700 leading-relaxed">
                Education is the single most powerful tool for social mobility. By supporting this
                campaign, you are joining a dedicated community of alumni, friends, and partners who
                believe in the power of giving back — and in building a stronger legacy for
                generations to come.
              </p>
            </div>
          </div>

          {/* Recent Donors */}
          {showDonorList && recentDonors && recentDonors.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <HeartHandshake size={18} className="text-rose-500" />{' '}
                {isParticipation ? 'Recent Participants' : 'Recent Supporters'}
                <span className="ml-auto text-sm font-semibold text-slate-400">
                  {recentDonors.length} shown
                </span>
              </h2>
              <div>
                {recentDonors.map((donor, i) => (
                  <DonorAvatar key={i} {...donor} isParticipation={isParticipation} />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                {isParticipation
                  ? 'Participants who chose to remain anonymous are displayed as "Anonymous Participant".'
                  : 'Donors who chose to remain anonymous are displayed as "Anonymous Donor".'}
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky Sidebar ─────────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            {/* Progress */}
            <div className="mb-6">
              <ProgressBar current={raised} goal={goal} isParticipation={isParticipation} />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xl font-extrabold text-slate-900">{pct}%</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                    {isParticipation ? 'Joined' : 'Funded'}
                  </p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xl font-extrabold text-slate-900">{donorCount}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                    {isParticipation ? 'Participants' : 'Donors'}
                  </p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xl font-extrabold text-slate-900">
                    {isCompleted ? '✓' : daysLeft}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                    {isCompleted ? 'Done' : 'Days'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>
                  {isParticipation
                    ? `${raised.toLocaleString()} joined`
                    : `₹${raised.toLocaleString()} raised`}
                </span>
                <span>
                  of{' '}
                  {isParticipation ? `${goal.toLocaleString()} spots` : `₹${goal.toLocaleString()}`}
                </span>
              </div>
            </div>

            {isCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-800">Goal Reached!</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {isParticipation
                    ? `This event is fully booked. Thank you to all ${donorCount} participants!`
                    : `This campaign has been fully funded. Thank you to all ${donorCount} donors!`}
                </p>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <HeartHandshake size={16} className="text-violet-600" />{' '}
                  {isParticipation ? 'Join the Cause' : 'Make a Contribution'}
                </h3>

                {isSuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl flex flex-col items-center gap-3 border border-emerald-200 text-center">
                    <CheckCircle2 size={36} className="text-emerald-500" />
                    <div>
                      <p className="font-extrabold text-lg">Thank you!</p>
                      <p className="text-sm mt-1">
                        Your contribution has been recorded. Check{' '}
                        <Link to="/giving" className="underline font-semibold">
                          My Giving
                        </Link>{' '}
                        for details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePledge} className="space-y-4">
                    {/* Preset amounts */}
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
                            className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${Number(pledgeAmount) === amt ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}
                          >
                            ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={pledgeAmount}
                          onChange={(e) => setPledgeAmount(e.target.value)}
                          placeholder="Custom amount"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </div>

                    {/* Donor name */}
                    {!isAnonymous && (
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none text-sm font-medium text-slate-700"
                      />
                    )}

                    {/* Options */}
                    <div className="space-y-2">
                      {allowAnonymous && (
                        <label className="flex items-center gap-3 cursor-pointer select-none group">
                          <div
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAnonymous ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white'}`}
                          >
                            {isAnonymous && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                              <EyeOff size={13} /> Donate anonymously
                            </p>
                            <p className="text-xs text-slate-400">
                              Your name won't appear in donor list
                            </p>
                          </div>
                        </label>
                      )}
                      {allowRecurring && (
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div
                            onClick={() => setIsRecurring(!isRecurring)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isRecurring ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white'}`}
                          >
                            {isRecurring && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                              <RefreshCw size={13} /> Make this recurring
                            </p>
                            {isRecurring && (
                              <select
                                value={recurringFreq}
                                onChange={(e) => setRecurringFreq(e.target.value)}
                                className="mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 font-medium bg-white outline-none"
                              >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                            )}
                          </div>
                        </label>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
                    >
                      {isRecurring && allowRecurring ? (
                        <RefreshCw size={16} />
                      ) : (
                        <HeartHandshake size={16} />
                      )}
                      {isParticipation
                        ? 'Confirm Participation'
                        : `Contribute ${pledgeAmount ? `₹${Number(pledgeAmount).toLocaleString()}` : 'Now'}`}
                      {isRecurring && allowRecurring && (
                        <span className="text-violet-200 font-medium text-xs">
                          /{recurringFreq}
                        </span>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                      Mock portal — no real transactions. By contributing you agree to our Terms.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Share Card */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-6 border border-violet-100 shadow-sm">
            <h3 className="font-extrabold text-slate-800 mb-2 flex items-center gap-2">
              <Award size={16} className="text-violet-600" /> Spread the Word
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Share this campaign with friends and family to help reach the goal faster.
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="w-full flex items-center justify-center gap-2 bg-white text-violet-700 font-bold py-3 rounded-xl border-2 border-violet-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all text-sm"
            >
              <Share2 size={15} /> Copy Campaign Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
