import React from 'react'

export const ProgressBar = ({ current, goal, className = '', isParticipation = false }) => {
  const safeCurrent = Number.isFinite(Number(current)) ? Number(current) : 0
  const safeGoal = Number.isFinite(Number(goal)) ? Number(goal) : 0
  const percentage = safeGoal > 0 ? Math.min(100, Math.round((safeCurrent / safeGoal) * 100)) : 0

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-end text-sm mb-1.5 font-medium">
        <span className="text-violet-700 font-bold text-base leading-none">{percentage}%</span>
        {safeGoal > 0 && (
          <span className="text-slate-500 text-xs leading-none">
            {isParticipation
              ? `${safeCurrent.toLocaleString()} / ${safeGoal.toLocaleString()}`
              : `₹${safeCurrent.toLocaleString()} / ₹${safeGoal.toLocaleString()}`}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className="bg-violet-600 h-2 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className="absolute top-0 right-0 bottom-0 bg-white/20 w-4 overlay-slide" />
          )}
        </div>
      </div>
      <style>{`
        @keyframes slide {
          from { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          to { transform: translateX(200%); opacity: 0; }
        }
        .overlay-slide {
          animation: slide 2s infinite linear;
        }
      `}</style>
    </div>
  )
}
