import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Briefcase, Award } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useGamification } from '../../hooks/useGamification'
import { BADGES } from '../../data/gamification'
import { OnlineHighlightRow, PostComposer, FeedPost } from '../../components/DashboardComponents'
import { useFeed } from '../../hooks/useFeed'

const ALUMNI_USERS = [
  {
    title: 'Taylor',
    online: true,
    src: 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg',
  },
  { title: 'Alex', online: true, src: 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg' },
  {
    title: 'Jamie',
    online: true,
    src: 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg',
  },
  {
    title: 'Morgan',
    online: true,
    src: 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg',
  },
  {
    title: 'Riley',
    online: true,
    src: 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg',
  },
]

const PAGE_SIZE = 5

const AlumniDashboard = () => {
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
    <div className="max-w-[1000px] mx-auto pb-12 pt-2">
      {/* Grid: Main Feed + Right Context (Alumni Context) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_280px] items-start">
        <div className="flex flex-col min-w-0">
          <PostComposer
            currentUser={user}
            placeholder="Share an update or mentor insight..."
            onPost={handleNewPost}
          />
          <OnlineHighlightRow title="Active Mentees & Peers" users={ALUMNI_USERS} />
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

        {/* Alumni Context Widget Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-20">
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
                  Keep contributing to earn more
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

          {/* Give back widget */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 rounded-2xl shadow-md p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <GraduationCap size={120} />
            </div>
            <h3 className="text-[15px] font-bold mb-1.5 relative z-10 tracking-wide">
              Alumni Scholarship Fund
            </h3>
            <p className="text-[13px] text-indigo-100 mb-5 leading-relaxed relative z-10 font-medium opacity-90">
              Empower the next generation of students. Every contribution makes a difference.
            </p>
            <button className="w-full py-2.5 bg-white text-indigo-900 rounded-xl text-[14px] font-bold shadow-sm hover:bg-emerald-50 hover:shadow-md transition-all relative z-10">
              Make a Gift Today
            </button>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Briefcase size={16} className="text-emerald-500" />
              </div>{' '}
              Refer Alumni
            </h3>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Senior Product Designer
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  Google • Mountain View
                </p>
              </div>
              <div className="group cursor-pointer">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  UX Researcher
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Twitter • Remote</p>
              </div>
            </div>
            <Link
              to="/jobs"
              className="inline-block mt-5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Post a new job &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlumniDashboard
