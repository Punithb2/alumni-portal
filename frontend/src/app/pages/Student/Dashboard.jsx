import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Briefcase, CalendarDays, Rocket, Award } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useGamification } from '../../hooks/useGamification'
import { BADGES } from '../../data/gamification'
import { OnlineHighlightRow, PostComposer, FeedPost } from '../../components/DashboardComponents'
import { useFeed } from '../../hooks/useFeed'
import { getAvatarDataUrl } from '../../utils/avatar'

const MENTOR_USERS = [
  {
    title: 'Taylor',
    online: true,
    src: getAvatarDataUrl('Taylor'),
  },
  { title: 'Alex', online: true, src: getAvatarDataUrl('Alex') },
  {
    title: 'Jamie',
    online: true,
    src: getAvatarDataUrl('Jamie'),
  },
  {
    title: 'Morgan',
    online: true,
    src: getAvatarDataUrl('Morgan'),
  },
  {
    title: 'Riley',
    online: true,
    src: getAvatarDataUrl('Riley'),
  },
]

const PAGE_SIZE = 5

const StudentDashboard = () => {
  const { user } = useAuth()
  const { points, earnedBadges } = useGamification()
  const { uiPosts, addPost } = useFeed()
  const [allPosts, setAllPosts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef(null)

  const visiblePosts = allPosts.slice(0, visibleCount)
  const hasMore = visibleCount < allPosts.length

  useEffect(() => {
    setAllPosts(uiPosts)
  }, [uiPosts])

  const handleNewPost = useCallback(
    async ({ text, postType }) => {
      try {
        await addPost({ text, postType })
      } catch (err) {
        console.error('Failed to create post:', err)
      }
    },
    [addPost]
  )

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, allPosts.length))
      setIsLoadingMore(false)
    }, 800)
  }, [isLoadingMore, hasMore, allPosts.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="max-w-[1240px] px-4 md:px-8 mx-auto pb-12 pt-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 items-start">
        {/* Left Sidebar - Profile & Network Info */}
        <div className="hidden lg:flex flex-col gap-5 sticky top-20 col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center hover:shadow-md transition-shadow duration-300">
            <div className="h-20 bg-gradient-to-tr from-emerald-500 to-teal-400"></div>
            <div className="relative px-4 pb-4 -mt-10">
              <div className="w-20 h-20 rounded-full bg-white mx-auto border-4 border-white shadow-sm overflow-hidden mb-3">
                <img
                  src={user?.avatar || getAvatarDataUrl(user?.displayName || user?.name || 'Student')}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              <h2 className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {user?.displayName || user?.name || 'Student Name'}
              </h2>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-tight">
                Aspiring Software Engineer | B.S. Computer Science '24
              </p>
            </div>
            <div className="border-t border-slate-100 py-3 px-4">
              <div className="flex justify-between items-center text-[13px] hover:bg-slate-50 cursor-pointer pt-1 transition-colors">
                <span className="font-semibold text-slate-500 hover:text-slate-800 focus:outline-none">
                  Profile Views
                </span>
                <span className="font-bold text-indigo-600 focus:outline-none">127</span>
              </div>
              <div className="flex justify-between text-[13px] hover:bg-slate-50 cursor-pointer mt-2 pt-1 transition-colors">
                <span className="font-semibold text-slate-500 hover:text-slate-800 focus:outline-none">
                  Alumni Connections
                </span>
                <span className="font-bold text-indigo-600 focus:outline-none">42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Feed Column */}
        <div className="flex flex-col min-w-0 lg:col-span-2">
          <PostComposer
            currentUser={user}
            placeholder="Ask a question or share a project..."
            onPost={handleNewPost}
          />
          <OnlineHighlightRow title="Active Mentors to Connect With" users={MENTOR_USERS} />
          <div className="space-y-0">
            {visiblePosts.map((post) => (
              <FeedPost key={post.id} post={post} currentUser={user} />
            ))}
          </div>
          {/* Sentinel */}
          <div ref={sentinelRef} className="py-6 flex justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Context Widget Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-20 col-span-1">
          {/* Gamification Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-yellow-50 rounded-lg">
                <Award size={16} className="text-yellow-500" />
              </div>{' '}
              Your Impact
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-indigo-100">
                {points}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800">Total Points</p>
                <p className="text-[12px] text-slate-500 font-medium">
                  Keep participating to earn more
                </p>
              </div>
            </div>
            {earnedBadges?.length > 0 && (
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Unlocked Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map((bId) => {
                    const badge = BADGES[bId] || BADGES.NEWCOMER
                    return (
                      <div
                        key={bId}
                        className="group relative flex items-center justify-center w-8 h-8 bg-slate-50 border border-slate-200 rounded-full cursor-help hover:bg-indigo-50"
                      >
                        <span>{badge.icon}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                          <p className="font-bold text-[13px]">{badge.title}</p>
                          <p className="text-slate-300">{badge.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Career Launch widget */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl shadow-md p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <Rocket size={120} />
            </div>
            <h3 className="text-[15px] font-bold mb-1.5 relative z-10 tracking-wide">
              Launch Your Career
            </h3>
            <p className="text-[13px] text-emerald-50 mb-5 leading-relaxed relative z-10 font-medium opacity-90">
              Connect with alumni to review your resume or prepare for technical interviews.
            </p>
            <Link
              to="/mentors"
              className="w-full flex justify-center py-2.5 bg-white text-emerald-700 rounded-xl text-[14px] font-bold shadow-sm hover:bg-emerald-50 hover:shadow-md transition-all relative z-10"
            >
              Find a Mentor
            </Link>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-sky-50 rounded-lg">
                <Briefcase size={16} className="text-sky-500" />
              </div>{' '}
              Jobs & Internships
            </h3>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Junior Python Developer
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Microsoft • Remote</p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Data Analyst Intern
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Stripe • NY</p>
              </div>
            </div>
            <Link
              to="/jobs"
              className="inline-block mt-5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all opportunities &rarr;
            </Link>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-rose-50 rounded-lg">
                <CalendarDays size={16} className="text-rose-500" />
              </div>{' '}
              Upcoming Events
            </h3>
            <div className="space-y-4">
              <div className="group cursor-pointer pb-4 border-b border-slate-50">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Tech Industry Networking
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Tomorrow • 6:00
                  PM
                </p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Resume Workshop
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  Fri, Oct 12 • 2:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
