import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, CalendarDays, GraduationCap, Users } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { OnlineHighlightRow, PostComposer, FeedPost } from '../../components/DashboardComponents'
import { useFeed } from '../../hooks/useFeed'
import { useDashboardData } from '../../hooks/useDashboardData'
import { getAvatarDataUrl } from '../../utils/avatar'

const PAGE_SIZE = 5

const formatEventDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const {
    uiPosts,
    loading: feedLoading,
    error: feedError,
    actionError: feedActionError,
    addPost,
    addComment,
    reactToPost,
    followAuthor,
  } = useFeed()
  const {
    loading: dashboardLoading,
    error: dashboardError,
    connectionsCount,
    mentorProfiles,
    highlightUsers,
    featuredJobs,
    featuredEvents,
  } = useDashboardData(user)

  const [allPosts, setAllPosts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [composerBusy, setComposerBusy] = useState(false)
  const [postActionBusy, setPostActionBusy] = useState(false)
  const sentinelRef = useRef(null)

  const visiblePosts = allPosts.slice(0, visibleCount)
  const hasMore = visibleCount < allPosts.length
  const profile = user?.profile || {}
  const fullName = user?.displayName || user?.name || 'Student'
  const profileHeadline =
    profile.headline ||
    [
      profile.department,
      profile.graduation_year ? `Class of ${profile.graduation_year}` : null,
      profile.current_position,
    ]
      .filter(Boolean)
      .join(' | ') ||
    'Student'

  useEffect(() => {
    setAllPosts(uiPosts)
  }, [uiPosts])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [uiPosts.length])

  const handleNewPost = useCallback(
    async ({ text }) => {
      setComposerBusy(true)
      try {
        await addPost({ text })
      } finally {
        setComposerBusy(false)
      }
    },
    [addPost]
  )

  const handlePostAction = useCallback(async (action) => {
    setPostActionBusy(true)
    try {
      await action()
    } finally {
      setPostActionBusy(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, allPosts.length))
      setIsLoadingMore(false)
    }, 500)
  }, [allPosts.length, hasMore, isLoadingMore])

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
        <div className="hidden lg:flex flex-col gap-5 sticky top-20 col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center">
            <div className="h-20 bg-linear-to-tr from-emerald-500 to-teal-400" />
            <div className="relative px-4 pb-4 -mt-10">
              <div className="w-20 h-20 rounded-full bg-white mx-auto border-4 border-white shadow-sm overflow-hidden mb-3">
                <img
                  src={user?.avatar || getAvatarDataUrl(fullName)}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              <h2 className="text-[16px] font-bold text-slate-900">{fullName}</h2>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-tight">
                {profileHeadline}
              </p>
            </div>
            <div className="border-t border-slate-100 py-3 px-4 space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-slate-500">Alumni connections</span>
                <span className="font-bold text-indigo-600">{connectionsCount}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-slate-500">Mentors available</span>
                <span className="font-bold text-indigo-600">{mentorProfiles.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-w-0 lg:col-span-2">
          <PostComposer
            currentUser={user}
            placeholder="Ask a question or share a project..."
            onPost={handleNewPost}
            isSubmitting={composerBusy}
          />

          {(feedError || dashboardError || feedActionError) && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {feedActionError || feedError || dashboardError}
            </div>
          )}

          <OnlineHighlightRow
            title="Active Mentors to Connect With"
            users={highlightUsers}
            actionTo="/directory"
          />

          {feedLoading && visiblePosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-[14px] text-slate-500">
              Loading your feed...
            </div>
          ) : (
            <div className="space-y-0">
              {visiblePosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  currentUser={user}
                  actionBusy={postActionBusy}
                  onFollow={(profileId) => handlePostAction(() => followAuthor(profileId))}
                  onComment={(postId, content) =>
                    handlePostAction(() => addComment(postId, content))
                  }
                  onReact={(postId, reaction) =>
                    handlePostAction(() => reactToPost(postId, reaction))
                  }
                />
              ))}
            </div>
          )}

          {!feedLoading && visiblePosts.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-[14px] text-slate-500">
              No posts yet. Your next update will show up here.
            </div>
          )}

          <div ref={sentinelRef} className="py-6 flex justify-center">
            {(isLoadingMore || dashboardLoading) && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-6 sticky top-20 col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <GraduationCap size={16} className="text-emerald-500" />
              </div>
              Mentorship
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-emerald-100">
                {mentorProfiles.length}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800">Mentors available</p>
                <p className="text-[12px] text-slate-500 font-medium">
                  Alumni open to mentoring right now
                </p>
              </div>
            </div>
            <Link
              to="/directory"
              className="inline-block text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Find alumni →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-sky-50 rounded-lg">
                <Briefcase size={16} className="text-sky-500" />
              </div>
              Jobs & Internships
            </h3>
            <div className="space-y-4">
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <div key={job.id} className="group">
                    <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                      {job.company} • {job.location}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-slate-500">No active opportunities yet.</p>
              )}
            </div>
            <Link
              to="/jobs"
              className="inline-block mt-5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all opportunities →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-rose-50 rounded-lg">
                <CalendarDays size={16} className="text-rose-500" />
              </div>
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {featuredEvents.length > 0 ? (
                featuredEvents.map((event) => (
                  <div key={event.id} className="group">
                    <p className="text-[13px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                      {formatEventDate(event.date)} • {event.location || 'Online'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-slate-500">No upcoming events available yet.</p>
              )}
            </div>
            <Link
              to="/events"
              className="inline-block mt-5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Browse events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
