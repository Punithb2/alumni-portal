import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  Lock,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  MoreHorizontal,
  ThumbsUp,
  Pin,
  Send,
  Search,
  Crown,
  Shield,
  Star,
  UserMinus,
  UserCheck,
  CheckCircle,
  X,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  ChevronDown,
  ChevronUp,
  Smile,
  Paperclip,
  Hash,
  BookOpen,
  Info,
  ArrowLeft,
  Mail,
  Share2,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useClubs } from '../../hooks/useClubs'

const ROLE_ICONS = {
  Owner: <Crown size={13} className="text-amber-500" />,
  Moderator: <Shield size={13} className="text-indigo-500" />,
  Member: null,
}

const ROLE_BADGE = {
  Owner: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderator: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Member: 'bg-slate-50 text-slate-600 border-slate-200',
}

const TABS = [
  { id: 'feed', label: 'Feed', icon: <Hash size={16} /> },
  { id: 'chat', label: 'Group Chat', icon: <MessageSquare size={16} /> },
  { id: 'members', label: 'Members', icon: <Users size={16} /> },
  { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
  { id: 'about', label: 'About', icon: <Info size={16} /> },
]

// ═══════════════════════════════════════════════════════════════
// 1) FEED TAB
// ═══════════════════════════════════════════════════════════════
const FeedTab = ({
  user,
  posts,
  isAdmin,
  onCreatePost,
  onLike,
  onDelete,
  onPin,
  onComment,
  onReply,
  likedPosts,
}) => {
  const [feedMsg, setFeedMsg] = useState('')
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [commentInputs, setCommentInputs] = useState({})
  const [replyInputs, setReplyInputs] = useState({})
  const [replyBoxes, setReplyBoxes] = useState({})
  const [sharedPostIds, setSharedPostIds] = useState(new Set())
  const [submittingPost, setSubmittingPost] = useState(false)
  const [submittingCommentFor, setSubmittingCommentFor] = useState(null)
  const [submittingReplyFor, setSubmittingReplyFor] = useState(null)
  const currentUserAvatar =
    user?.avatar ||
    user?.profile?.avatar ||
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150'

  const handleShare = (postId) => {
    navigator.clipboard.writeText(window.location.href)
    setSharedPostIds((prev) => new Set(prev).add(postId))
    setTimeout(() => {
      setSharedPostIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }, 2000)
  }

  const handlePost = async (e) => {
    e.preventDefault()
    const nextContent = feedMsg.trim()
    if (!nextContent || submittingPost) return
    setSubmittingPost(true)
    try {
      await onCreatePost({ content: nextContent })
      setFeedMsg('')
    } finally {
      setSubmittingPost(false)
    }
  }

  const toggleComments = (postId) => {
    setExpandedComments((prev) => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
  }

  const handleCommentSubmit = async (postId) => {
    const nextContent = (commentInputs[postId] || '').trim()
    if (!nextContent || submittingCommentFor === postId) return
    setSubmittingCommentFor(postId)
    try {
      await onComment(postId, nextContent)
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      setExpandedComments((prev) => new Set(prev).add(postId))
    } finally {
      setSubmittingCommentFor(null)
    }
  }

  const handleReplySubmit = async (postId, commentId) => {
    const nextContent = (replyInputs[commentId] || '').trim()
    if (!nextContent || submittingReplyFor === commentId) return
    setSubmittingReplyFor(commentId)
    try {
      await onReply(postId, commentId, nextContent)
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }))
      setReplyBoxes((prev) => ({ ...prev, [commentId]: false }))
      setExpandedComments((prev) => new Set(prev).add(postId))
    } finally {
      setSubmittingReplyFor(null)
    }
  }

  const sortedPosts = [...(posts || [])].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Composer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150"
            alt="You"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 space-y-3">
            <textarea
              value={feedMsg}
              onChange={(e) => setFeedMsg(e.target.value)}
              placeholder="Share an update, ask a question, or post a link…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none min-h-20 font-medium placeholder:text-slate-400 transition-all"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Club post attachments are not enabled yet.
              </p>
              <button
                onClick={handlePost}
                disabled={!feedMsg.trim() || submittingPost}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {sortedPosts.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Hash size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 mb-1">No posts yet</p>
          <p className="text-sm text-slate-500">Be the first to share something with this group!</p>
        </div>
      )}
      {sortedPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {post.isPinned && (
            <div className="bg-indigo-50 px-6 py-2.5 flex items-center gap-2 border-b border-indigo-100">
              <Pin size={13} className="text-indigo-500 fill-indigo-200" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Pinned by Admin
              </span>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">{post.author}</p>
                  <p className="text-xs font-medium text-slate-500">{post.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={() => onPin(post.id)}
                    title={post.isPinned ? 'Unpin' : 'Pin'}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pin size={16} />
                  </button>
                )}
                {(isAdmin || String(post.authorId) === String(user?.id)) && (
                  <button
                    onClick={() => onDelete(post.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap text-sm">
              {post.content}
            </p>

            {post.image && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-100">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 border-t border-slate-100 pt-4">
              <button
                onClick={() => onLike(post.id, likedPosts.has(post.id))}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${likedPosts.has(post.id) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <ThumbsUp size={16} className={likedPosts.has(post.id) ? 'fill-indigo-600' : ''} />
                {post.likes > 0 && post.likes}
                <span className="hidden sm:inline">
                  {likedPosts.has(post.id) ? 'Liked' : 'Like'}
                </span>
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                  expandedComments.has(post.id)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">
                  {post.commentCount > 0 ? `${post.commentCount} Comments` : 'Comment'}
                </span>
              </button>

              <button
                onClick={() => handleShare(post.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${sharedPostIds.has(post.id) ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'}`}
              >
                <Share2 size={16} className={sharedPostIds.has(post.id) ? 'scale-110' : ''} />
                <span className="hidden sm:inline">
                  {sharedPostIds.has(post.id) ? 'Copied' : 'Share'}
                </span>
              </button>
            </div>

            {/* Comments */}
            {expandedComments.has(post.id) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                {post.comments?.length === 0 && (
                  <p className="text-sm text-slate-500 font-medium">No comments yet. Start the conversation.</p>
                )}
                {post.comments?.map((c) => (
                  <div key={c.id} className="group">
                    <div className="flex gap-3 items-start">
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="bg-slate-50 rounded-xl px-4 py-3 inline-block">
                          <p className="text-xs font-bold text-slate-900 mb-1">{c.author}</p>
                          <p className="text-sm text-slate-700">{c.text}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-2 text-[12px] font-semibold text-slate-500">
                          <button
                            onClick={() =>
                              setReplyBoxes((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                            }
                            className="hover:text-slate-800 transition-colors"
                          >
                            Reply
                          </button>
                          <span className="text-slate-400 font-normal">{c.time || 'Just now'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Replies section */}
                    {(c.replies?.length > 0 || replyBoxes[c.id]) && (
                      <div className="ml-11 mt-3 space-y-3">
                        {c.replies?.map((r) => (
                          <div key={r.id} className="flex gap-2 items-start">
                            <img
                              src={r.avatar}
                              alt={r.author}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1">
                              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 inline-block">
                                <p className="text-[12px] font-bold text-slate-900 mb-0.5">
                                  {r.author}
                                </p>
                                <p className="text-[13px] text-slate-700">{r.text}</p>
                              </div>
                              <div className="mt-0.5 ml-2 text-[11px] font-semibold text-slate-500">
                                <span className="text-slate-400 font-normal">
                                  {r.time || 'Just now'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {replyBoxes[c.id] && (
                          <div className="flex gap-2 mt-2">
                            <img
                              src={currentUserAvatar}
                              alt="You"
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-1"
                            />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                placeholder="Write a reply…"
                                value={replyInputs[c.id] || ''}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({ ...prev, [c.id]: e.target.value }))
                                }
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && handleReplySubmit(post.id, c.id)
                                }
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[13px] focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <button
                                onClick={() => handleReplySubmit(post.id, c.id)}
                                disabled={!replyInputs[c.id]?.trim() || submittingReplyFor === c.id}
                                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-40"
                              >
                                {submittingReplyFor === c.id ? '...' : <Send size={12} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Comment input */}
                <div className="flex gap-3 mt-3">
                  <img
                    src={currentUserAvatar}
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment…"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={
                        !commentInputs[post.id]?.trim() || submittingCommentFor === post.id
                      }
                      className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-40"
                    >
                      {submittingCommentFor === post.id ? '...' : <Send size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 2) CHAT TAB
// ═══════════════════════════════════════════════════════════════
const ChatTab = ({ messages, onSend }) => {
  const [chatMsg, setChatMsg] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    onSend(chatMsg)
    setChatMsg('')
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-150 overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <div>
            <p className="text-sm font-bold text-slate-900">Group Chat</p>
            <p className="text-xs text-slate-500 font-medium">{messages?.length ?? 0} messages</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/60">
          <div className="text-center">
            <span className="inline-block bg-slate-200/80 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
              Today
            </span>
          </div>
          {(messages || []).map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
              {!msg.isMe &&
                (msg.avatar ? (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    {msg.initials || msg.sender?.substring(0, 2)}
                  </div>
                ))}
              <div className={`flex flex-col gap-1 max-w-[75%] ${msg.isMe ? 'items-end' : ''}`}>
                {!msg.isMe && (
                  <span className="text-xs font-bold text-slate-500 px-1">{msg.sender}</span>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`flex gap-1.5 text-[11px] font-medium px-1 ${msg.isMe ? '' : ''}`}>
                  <span className="text-slate-400">{msg.time}</span>
                  {msg.isMe && (
                    <span className="text-indigo-400 font-bold">{msg.status || 'Sent'}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all flex items-center gap-2">
              <textarea
                rows="1"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-slate-900 placeholder:text-slate-400 py-1.5 max-h-24"
              />
            </div>
            <button
              type="submit"
              disabled={!chatMsg.trim()}
              className="w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} className="ml-0.5 -rotate-45" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3) MEMBERS TAB
// ═══════════════════════════════════════════════════════════════
const MembersTab = ({
  members,
  joinRequests,
  isAdmin,
  onApproveRequest,
  onRejectRequest,
  onRemoveMember,
  onPromoteMember,
}) => {
  const [search, setSearch] = useState('')
  const [showRequests, setShowRequests] = useState(true)

  const filtered = (members || []).filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.title?.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = {
    Owner: filtered.filter((m) => m.role === 'Owner'),
    Moderator: filtered.filter((m) => m.role === 'Moderator'),
    Member: filtered.filter((m) => m.role === 'Member'),
  }

  const pendingRequests = joinRequests || []

  return (
    <div className="space-y-5">
      {/* Pending Join Requests (Admin-only) */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowRequests((s) => !s)}
            className="w-full px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Pending Requests</p>
                <p className="text-xs text-slate-500">{pendingRequests.length} awaiting approval</p>
              </div>
              <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </div>
            {showRequests ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {showRequests && (
            <div className="border-t border-amber-100 divide-y divide-slate-100">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-5 flex items-start gap-4">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{req.name}</p>
                    <p className="text-xs text-slate-500 font-medium mb-1">{req.title}</p>
                    {req.message && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 rounded-lg px-3 py-2 mt-2">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">{req.requestedAt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
            />
          </div>
        </div>

        {/* Members by role */}
        {['Owner', 'Moderator', 'Member'].map((role) => {
          const group = grouped[role]
          if (!group.length) return null
          return (
            <div key={role}>
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  {ROLE_ICONS[role]}
                  {role}s <span className="text-slate-400">({group.length})</span>
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {group.map((m) => (
                  <div
                    key={m.id}
                    className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${m.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_BADGE[m.role]}`}
                          >
                            {m.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">{m.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Joined {m.joinedAt}
                        </p>
                      </div>
                    </div>
                    {isAdmin && m.role !== 'Owner' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            onPromoteMember(
                              m.id,
                              m.roleValue === 'moderator' ? 'member' : 'moderator'
                            )
                          }
                          title={
                            m.role === 'Moderator' ? 'Demote to Member' : 'Promote to Moderator'
                          }
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <UserCheck size={15} />
                        </button>
                        <button
                          onClick={() => onRemoveMember(m.id)}
                          title="Remove Member"
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <UserMinus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4) EVENTS TAB
// ═══════════════════════════════════════════════════════════════
const EventsTab = ({ events, isAdmin, onRegister, onCancelRsvp }) => {
  const navigate = useNavigate()
  const [sharedEventIds, setSharedEventIds] = useState(new Set())

  const handleShare = async (eventId) => {
    await navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`)
    setSharedEventIds((prev) => new Set(prev).add(eventId))
    setTimeout(() => {
      setSharedEventIds((prev) => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    }, 2000)
  }

  return (
    <div className="space-y-5">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <Calendar size={16} /> View Events Calendar
          </button>
        </div>
      )}
      {(!events || events.length === 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 mb-1">No upcoming events</p>
          <p className="text-sm text-slate-500">
            Check back later for events organized by this group.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-5">
        {(events || []).map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all"
          >
            <div className="sm:w-48 h-36 sm:h-auto shrink-0">
              <img src={evt.cover} alt={evt.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${evt.type === 'Virtual' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}
                >
                  {evt.type}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-3">{evt.title}</h3>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Clock size={13} className="text-indigo-500" /> {evt.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Users size={13} className="text-indigo-500" /> {evt.attendees} attending
                </div>
              </div>
              <div className="mt-auto flex items-center gap-3">
                <button
                  onClick={() =>
                    evt.isRegistered ? onCancelRsvp(evt.id) : onRegister(evt.id)
                  }
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition flex items-center gap-2 ${
                    evt.isRegistered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  }`}
                >
                  {evt.isRegistered ? (
                    <>
                      <CheckCircle size={15} /> RSVPed
                    </>
                  ) : (
                    <>
                      <Calendar size={15} /> RSVP
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleShare(evt.id)}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  {sharedEventIds.has(evt.id) ? 'Copied' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 5) JOBS TAB
// ═══════════════════════════════════════════════════════════════
const JobsTab = ({ jobs, canPost }) => {
  const JOB_TYPE_COLORS = {
    'Full-time': 'bg-emerald-50 text-emerald-700',
    'Part-time': 'bg-blue-50 text-blue-700',
    Internship: 'bg-purple-50 text-purple-700',
    Contract: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="space-y-5">
      {canPost && (
        <div className="flex justify-end">
          <button className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
            <Briefcase size={16} /> Post a Job
          </button>
        </div>
      )}
      {(!jobs || jobs.length === 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Briefcase size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 mb-1">No job posts yet</p>
          <p className="text-sm text-slate-500">Alumni members can post opportunities here.</p>
        </div>
      )}
      <div className="space-y-4">
        {(jobs || []).map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all hover:border-indigo-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 size={13} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{job.company}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${JOB_TYPE_COLORS[job.type] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {job.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin size={12} className="text-indigo-400" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock size={12} className="text-indigo-400" /> {job.postedAt}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
                    View & Apply
                  </button>
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition">
                    Save
                  </button>
                  <span className="text-xs text-slate-400 font-medium ml-auto">
                    Posted by {job.postedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 6) ABOUT TAB
// ═══════════════════════════════════════════════════════════════
const AboutTab = ({ group }) => {
  if (!group) return null
  const ROLE_ICONS_ABOUT = {
    Owner: <Crown size={14} className="text-amber-500" />,
    Moderator: <Shield size={14} className="text-indigo-500" />,
  }
  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" /> About this group
        </h3>
        <p className="text-slate-600 leading-relaxed">{group.description}</p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Type', value: group.type, icon: '🏷️' },
            { label: 'Category', value: group.category, icon: '📂' },
            {
              label: 'Privacy',
              value: group.isPrivate ? 'Private' : 'Public',
              icon: group.isPrivate ? '🔒' : '🌐',
            },
            { label: 'Members', value: group.membersCount?.toLocaleString(), icon: '👥' },
            { label: 'Created', value: group.createdAt, icon: '📅' },
            {
              label: 'Status',
              value: group.status?.charAt(0).toUpperCase() + group.status?.slice(1),
              icon: '✅',
            },
          ].map((info) => (
            <div key={info.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-lg mb-1">{info.icon}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                {info.label}
              </p>
              <p className="text-sm font-bold text-slate-900">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {group.tags?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((t) => (
              <span
                key={t}
                className="bg-indigo-50 text-indigo-700 text-sm font-bold px-4 py-2 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Admins */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-600" />
          <h3 className="font-extrabold text-slate-900">Admins & Moderators</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {(group.admins || []).map((admin) => (
            <div key={admin.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    {ROLE_ICONS_ABOUT[admin.role]}
                    <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{admin.role}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50">
                <Mail size={14} /> {admin.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      {group.rules?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900">Community Rules</h3>
          </div>
          <div className="p-5">
            <ol className="space-y-4">
              {group.rules.map((rule, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed pt-0.5">{rule}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN ClubDetail COMPONENT
// ═══════════════════════════════════════════════════════════════
const ClubDetail = ({ groupId }) => {
  const { user } = useAuth()
  const {
    clubs,
    posts,
    members,
    joinRequests,
    messages,
    events,
    joinedIds,
    pendingIds,
    joinClub,
    leaveClub,
    cancelRequest,
    fetchPosts,
    fetchMembers,
    fetchJoinRequests,
    fetchChat,
    createPost,
    deletePost,
    likePost,
    pinPost,
    addComment,
    approveJoinRequest,
    rejectJoinRequest,
    removeMember,
    promoteMember,
    sendMessage,
    fetchEvents,
    registerForEvent,
    cancelEventRsvp,
  } = useClubs()

  const group = clubs.find((c) => String(c.id) === String(groupId)) || clubs[0]
  const [activeTab, setActiveTab] = useState('feed')

  const isJoined = joinedIds.has(group?.id)
  const isPending = pendingIds.has(group?.id)
  const isAdmin = user?.role === 'admin'
  // Treat the current user as a group admin if they're in the members list as Owner/Moderator
  const isGroupAdmin =
    isAdmin ||
    (members[group?.id] || []).some(
      (m) =>
        String(m.userId) === String(user?.id) &&
        ['owner', 'admin', 'moderator'].includes(m.roleValue)
    )

  const groupPosts = posts[group?.id] || []
  const groupMembers = members[group?.id] || []
  const groupRequests = joinRequests[group?.id] || []
  const groupMessages = messages[group?.id] || []
  const groupEvents = events[group?.id] || []
  const likedPosts = new Set(groupPosts.filter((post) => post.isLiked).map((post) => post.id))

  useEffect(() => {
    if (!group?.id) return
    fetchPosts(group.id)
    fetchMembers(group.id)
    fetchChat(group.id)
    fetchEvents(group.id)
    if (isGroupAdmin) {
      fetchJoinRequests(group.id)
    }
  }, [group?.id, isGroupAdmin, fetchPosts, fetchMembers, fetchChat, fetchEvents, fetchJoinRequests])

  const handleJoinToggle = () => {
    if (isJoined) {
      leaveClub(group.id)
      return
    }
    if (isPending) {
      cancelRequest(group.id)
      return
    }
    joinClub(group.id)
  }

  const handleLike = (postId, alreadyLiked) => {
    likePost(group.id, postId, alreadyLiked)
  }

  if (!group) return null

  const joinBtnConfig = isJoined
    ? {
        label: 'Leave Group',
        cls: 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200',
      }
    : isPending
      ? {
          label: 'Cancel Request',
          cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
        }
      : group.isPrivate
        ? {
            label: 'Request to Join',
            cls: 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-900 border-transparent',
          }
        : {
            label: 'Join Group',
            cls: 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-900 border-transparent',
          }

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Group Hero Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 md:h-60 w-full bg-slate-100 relative">
          {group.coverPhoto && (
            <img src={group.coverPhoto} alt={group.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
          {/* Privacy badge */}
          <div className="absolute top-4 right-4">
            {group.isPrivate ? (
              <div className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                <Lock size={13} /> Private
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <Globe size={13} className="text-emerald-600" /> Public
              </div>
            )}
          </div>
        </div>

        {/* Content below cover */}
        <div className="px-6 md:px-8 pb-0 pt-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-16 md:-mt-20 relative z-10">
            {/* Title */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                  {group.type}
                </span>
                <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                  {group.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md mb-2">
                {group.name}
              </h1>
              <p className="text-slate-200 text-sm font-medium line-clamp-2 drop-shadow-sm">
                {group.description}
              </p>
            </div>

            {/* Member stack + join button */}
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0 mt-2 md:mt-0">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <div className="flex -space-x-2">
                  {(group.memberAvatars || []).slice(0, 5).map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ))}
                </div>
                <span className="text-white text-sm font-bold">
                  +{(group.membersCount || group.members_count || 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={handleJoinToggle}
                className={`w-full md:w-auto px-7 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm border ${joinBtnConfig.cls}`}
              >
                {isJoined ? (
                  <>
                    <ShieldCheck size={16} className="text-emerald-500" /> Joined
                  </>
                ) : isPending ? (
                  <>
                    <Clock size={16} /> Requested
                  </>
                ) : (
                  <>
                    <Users size={16} /> {joinBtnConfig.label}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-5 flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-slate-200 -mx-6 md:-mx-8 px-6 md:px-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-4 text-sm font-bold whitespace-nowrap relative transition-colors ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {React.cloneElement(tab.icon, {
                  className: activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400',
                })}
                {tab.label}
                {tab.id === 'members' && groupRequests.length > 0 && isGroupAdmin && (
                  <span className="ml-1 w-4 h-4 flex items-center justify-center bg-amber-500 text-white text-[9px] font-black rounded-full">
                    {groupRequests.length}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Tab Content ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {activeTab === 'feed' && (
            <FeedTab
              clubId={group.id}
              user={user}
              posts={groupPosts}
              isAdmin={isGroupAdmin}
              likedPosts={likedPosts}
              onCreatePost={(postData) => createPost(group.id, postData)}
              onLike={handleLike}
              onDelete={(postId) => deletePost(group.id, postId)}
              onPin={(postId) => pinPost(group.id, postId)}
              onComment={(postId, content) => addComment(group.id, postId, content)}
              onReply={(postId, commentId, content) =>
                addComment(group.id, postId, content, commentId)
              }
            />
          )}
          {activeTab === 'chat' && (
            <ChatTab
              clubId={group.id}
              messages={groupMessages}
              onSend={(msg) => sendMessage(group.id, msg)}
            />
          )}
          {activeTab === 'members' && (
            <MembersTab
              clubId={group.id}
              members={groupMembers}
              joinRequests={groupRequests}
              isAdmin={isGroupAdmin}
              onApproveRequest={(reqId) => approveJoinRequest(group.id, reqId)}
              onRejectRequest={(reqId) => rejectJoinRequest(group.id, reqId)}
              onRemoveMember={(memberId) => removeMember(group.id, memberId)}
              onPromoteMember={(memberId) => promoteMember(group.id, memberId)}
            />
          )}
          {activeTab === 'events' && (
            <EventsTab
              events={groupEvents}
              isAdmin={isGroupAdmin}
              onRegister={(eventId) => registerForEvent(group.id, eventId)}
              onCancelRsvp={(eventId) => cancelEventRsvp(group.id, eventId)}
            />
          )}
          {activeTab === 'about' && <AboutTab group={group} />}
        </div>
        {/* ── Right Sidebar ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={18} className="text-indigo-600" /> Group Info
            </h3>
            <div className="space-y-4 text-sm font-medium text-slate-600">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-400" /> Type
                </span>
                <span className="text-slate-900 font-bold">
                  {group.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" /> Members
                </span>
                <span className="text-slate-900 font-bold">
                  {group.membersCount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" /> Created By
                </span>
                <span className="text-slate-900 font-bold">{group.createdByName || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClubDetail
