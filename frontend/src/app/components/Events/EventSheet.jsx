import React, { useEffect, useState } from 'react'
import { X, Calendar, MapPin, Users, Ticket, CheckCircle2, MoreVertical } from 'lucide-react'
import clsx from 'clsx'
import { useEvents } from '../../hooks/useEvents'
import useAuth from '../../hooks/useAuth'

export default function EventSheet({ event, isOpen, onClose }) {
  const { registerUser } = useEvents()
  const { user } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPaymentAlert, setShowPaymentAlert] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      setTimeout(() => {
        setIsSuccess(false)
        setShowPaymentAlert(false)
      }, 0)
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen && !event) return null
  if (!event) return null

  const isFree = event.price === 0 || !event.price
  const isSoldOut = event.capacity && event.attendees >= event.capacity
  const currentUser = user || { id: 'u1', name: 'Demo Alumni' }
  const hasRegistered = event.registeredUsers?.some((u) => u.id === currentUser.id)

  let dateObj = new Date()
  try {
    dateObj = new Date(event.date)
  } catch {
    // Ignore
  }

  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj)

  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)

  const handleRegister = () => {
    if (!isFree) {
      setShowPaymentAlert(true)
      setTimeout(() => setShowPaymentAlert(false), 3000)
      return
    }
    registerUser(event.id, currentUser)
    setIsSuccess(true)
    setTimeout(() => {
      // Optional: you can close the sheet or just leave the success state
      // onClose();
    }, 3000)
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex justify-end bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Sheet Container */}
      <div
        className={clsx(
          'w-full max-w-[500px] bg-slate-50 h-full overflow-y-auto flex flex-col shadow-2xl transform transition-transform duration-500 ease-out relative',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header Navigation */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors font-medium text-sm"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="space-y-6">
            <div className="h-64 sm:h-80 bg-slate-100 relative overflow-hidden shrink-0">
              <img
                src={
                  event.image ||
                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
                }
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 flex gap-2">
                {event.category && (
                  <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm uppercase tracking-wider">
                    {event.category}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 md:px-8 space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{dateStr}</p>
                    <p className="text-sm text-slate-500 font-medium">{timeStr}</p>
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{event.location}</p>
                    <p className="text-sm text-slate-500 font-medium">{event.type || 'Location'}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none prose-p:leading-relaxed text-slate-600 text-sm md:text-base">
                <h3 className="text-lg font-bold text-slate-900 mb-3">About this event</h3>
                <p>{event.description}</p>
                <p>
                  Join us for an incredible gathering designed to connect, inspire, and foster
                  lifelong relationships among our vibrant alumni community. This event features
                  expert panels, dedicated networking sessions, and opportunities to meaningfully
                  engage with your peers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:mb-0 mb-2 w-full sm:w-auto">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {isFree ? 'Free' : `₹${event.price}`}
            </span>
            <div className="flex gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Ticket size={14} />
                {event.attendees || 0} Registered
              </span>
              {event.capacity && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {Math.max(0, event.capacity - (event.attendees || 0))} Left
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto min-w-[200px]">
            {hasRegistered ? (
              <div className="w-full bg-emerald-50 text-emerald-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-emerald-100 font-semibold shadow-sm">
                <CheckCircle2 size={18} /> You're Going
              </div>
            ) : isSuccess ? (
              <div className="w-full bg-indigo-50 text-indigo-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-indigo-100 font-semibold shadow-sm">
                <CheckCircle2 size={18} /> Success!
              </div>
            ) : showPaymentAlert ? (
              <div className="w-full bg-amber-50 text-amber-700 py-2 px-4 rounded-xl flex flex-col items-center justify-center text-center border border-amber-100 shadow-sm">
                <span className="text-sm font-bold">Payment Pending</span>
                <span className="text-xs">Wait till we integrate Razorpay</span>
              </div>
            ) : isSoldOut ? (
              <button className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-6 rounded-xl cursor-not-allowed border border-slate-200">
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleRegister}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Register Now <Ticket size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
