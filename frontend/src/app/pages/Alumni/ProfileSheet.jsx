import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MoreVertical,
  MessageSquare,
  Mail,
  UserPlus,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Activity,
  Star,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  BadgeCheck,
  X,
  Calendar,
  Droplet,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from 'lucide-react'
import clsx from 'clsx'
import { getAvatarDataUrl } from '../../utils/avatar'
import api from '../../utils/api'
import {
  getProfileEmail,
  getProfileFirstName,
  getProfileFullName,
} from '../../utils/profileIdentity'

export default function ProfileSheet({ profile, isOpen, onClose, viewerRole = 'Alumni' }) {
  const [activeTab, setActiveTab] = useState('Posts')
  const [actionMessage, setActionMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('none')
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      setTimeout(() => setActiveTab('Posts'), 300)
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    setConnectionStatus(profile?.connection_status || 'none')
  }, [profile?.connection_status])

  useEffect(() => {
    const authorId = profile?.user?.id
    if (!isOpen || !authorId) {
      setPosts([])
      return
    }

    let mounted = true
    const loadPosts = async () => {
      setLoadingPosts(true)
      try {
        const res = await api.get('/posts/')
        const data = res.data?.results ?? res.data
        const allPosts = Array.isArray(data) ? data : []
        const authorPosts = allPosts.filter((post) => String(post.author) === String(authorId))
        if (mounted) setPosts(authorPosts)
      } catch (error) {
        console.error('Failed to load profile posts', error)
        if (mounted) setPosts([])
      } finally {
        if (mounted) setLoadingPosts(false)
      }
    }

    loadPosts()
    return () => {
      mounted = false
    }
  }, [isOpen, profile?.user?.id])

  if (!profile) return null

  const tabs = ['Posts', 'About', 'Education', 'Experience']

  const firstName = getProfileFirstName(profile)
  const fullName = getProfileFullName(profile)
  const email = getProfileEmail(profile)
  const formatPostTime = (timestamp) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString()
  }

  const handleMessageClick = () => {
    // Check if connected (mock logic based on typical structures, change fields as needed)
    const isConnected = connectionStatus === 'connected' || profile.isConnected === true

    if (isConnected) {
      onClose()
      navigate(`/chat`) // Assume /chat takes care of the latest user via state or we can pass state if required
    } else {
      setActionMessage(`${firstName || 'This user'} has not accepted your connection request yet.`)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop click area to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Container - Right Sidebar */}
      <div
        className={clsx(
          'w-full sm:w-[400px] lg:w-[450px] bg-white h-full overflow-y-auto overflow-x-hidden flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out relative',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Simple Header */}
        <div className="flex flex-shrink-0 items-center justify-between p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <h3 className="font-semibold text-slate-800">Profile</h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar bg-slate-50/50">
          {/* Cover Image */}
          <div className="h-32 sm:h-40 w-full bg-slate-200 overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop"
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Profile Info Section */}
          <div className="px-5 sm:px-6 pb-6 relative bg-white">
            <div className="relative -mt-12 sm:-mt-16 mb-4 flex justify-between items-end">
              <div className="p-1 bg-white rounded-full inline-block shadow-md relative z-10">
                <img
                  src={profile.avatar || getAvatarDataUrl(fullName)}
                  alt={fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white"
                />
                {profile.willing_to_mentor && (
                  <div
                    className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-[3px] border-white rounded-full"
                    title="Willing to mentor"
                  ></div>
                )}
              </div>

              <div className="flex items-center gap-2 pb-1 z-10">
                {connectionStatus === 'incoming_pending' ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/profiles/${profile.id}/accept_connection_request/`)
                          setConnectionStatus('connected')
                          setActionMessage(`You are now connected with ${firstName || 'this user'}.`)
                        } catch (error) {
                          console.error('Failed to accept connection request', error)
                          setActionMessage('Unable to accept request right now. Please try again.')
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 text-white font-semibold text-[13px] sm:text-[14px] rounded-full hover:bg-emerald-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
                    >
                      <span className="hidden sm:inline">Accept</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/profiles/${profile.id}/reject_connection_request/`)
                          setConnectionStatus('none')
                          setActionMessage(`Connection request from ${firstName || 'this user'} rejected.`)
                        } catch (error) {
                          console.error('Failed to reject connection request', error)
                          setActionMessage('Unable to reject request right now. Please try again.')
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-50 text-rose-700 font-semibold text-[13px] sm:text-[14px] rounded-full hover:bg-rose-100 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-rose-300"
                    >
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      if (connectionStatus !== 'none') return
                      try {
                        await api.post(`/profiles/${profile.id}/send_connection_request/`)
                        setConnectionStatus('outgoing_pending')
                        setActionMessage(
                          `${viewerRole === 'Student' ? 'Mentorship request' : 'Connection request'} sent to ${firstName || 'this user'}.`
                        )
                      } catch (error) {
                        console.error('Failed to send connection request', error)
                        setActionMessage('Unable to send request right now. Please try again.')
                      }
                    }}
                    disabled={connectionStatus === 'outgoing_pending' || connectionStatus === 'connected'}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-600 text-white font-semibold text-[13px] sm:text-[14px] rounded-full hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">
                      {connectionStatus === 'connected'
                        ? 'Connected'
                        : connectionStatus === 'outgoing_pending'
                          ? 'Request Sent'
                          : viewerRole === 'Student'
                            ? 'Request Mentor'
                            : 'Connect'}
                    </span>
                  </button>
                )}
                <button
                  onClick={handleMessageClick}
                  className="p-1.5 sm:p-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
            {actionMessage && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {actionMessage}
              </div>
            )}

            <div className="mb-5">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                {fullName}
                <BadgeCheck size={18} className="text-indigo-500 flex-shrink-0" />
              </h2>
              <p className="text-[14px] sm:text-[15px] font-medium text-slate-500 mt-0.5">
                {profile.headline || profile.current_position || 'Professional'}{' '}
                {profile.current_company && `at ${profile.current_company}`}
              </p>

              <p className="text-[14px] sm:text-[15px] text-slate-700 mt-3 leading-relaxed">
                {profile.about ||
                  profile.bio ||
                  "Life is what happens when you're busy making other plans."}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Class of {profile.graduation_year || '2022'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                  {profile.department || 'B.Tech'}
                </span>
                {profile.willing_to_mentor && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    Mentor
                  </span>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2 text-[13px] sm:text-[14px] text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100/60 mt-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400 shrink-0" />
                <span className="truncate">Joined Sep 2022</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <span className="truncate">
                  {profile.city || profile.location || 'Sylhet, Zindabazar'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400 shrink-0" />
                <span className="truncate">
                  {email || `${(firstName || 'user').toLowerCase()}@gmail.com`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Droplet size={18} className="text-slate-400 shrink-0" />
                <span className="truncate">O Positive</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 hide-scrollbar overflow-x-auto mt-2">
              <div className="flex justify-between w-full min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-2 text-[14px] sm:text-[15px] font-semibold transition-colors whitespace-nowrap border-b-2 flex-1 text-center outline-none ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6 mb-8 min-h-[250px]">
              {activeTab === 'Posts' && (
                <div className="flex flex-col gap-4">
                  {loadingPosts ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-6 text-sm text-slate-500 text-center">
                      Loading posts...
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-6 text-sm text-slate-500 text-center">
                      No posts yet.
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4 text-left">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author_avatar || profile.avatar || getAvatarDataUrl(fullName)}
                              alt=""
                              className="w-10 h-10 rounded-full border border-slate-100"
                            />
                            <div>
                              <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-none">
                                {post.author_name || fullName}
                              </p>
                              <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                                {formatPostTime(post.created_at)}
                              </p>
                            </div>
                          </div>
                          <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                        <p className="text-[14px] sm:text-[15px] text-slate-700 leading-relaxed mb-4 text-left">
                          {post.content}
                        </p>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                          <button className="flex items-center gap-1.5">
                            <Heart size={18} />
                            <span className="text-[13px] font-medium">
                              {post.reaction_counts?.like || 0}
                            </span>
                          </button>
                          <button className="flex items-center gap-1.5">
                            <MessageCircle size={18} />
                            <span className="text-[13px] font-medium">{post.comment_count || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5">
                            <Share2 size={18} />
                            <span className="text-[13px] font-medium">Share</span>
                          </button>
                          <button className="flex items-center gap-1.5">
                            <Bookmark size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'About' && (
                <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm">
                  <p className="font-bold text-slate-900 mb-2">About {firstName || 'this user'}</p>
                  <p className="leading-relaxed">
                    {profile.about ||
                      profile.bio ||
                      'No additional details provided. User prefers to keep their bio short and sweet.'}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-200/60">
                    <p className="font-bold text-slate-900 mb-3.5">Skills & Expertise</p>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-default shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {['React', 'Design', 'Management'].map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-default shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'Education' && (
                <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm">
                  <p className="font-bold text-slate-900 mb-5">Education History</p>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold shrink-0 text-xl border border-indigo-100 shadow-sm">
                      U
                    </div>
                    <div className="pt-0.5">
                      <p className="font-bold text-slate-900 leading-tight">
                        University of Excellence
                      </p>
                      <p className="text-slate-600 mt-1 font-medium">
                        {profile.department || 'Bachelors in Technology'}
                      </p>
                      <p className="text-slate-500 text-[12px] sm:text-[13px] mt-1 bg-white px-2 py-0.5 inline-block rounded-md border border-slate-100">
                        Class of {profile.graduation_year || '2020'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Experience' && (
                <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm relative overflow-hidden">
                  <p className="font-bold text-slate-900 mb-6">Work Experience</p>
                  {/* Timeline line */}
                  <div className="absolute left-[25px] top-[74px] bottom-8 w-[2px] bg-slate-200"></div>

                  <div className="flex gap-5 relative z-10 mb-8">
                    <div className="mt-1.5 w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0 ring-4 ring-indigo-100" />
                    <div className="-mt-0.5">
                      <p className="font-bold text-slate-900 text-[15px] sm:text-[16px]">
                        {profile.current_position || 'Research Scientist'}
                      </p>
                      <p className="text-slate-600 mt-0.5 text-[14px] sm:text-[15px]">
                        {profile.current_company || 'DeepMind'}
                      </p>
                      <p className="text-slate-500 text-[12px] sm:text-[13px] mt-2 font-medium bg-white border border-slate-100 inline-block px-2.5 py-1 rounded-md shadow-sm">
                        Jan 2022 - Present
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5 relative z-10">
                    <div className="mt-1.5 w-3 h-3 bg-slate-300 rounded-full flex-shrink-0 ring-4 ring-slate-100" />
                    <div className="-mt-0.5">
                      <p className="font-bold text-slate-900 text-[15px] sm:text-[16px]">
                        Previous Role
                      </p>
                      <p className="text-slate-600 mt-0.5 text-[14px] sm:text-[15px]">
                        Other Enterprise
                      </p>
                      <p className="text-slate-500 text-[12px] sm:text-[13px] mt-2 font-medium bg-white border border-slate-100 inline-block px-2.5 py-1 rounded-md shadow-sm">
                        Aug 2019 - Dec 2021
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
