// src/app/hooks/useEvents.js
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'

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
      setEvents(data)
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
    const res = await api.post('/events/', data)
    setEvents((prev) => [res.data, ...prev])
    return res.data
  }

  const updateEvent = async (id, data) => {
    const res = await api.patch(`/events/${id}/`, data)
    setEvents((prev) => prev.map((e) => (e.id === id ? res.data : e)))
    return res.data
  }

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}/`)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const registerUser = async (eventId) => {
    const res = await api.post(`/events/${eventId}/rsvp/`)
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, attendees_count: res.data.attendees_count, is_registered: true }
          : e
      )
    )
  }

  const cancelRsvp = async (eventId) => {
    const res = await api.post(`/events/${eventId}/cancel_rsvp/`)
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, attendees_count: res.data.attendees_count, is_registered: false }
          : e
      )
    )
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
