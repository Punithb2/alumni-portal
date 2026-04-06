import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, HandHeart, Users } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { OnlineHighlightRow, PostComposer, FeedPost } from '../../components/DashboardComponents'
import { useFeed } from '../../hooks/useFeed'
import { useDashboardData } from '../../hooks/useDashboardData'

const PAGE_SIZE = 5

const AlumniDashboard = () => {
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
    highlightUsers,
    connectionsCount,
    pendingConnectionsCount,
    featuredCampaign,
    referralJobs,
  } = useDashboardData(user)

  const [allPosts, setAllPosts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [composerBusy, setComposerBusy] = useState(false)
  const [postActionBusy, setPostActionBusy] = useState(false)
  const sentinelRef = useRef(null)

  const visiblePosts = allPosts.slice(0, visibleCount)
  const hasMore = visibleCount < allPosts.length

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
    <div className="max-w-[1000px] mx-auto pb-12 pt-2">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_280px] items-start">
        <div className="flex flex-col min-w-0">
          <PostComposer
            currentUser={user}
            placeholder="Share an update or mentor insight..."
            onPost={handleNewPost}
            isSubmitting={composerBusy}
          />

          {(feedError || dashboardError || feedActionError) && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {feedActionError || feedError || dashboardError}
            </div>
          )}

          <OnlineHighlightRow
            title="Active Mentees & Peers"
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

        <div className="hidden lg:flex flex-col gap-6 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Users size={16} className="text-indigo-600" />
              </div>
              Your Network
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-indigo-100">
                {connectionsCount}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800">Confirmed connections</p>
                <p className="text-[12px] text-slate-500 font-medium">
                  {pendingConnectionsCount} pending requests
                </p>
              </div>
            </div>
            <Link
              to="/directory"
              className="inline-block text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Explore members →
            </Link>
          </div>

          <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-indigo-700 rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
            <h3 className="text-[15px] font-bold mb-1.5 relative z-10 tracking-wide">
              {featuredCampaign?.title || 'Support the alumni community'}
            </h3>
            <p className="text-[13px] text-indigo-100 mb-5 leading-relaxed relative z-10 font-medium opacity-90">
              {featuredCampaign?.story ||
                'Back scholarships, programs, and initiatives that benefit students and alumni.'}
            </p>
            <Link
              to={featuredCampaign ? `/campaigns/${featuredCampaign.id}` : '/campaigns'}
              className="w-full flex justify-center py-2.5 bg-white text-indigo-900 rounded-xl text-[14px] font-bold shadow-sm hover:bg-emerald-50 hover:shadow-md transition-all relative z-10"
            >
              <HandHeart size={16} className="mr-2" />
              View campaign
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Briefcase size={16} className="text-emerald-500" />
              </div>
              Referral-ready jobs
            </h3>
            <div className="space-y-4">
              {referralJobs.length > 0 ? (
                referralJobs.map((job) => (
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
                <p className="text-[13px] text-slate-500">
                  No referral-enabled jobs available yet.
                </p>
              )}
            </div>
            <Link
              to="/jobs"
              className="inline-block mt-5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Open jobs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlumniDashboard
