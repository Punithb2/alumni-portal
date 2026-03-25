import React from 'react'
import { ProgressBar } from './ProgressBar'
import { Clock, Users, ArrowRight, Edit, Trash2, Zap, Star, CheckCircle2 } from 'lucide-react'

const CATEGORY_LABELS = {
  scholarship: 'Scholarship',
  infrastructure: 'Infrastructure',
  emergency: 'Emergency',
  research: 'Research',
  health: 'Health',
  sports: 'Sports',
  event: 'Events',
}
const CATEGORY_COLORS = {
  scholarship: 'bg-violet-50 text-violet-700 border-violet-200',
  infrastructure: 'bg-blue-50 text-blue-700 border-blue-200',
  emergency: 'bg-rose-50 text-rose-700 border-rose-200',
  research: 'bg-amber-50 text-amber-700 border-amber-200',
  health: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sports: 'bg-orange-50 text-orange-700 border-orange-200',
  event: 'bg-teal-50 text-teal-700 border-teal-200',
}

export const CampaignCard = ({ campaign, isAdmin = false, onEdit, onDelete, onCampaignClick }) => {
  const {
    title,
    story,
    raised,
    goal,
    donorCount,
    imageUrl,
    deadline,
    featured,
    urgent,
    category,
    status,
    campaignType,
  } = campaign

  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  const isCompleted = status === 'completed'
  const isParticipation = campaignType === 'participation'

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full hover:-translate-y-1 duration-300 ${urgent ? 'border-rose-300' : isCompleted ? 'border-slate-200' : 'border-slate-200'}`}
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${isCompleted ? 'grayscale' : ''}`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Ribbons */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {urgent && (
            <span className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
              <Zap size={10} className="fill-white" /> Urgent
            </span>
          )}
          {featured && !urgent && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
              <Star size={10} className="fill-white" /> Featured
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
              <CheckCircle2 size={10} /> Goal Reached
            </span>
          )}
        </div>

        {/* Days Left */}
        {!isCompleted && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
            <Clock size={12} className="text-violet-600" />
            {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
          </div>
        )}

        {isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(campaign)
              }}
              className="bg-white/90 p-1.5 text-slate-700 hover:text-violet-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(campaign.id)
              }}
              className="bg-white/90 p-1.5 text-slate-700 hover:text-rose-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 bg-white">
        {category && (
          <span
            className={`self-start text-[10px] font-bold px-2 py-0.5 rounded border mb-2 ${CATEGORY_COLORS[category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
          >
            {CATEGORY_LABELS[category] || category}
          </span>
        )}
        <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-violet-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{story}</p>

        <div className="mb-4">
          {isParticipation ? (
            <ProgressBar current={raised} goal={goal} isParticipation={true} />
          ) : (
            <ProgressBar current={raised} goal={goal} />
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
            <Users size={13} className="text-slate-400" />
            {donorCount.toLocaleString()} {isParticipation ? 'participants' : 'donors'}
          </div>
          {!isAdmin ? (
            <button
              onClick={() => onCampaignClick(campaign)}
              className={`text-sm font-bold flex items-center gap-1 transition-colors group/btn ${isCompleted ? 'text-slate-400 cursor-default' : 'text-violet-600 hover:text-violet-800'}`}
            >
              {isCompleted ? 'View Story' : isParticipation ? 'Join Now' : 'Donate'}
              <ArrowRight
                size={14}
                className="transform group-hover/btn:translate-x-1 transition-transform"
              />
            </button>
          ) : (
            <button
              onClick={() => onCampaignClick(campaign)}
              className="text-slate-500 font-medium text-xs hover:text-slate-800 transition-colors underline underline-offset-2"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
