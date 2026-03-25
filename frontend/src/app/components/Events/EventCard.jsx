import React from 'react'
import { Calendar, MapPin, Users, CheckCircle2, Ticket } from 'lucide-react'

const EventCard = ({ event, rsvpdEvents, onEventClick, isAdmin }) => {
  // Admin uses preview, users use normal flow
  const isRsvpd = rsvpdEvents ? rsvpdEvents.has(event.id) : false
  const isFree = event.price === 0 || !event.price
  const isSoldOut = event.capacity && event.attendees >= event.capacity

  // Safety check just in case date parsing fails gracefully
  let dateObj = new Date()
  try {
    dateObj = new Date(event.date)
  } catch {
    // Use current date if parsing fails
  }

  const monthStr = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj)
  const dayStr = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(dateObj)
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all flex flex-col h-full">
      {/* Banner */}
      <button
        onClick={onEventClick}
        className="relative h-36 sm:h-40 bg-slate-100 overflow-hidden shrink-0 block outline-none origin-center p-0 m-0 border-0 w-full text-left"
      >
        <img
          src={
            event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Date Stamp Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl py-1 px-2.5 shadow-sm text-center min-w-[2.5rem] transform group-hover:scale-105 transition-transform">
          <div className="text-[10px] font-bold uppercase text-red-500">{monthStr}</div>
          <div className="text-lg font-black text-slate-900 leading-none mt-0.5">{dayStr}</div>
        </div>

        {/* Price/Free Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {isFree ? (
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
              FREE
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
              <Ticket size={12} /> ₹{event.price}
            </span>
          )}

          {isSoldOut && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-bold tracking-wider rounded-lg shadow-sm uppercase">
              Sold Out
            </span>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 bg-white relative">
        <div className="flex items-center gap-2 mb-2">
          {event.category && (
            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider rounded border border-indigo-100">
              {event.category}
            </span>
          )}
          {event.type && (
            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200">
              {event.type}
            </span>
          )}
          {event.visibility === 'Private' && (
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-wider rounded border border-amber-200">
              Private
            </span>
          )}
        </div>

        <button onClick={onEventClick} className="text-left w-full">
          <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors leading-tight">
            {event.title}
          </h3>
        </button>

        <div className="space-y-1.5 mb-4 text-xs text-slate-600 flex-1">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-400 shrink-0" />
              <span>
                {event.attendees || 0} {event.attendees === 1 ? 'attendee' : 'attendees'}
              </span>
            </div>
            {event.capacity && (
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                {event.capacity - (event.attendees || 0)} Spots Left
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          {isAdmin ? (
            <div className="w-full py-1.5 flex gap-2">
              {/* Keep generic for manager to render buttons over top */}
              <button
                onClick={onEventClick}
                className="text-slate-400 font-medium text-xs flex-1 text-center bg-slate-50 hover:bg-slate-100 transition-colors rounded-lg py-1.5"
              >
                View Details
              </button>
            </div>
          ) : isRsvpd ? (
            <button
              onClick={onEventClick}
              className="w-full py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 border border-emerald-200 group/btn"
            >
              <CheckCircle2 size={16} className="text-emerald-500" /> You're Going
            </button>
          ) : (
            <button
              onClick={onEventClick}
              className={`w-full py-2 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                isSoldOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {isSoldOut ? 'Join Waitlist' : 'View Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard
