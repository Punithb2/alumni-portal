import React, { useState } from 'react'
import { X, CheckCircle2, CreditCard, Calendar, MapPin } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useGamification } from '../../hooks/useGamification'
import { BADGES } from '../../data/gamification'

const RSVPModal = ({ isOpen, onClose, event, onConfirm }) => {
  const { user } = useAuth()
  const { awardPoints } = useGamification()
  const [step, setStep] = useState(1) // 1: Info/Ticket, 2: Payment (if paid), 3: Success
  const [ticketType, setTicketType] = useState('General')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !event) return null

  const isFree = event.price === 0 || !event.price

  const handleNext = () => {
    if (isFree || step === 2) {
      // Process RSVP
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setStep(3)
        awardPoints(50, 'RSVP to Event', BADGES.FIRST_EVENT.id)
        // Auto close after success
        setTimeout(() => {
          onConfirm(event.id)
          handleClose()
        }, 2000)
      }, 1000)
    } else {
      setStep(2)
    }
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {step === 3 ? 'RSVP Confirmed!' : 'Event Registration'}
          </h2>
          {step !== 3 && (
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              {/* Event Info */}
              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-indigo-500" />
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }).format(new Date(event.date))}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Attendee Details
                </label>
                <div className="grid gap-3">
                  <input
                    type="text"
                    readOnly
                    value={user?.name || 'Jane Doe'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm outline-none cursor-not-allowed"
                  />
                  <input
                    type="email"
                    readOnly
                    value={user?.email || 'jane@example.com'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Using your account profile details. Update in settings if needed.
                </p>
              </div>

              {/* Ticket Selection */}
              {!isFree && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Select Ticket
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['General', 'VIP'].map((type) => (
                      <label
                        key={type}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-colors ${
                          ticketType === type
                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          checked={ticketType === type}
                          onChange={() => setTicketType(type)}
                        />
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-slate-900">{type}</span>
                          {ticketType === type && (
                            <CheckCircle2 size={16} className="text-indigo-600" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          ${type === 'VIP' ? event.price * 2 : event.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && !isFree && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Total Due</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${ticketType === 'VIP' ? event.price * 2 : event.price}
                  </p>
                </div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-lg">
                  {ticketType} TICKET
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Payment Details
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    defaultValue="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    defaultValue="12/26"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    defaultValue="123"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="animate-in slide-in-from-bottom-2 fade-in" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">You're going!</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">
                We've sent a confirmation email with your ticket and calendar invite.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 3 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isProcessing}
              className={`flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 ${
                isProcessing ? 'opacity-75 cursor-wait' : ''
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 1 && !isFree ? (
                'Continue to Payment'
              ) : (
                'Confirm Registration'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RSVPModal
