import React, { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import EventCard from '../../components/Events/EventCard'
import EventSheet from '../../components/Events/EventSheet'
import { Plus, X, Search, CalendarDays } from 'lucide-react'

export default function EventManager() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingEvent, setViewingEvent] = useState(null)
  const [isViewSheetOpen, setViewSheetOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    category: 'Networking',
    type: 'In-Person',
    visibility: 'Public',
    invited: '',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  })

  const handleOpenSheet = (event = null) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description,
        // Formatting Date for input
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        capacity: event.capacity,
        price: event.price,
        category: event.category || 'Networking',
        type: event.type || 'In-Person',
        visibility: event.visibility || 'Public',
        invited: (event.invitedMembers || []).map((m) => m.name || m.email).join(', '),
        image: event.image,
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: '',
        price: '',
        category: 'Networking',
        type: 'In-Person',
        visibility: 'Public',
        invited: '',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      })
    }
    setSheetOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const invitedMembers = (formData.invited || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((value, idx) => ({
        id: `evt-invited-${Date.now()}-${idx}`,
        name: value,
        email: value.includes('@') ? value : undefined,
      }))

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      invitedMembers: formData.visibility === 'Private' ? invitedMembers : [],
      // Convert datetime-local back to generic format
      date: new Date(formData.date).toISOString(),
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, payload)
    } else {
      addEvent(payload)
    }
    setSheetOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id)
    }
  }

  const handleViewEvent = (event) => {
    setViewingEvent(event)
    setViewSheetOpen(true)
  }

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Event Management
          </h1>
          <p className="text-slate-500 font-medium text-lg">Create and oversee alumni events.</p>
        </div>
        <button
          onClick={() => handleOpenSheet()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={3} /> New Event
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden p-2">
        <div className="flex items-center gap-4 px-3 py-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group/manager">
            <EventCard event={event} isAdmin={true} onEventClick={() => handleViewEvent(event)} />
            {/* overlay edit controls for admin manager layout */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/manager:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenSheet(event)}
                className="bg-white/95 p-2 text-slate-700 hover:text-indigo-600 rounded-xl shadow-md border border-slate-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="bg-white/95 p-2 text-slate-700 hover:text-rose-600 rounded-xl shadow-md border border-slate-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
            <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-700 mb-2">No events found</p>
            <p className="text-slate-500">
              Try adjusting your search criteria or create a new event.
            </p>
          </div>
        )}
      </div>

      {/* Sheet Drawer Form */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSheetOpen(false)}
          />

          <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-200 p-2.5 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                    placeholder="E.g., Alumni AI Tech Talk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium bg-white"
                    placeholder="Event details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Venue / Link
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                      placeholder="Room 101 or Zoom Link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Date & Time
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Capacity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Ticket Price (₹0 = Free)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                    >
                      <option value="Networking">Networking</option>
                      <option value="Career">Career</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Visibility
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, visibility: 'Public' })}
                        className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          formData.visibility === 'Public'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Public — visible to all eligible users
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, visibility: 'Private' })}
                        className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          formData.visibility === 'Private'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Private — only invited users
                      </button>
                    </div>
                  </div>
                </div>

                {formData.visibility === 'Private' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">
                      Add Members for Private Event
                      <span className="text-slate-400 font-normal ml-1 text-xs">
                        (comma separated names or emails)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.invited}
                      onChange={(e) => setFormData({ ...formData, invited: e.target.value })}
                      placeholder="e.g. john@example.com, Jane Doe"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    required
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium mb-4 bg-white"
                    placeholder="https://..."
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                form="event-form"
                type="submit"
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Sheet */}
      <EventSheet
        event={viewingEvent}
        isOpen={isViewSheetOpen}
        onClose={() => setViewSheetOpen(false)}
      />
    </div>
  )
}
