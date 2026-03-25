import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProfileSheet from '../Alumni/ProfileSheet'
import { ChevronLeft } from 'lucide-react'
import api from '../../utils/api'

const ProfileDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // trigger slide-in animation shortly after mount
    requestAnimationFrame(() => setIsOpen(true))
  }, [])

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/profiles/${id}/`)
        if (mounted) setProfile(res.data)
      } catch (err) {
        console.error('Failed to fetch profile detail', err)
        if (mounted) setError('Unable to load profile.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [id])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      navigate(-1)
    }, 500)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Fallback background if opened in standalone route */}
      <div className="text-center z-10 opacity-50">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-slate-200 w-48 rounded mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 w-32 rounded mx-auto animate-pulse"></div>
      </div>

      <button
        onClick={handleClose}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Go Back
      </button>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : error || !profile ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 text-slate-600">
          <p className="font-medium">{error || 'Profile not found.'}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      ) : (
        <ProfileSheet profile={profile} isOpen={isOpen} onClose={handleClose} viewerRole="Alumni" />
      )}
    </div>
  )
}

export default ProfileDetail
