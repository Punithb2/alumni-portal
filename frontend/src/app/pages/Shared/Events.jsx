import React, { useMemo, useState } from 'react'
import { MapPin, Ticket, CheckCircle2 } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useEvents } from '../../hooks/useEvents'

import EventsSidebar from '../../components/Events/EventsSidebar'
import EventCard from '../../components/Events/EventCard'
import EventsRightSidebar from '../../components/Events/EventsRightSidebar'
import EventSheet from '../../components/Events/EventSheet'

const Events = () => {
  const { user } = useAuth()
  const currentUser = user || { role: 'Alumni' }
  const { events, loading, error, registerUser, cancelRsvp } = useEvents()

  // Filter States
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [eventTypeFilter, setEventTypeFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showMyRsvps, setShowMyRsvps] = useState(false)
  const [viewMode, setViewMode] = useState('card')

  // Sheet State
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const now = new Date()
  const rsvpdEvents = useMemo(
    () => new Set(events.filter((e) => e.is_registered).map((e) => e.id)),
    [events]
  )

  // Computed Filters
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    if (activeTab === 'Upcoming' && eventDate < now) return false
    if (activeTab === 'Past' && eventDate >= now) return false

    if (showMyRsvps && !rsvpdEvents.has(event.id)) return false
    if (eventTypeFilter !== 'All' && event.type !== eventTypeFilter) return false
    if (categoryFilter !== 'All' && event.category !== categoryFilter) return false

    return true
  })

  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).slice(0, 3)
  const pastRecaps = events.filter((e) => new Date(e.date) < now).slice(0, 2)

  const openEventSheet = (event) => {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const closeEventSheet = () => {
    setIsSheetOpen(false)
    setTimeout(() => setSelectedEvent(null), 300) // delay to allow leave animation
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events</h2>
          <p className="text-slate-500 mt-1 font-medium">
            Discover networking events, workshops, reunions, and more.
          </p>
        </div>
      </div>

      <EventsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventTypeFilter={eventTypeFilter}
        setEventTypeFilter={setEventTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        showMyRsvps={showMyRsvps}
        setShowMyRsvps={setShowMyRsvps}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              Loading events...
            </div>
          ) : filteredEvents.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    rsvpdEvents={rsvpdEvents}
                    isAdmin={false}
                    onEventClick={() => openEventSheet(event)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Status/Price</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEvents.map((event) => {
                        let dateObj = new Date()
                        try {
                          dateObj = new Date(event.date)
                        } catch {
                          // Ignore
                        }

                        const dateStr = new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(dateObj)
                        const timeStr = new Intl.DateTimeFormat('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }).format(dateObj)

                        const isRsvpd = Boolean(event.is_registered)
                        const isFree = event.price === 0 || !event.price
                        const isSoldOut = event.capacity && event.attendees >= event.capacity

                        return (
                          <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => openEventSheet(event)}
                                className="flex flex-col text-left group"
                              >
                                <span className="font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">
                                  {event.title}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  {event.category && (
                                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                      {event.category}
                                    </span>
                                  )}
                                  {event.type && (
                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      {event.type}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">{dateStr}</span>
                                <span className="text-slate-500 text-xs">{timeStr}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-[200px] truncate">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isFree ? (
                                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg">
                                    FREE
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 font-semibold text-slate-700 w-16">
                                    <Ticket size={14} className="text-slate-400" /> ₹{event.price}
                                  </span>
                                )}
                                {isSoldOut && (
                                  <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-lg">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isRsvpd ? (
                                <button
                                  onClick={() => openEventSheet(event)}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 w-full sm:w-auto"
                                >
                                  <CheckCircle2 size={16} /> Going
                                </button>
                              ) : (
                                <button
                                  onClick={() => openEventSheet(event)}
                                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm w-full sm:w-auto ${isSoldOut ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                  {isSoldOut ? 'Waitlist' : 'Details'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <span className="text-2xl pt-1">📅</span>
              </div>
              <p className="text-lg font-bold text-slate-800">No events found</p>
              <p className="text-sm mt-2 text-slate-500 max-w-xs font-medium">
                Try adjusting your filters to find what you're looking for, or check back later!
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-80 shrink-0">
          <EventsRightSidebar
            upcomingEvents={upcomingEvents}
            pastRecaps={pastRecaps}
            onEventClick={openEventSheet}
          />
        </div>
      </div>

      {/* Event Details Sheet */}
      <EventSheet
        event={selectedEvent}
        isOpen={isSheetOpen}
        onClose={closeEventSheet}
        onRegister={registerUser}
        onCancelRsvp={cancelRsvp}
      />
    </div>
  )
}

export default Events
