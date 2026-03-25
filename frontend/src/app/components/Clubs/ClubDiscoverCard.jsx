import React from 'react'
import { Users, Lock, Globe, Zap, Clock, CheckCircle, Hourglass } from 'lucide-react'

const CATEGORY_COLORS = {
  Technology: 'bg-blue-600',
  Business: 'bg-emerald-600',
  Geography: 'bg-purple-600',
  'Class Year': 'bg-amber-600',
  Department: 'bg-rose-600',
  Interest: 'bg-indigo-600',
  Default: 'bg-slate-600',
}

const ClubDiscoverCard = ({ group, onView, isJoined, isPending, onJoin, onCancelRequest }) => {
  const catColor = CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Default

  const handleBtnClick = (e) => {
    e.stopPropagation()
    if (isPending) {
      onCancelRequest?.(group.id)
      return
    }
    if (isJoined) {
      onView(group.id)
      return
    }
    onJoin?.(group.id)
  }

  const btnConfig = isJoined
    ? {
        label: 'View Group',
        icon: <CheckCircle size={14} />,
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      }
    : isPending
      ? {
          label: 'Requested',
          icon: <Hourglass size={14} />,
          cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200',
        }
      : group.isPrivate
        ? {
            label: 'Request to Join',
            icon: <Lock size={14} />,
            cls: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
          }
        : {
            label: 'Join Group',
            icon: <Users size={14} />,
            cls: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
          }

  return (
    <div
      onClick={() => onView(group.id)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full hover:border-indigo-200 hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative h-36 bg-slate-100 w-full overflow-hidden shrink-0">
        <img
          src={group.coverPhoto}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          {group.isPrivate ? (
            <div className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
              <Lock size={11} /> Private
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
              <Globe size={11} className="text-emerald-600" /> Public
            </div>
          )}
        </div>

        {/* Status badge */}
        {group.status === 'pending' && (
          <div className="absolute top-3 left-3">
            <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
              <Clock size={11} /> Awaiting Approval
            </div>
          </div>
        )}

        {/* Bottom chips */}
        <div className="absolute bottom-3 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm border border-white/40">
            {group.type}
          </span>
          <span
            className={`${catColor}/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm`}
          >
            {group.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col min-w-0">
        <h3 className="text-base font-black text-slate-900 leading-tight mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {group.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {group.description}
        </p>

        {/* Tags */}
        {group.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {group.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {(group.memberAvatars || []).slice(0, 4).map((av, i) => (
                <img
                  key={i}
                  src={av}
                  alt=""
                  className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              <span className="text-slate-900">{group.membersCount.toLocaleString()}</span> members
            </span>
          </div>
          <button
            onClick={handleBtnClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${btnConfig.cls}`}
          >
            {btnConfig.icon}
            {btnConfig.label}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClubDiscoverCard
