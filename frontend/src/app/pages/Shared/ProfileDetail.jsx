import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MOCK_PROFILES } from '../../utils/mockData'
import ProfileSheet from '../Alumni/ProfileSheet'
import { ChevronLeft } from 'lucide-react'

const ProfileDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const profile = MOCK_PROFILES.find((p) => String(p.id) === id) || MOCK_PROFILES[0]

  useEffect(() => {
    // trigger slide-in animation shortly after mount
    requestAnimationFrame(() => setIsOpen(true))
  }, [])

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

      <ProfileSheet
        profile={profile}
        isOpen={isOpen}
        onClose={handleClose}
        viewerRole="Alumni" // default mock role since we don't have auth context here natively, or we could add useAuth
      />
    </div>
  )
}

export default ProfileDetail
