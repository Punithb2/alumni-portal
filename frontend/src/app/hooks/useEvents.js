// src/app/hooks/useEvents.js
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'

const normalizeEvent = (event) => {
  const attendeesCount = Number(event?.attendees_count ?? event?.attendees ?? 0)
  return {
    ...event,
    type: event?.type || 'In-Person',
    visibility: event?.visibility || 'Public',
    capacity: event?.capacity == null || event?.capacity === '' ? null : Number(event.capacity),
    price: event?.price == null || event?.price === '' ? 0 : Number(event.price),
    attendees: attendeesCount,
    attendees_count: attendeesCount,
    is_registered: Boolean(event?.is_registered),
    invitedMembers: Array.isArray(event?.invited_members) ? event.invited_members : [],
  }
}

const buildEventPayload = (data) => ({
  title: data.title,
  description: data.description,
  date: data.date,
  location: data.location,
  category: data.category,
  ...('club' in data ? { club: data.club || null } : {}),
  type: data.type || 'In-Person',
  visibility: data.visibility || 'Public',
  image: data.image || '',
  capacity: data.capacity === '' || data.capacity == null ? null : Number(data.capacity),
  price: data.price === '' || data.price == null ? 0 : Number(data.price),
  invited_members: Array.isArray(data.invitedMembers) ? data.invitedMembers : [],
})

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/events/')
      // Handle paginated response or plain array
      const data = res.data.results ?? res.data
      setEvents(Array.isArray(data) ? data.map(normalizeEvent) : [])
    } catch (err) {
      console.error('Failed to load events:', err)
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const addEvent = async (data) => {
    const res = await api.post('/events/', buildEventPayload(data))
    const nextEvent = normalizeEvent(res.data)
    setEvents((prev) => [nextEvent, ...prev])
    return nextEvent
  }

  const updateEvent = async (id, data) => {
    const res = await api.patch(`/events/${id}/`, buildEventPayload(data))
    const nextEvent = normalizeEvent(res.data)
    setEvents((prev) => prev.map((e) => (e.id === id ? nextEvent : e)))
    return nextEvent
  }

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}/`)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const registerUser = async (eventId) => {
    const res = await api.post(`/events/${eventId}/rsvp/`)
    let nextEvent = null
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e
        nextEvent = {
          ...e,
          attendees: res.data.attendees_count,
          attendees_count: res.data.attendees_count,
          is_registered: true,
        }
        return nextEvent
      })
    )
    return nextEvent
  }

  const cancelRsvp = async (eventId) => {
    const res = await api.post(`/events/${eventId}/cancel_rsvp/`)
    let nextEvent = null
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e
        nextEvent = {
          ...e,
          attendees: res.data.attendees_count,
          attendees_count: res.data.attendees_count,
          is_registered: false,
        }
        return nextEvent
      })
    )
    return nextEvent
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    registerUser,
    cancelRsvp,
    refetch: fetchEvents,
    getEventById: (id) => events.find((e) => String(e.id) === String(id)),
  }
}
