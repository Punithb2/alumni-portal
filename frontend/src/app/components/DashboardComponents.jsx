import React, { useState, useRef, useEffect } from 'react'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  X,
  Image as ImageIcon,
  Smile,
  ChevronDown,
  Check,
  UserPlus,
  UserCheck,
  Flag,
  Link2,
  BellOff,
  AlertCircle,
} from 'lucide-react'
import { POST_TYPES, REACTIONS } from '../data/feedStore'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const totalReactions = (r = {}) => Object.values(r).reduce((a, b) => a + b, 0)

const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n)

/* ─── Stories / Online Avatars Row ──────────────────────────────────────── */
export const OnlineHighlightRow = ({
  title = "Who's Online",
  subtitle = "Don't walk alone, connect locally",
  users,
  actionText = 'See all',
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
    <div className="flex justify-between items-center mb-4 px-1">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
        <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
        {subtitle && (
          <span className="text-[12px] text-slate-400 font-medium ml-1 hidden sm:inline">
            - {subtitle}
          </span>
        )}
      </div>
      <button className="text-[12px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors">
        {actionText}
      </button>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-1">
      {users.map((u, i) => (
        <button
          key={i}
          title={u.title}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 group focus:outline-none"
        >
          <div className="relative">
            <div
              className={`p-0.5 rounded-full ${u.online ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500' : 'bg-slate-200'}`}
            >
              <div className="p-0.5 bg-white rounded-full">
                <img
                  src={u.src}
                  alt={u.title}
                  className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
            {u.online && (
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[56px]">
            {u.title}
          </span>
        </button>
      ))}
    </div>
  </div>
)

/* ─── Emoji Picker ───────────────────────────────────────────────────────── */
const EmojiPicker = ({ onPick, onClose }) => (
  <div className="absolute bottom-full mb-2 left-0 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl px-3 py-2 flex gap-2 animate-fade-in">
    {REACTIONS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => {
          onPick(emoji)
          onClose()
        }}
        className="text-[22px] hover:scale-125 transition-transform duration-150 focus:outline-none"
        title={emoji}
      >
        {emoji}
      </button>
    ))}
  </div>
)

/* ─── Image Grid (Instagram-style) ──────────────────────────────────────── */
const ImageGrid = ({ images }) => {
  if (!images || images.length === 0) return null
  if (images.length === 1)
    return (
      <div className="w-full max-h-[480px] overflow-hidden bg-slate-100 cursor-pointer">
        <img
          src={images[0]}
          alt="post"
          className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
        />
      </div>
    )
  if (images.length === 2)
    return (
      <div className="grid grid-cols-2 gap-0.5 bg-slate-100 cursor-pointer max-h-[360px]">
        {images.map((src, i) => (
          <div key={i} className="overflow-hidden bg-slate-200">
            <img
              src={src}
              alt={`post ${i}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 min-h-[240px]"
            />
          </div>
        ))}
      </div>
    )
  // 3+ image mosaic
  return (
    <div
      className="grid gap-0.5 bg-slate-100 cursor-pointer max-h-[400px]"
      style={{ gridTemplateColumns: '2fr 1fr' }}
    >
      <div className="overflow-hidden bg-slate-200">
        <img
          src={images[0]}
          alt="post 0"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 min-h-[400px]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        {images.slice(1, 3).map((src, i) => (
          <div key={i} className="overflow-hidden bg-slate-200 flex-1 relative">
            <img
              src={src}
              alt={`post ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {i === 1 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+{images.length - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── More Options Dropdown ──────────────────────────────────────────────── */
const MoreOptions = ({ onClose }) => {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  const items = [
    { icon: <Bookmark size={15} />, label: 'Save post' },
    { icon: <Link2 size={15} />, label: 'Copy link' },
    { icon: <BellOff size={15} />, label: 'Mute author' },
    { icon: <AlertCircle size={15} />, label: 'Not interested' },
    { icon: <Flag size={15} />, label: 'Report post', danger: true },
  ]
  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-52 bg-white border border-slate-200 shadow-lg rounded-2xl py-1.5 overflow-hidden animate-fade-in"
    >
      {items.map(({ icon, label, danger }) => (
        <button
          key={label}
          onClick={onClose}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left hover:bg-slate-50 ${danger ? 'text-rose-500' : 'text-slate-700'}`}
        >
          <span className={danger ? 'text-rose-400' : 'text-slate-400'}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Single Comment Item ────────────────────────────────────────────────── */
const CommentItem = ({ c, currentUser, depth = 0 }) => {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState(c.replies || [])
  const [commentLike, setCommentLike] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const sendReply = () => {
    if (!replyText.trim()) return
    setReplies((prev) => [
      {
        id: Date.now(),
        author: (currentUser?.displayName || currentUser?.name || 'You').split(' ')[0],
        avatar: currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg',
        text: replyText.trim(),
        time: 'Just now',
        likes: 0,
      },
      ...prev,
    ])
    setReplyText('')
    setReplyOpen(false)
    setShowReplies(true)
  }

  return (
    <div className={depth > 0 ? 'ml-10 mt-2' : ''}>
      <div className="flex gap-2.5 items-start">
        <img
          src={c.avatar}
          alt={c.author}
          className={`rounded-full object-cover flex-shrink-0 border border-slate-200 ${depth > 0 ? 'w-6 h-6' : 'w-8 h-8'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="inline-block bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-[13px] text-slate-800 max-w-full">
            <p className="font-bold text-slate-900 text-[12px] hover:text-indigo-600 cursor-pointer mb-0.5 truncate">
              {c.author}
            </p>
            <p className="leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] font-semibold text-slate-400">
            <button
              onClick={() => setCommentLike(!commentLike)}
              className={`transition-colors flex items-center gap-1 ${commentLike ? 'text-rose-500' : 'hover:text-slate-700'}`}
            >
              <Heart size={11} className={commentLike ? 'fill-rose-500' : ''} />
              <span>{(c.likes || 0) + (commentLike ? 1 : 0)}</span>
            </button>
            {depth === 0 && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="hover:text-slate-700 transition-colors"
              >
                Reply
              </button>
            )}
            <span className="font-normal">{c.time || 'Just now'}</span>
          </div>

          {/* Replies toggle */}
          {depth === 0 && replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mt-1.5 ml-1 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <ChevronDown
                size={13}
                className={`transition-transform ${showReplies ? 'rotate-180' : ''}`}
              />
              {showReplies
                ? 'Hide replies'
                : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}

          {/* Replies */}
          {showReplies &&
            replies.map((r) => (
              <CommentItem key={r.id} c={r} currentUser={currentUser} depth={depth + 1} />
            ))}

          {/* Reply input */}
          {replyOpen && (
            <div className="flex gap-2 items-center mt-2">
              <img
                src={
                  currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg'
                }
                alt="You"
                className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-slate-200"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder={`Reply to ${c.author}...`}
                  className="w-full border border-slate-200 bg-white rounded-full pl-3 pr-9 py-1.5 text-[12px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className={`absolute right-1 top-1 bottom-1 w-7 flex items-center justify-center rounded-full transition-all ${replyText.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <Send size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Feed Post ──────────────────────────────────────────────────────────── */
export const FeedPost = ({ post, currentUser }) => {
  const [reactions, setReactions] = useState(post.reactions || {})
  const [myReaction, setMyReaction] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [showAllComments, setShowAllComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(
    Array.isArray(post.mockComments) ? post.mockComments : []
  )
  const [shared, setShared] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [following, setFollowing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  const reactionRef = useRef(null)
  const reactionTimerRef = useRef(null)

  // Close reaction picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target))
        setShowReactionPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleReact = (emoji) => {
    setReactions((prev) => {
      const next = { ...prev }
      if (myReaction && myReaction !== emoji) {
        next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1)
        if (next[myReaction] === 0) delete next[myReaction]
      }
      if (myReaction === emoji) {
        next[emoji] = Math.max(0, (next[emoji] || 1) - 1)
        if (next[emoji] === 0) delete next[emoji]
        setMyReaction(null)
      } else {
        next[emoji] = (next[emoji] || 0) + 1
        setMyReaction(emoji)
      }
      return next
    })
    if (myReaction !== emoji) setMyReaction(emoji)
    else setMyReaction(null)
  }

  const handleQuickLike = () => {
    handleReact('👍')
    setShowReactionPicker(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const sendComment = () => {
    if (!commentText.trim()) return
    const newComment = {
      id: Date.now(),
      author: (currentUser?.displayName || currentUser?.name || 'You').split(' ')[0],
      avatar: currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg',
      text: commentText.trim(),
      time: 'Just now',
      likes: 0,
      replies: [],
    }
    setComments((prev) => [newComment, ...prev])
    setCommentText('')
    setShowComments(true)
    setShowAllComments(true)
  }

  const postType = POST_TYPES[post.type] || POST_TYPES.UPDATE
  const requiresTruncation = post.content.split('\n').length > 3 || post.content.length > 200
  const totalReactionCount = totalReactions(reactions)
  const topReactionEmojis = Object.entries(reactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e)
  const displayedComments = showAllComments ? comments : comments.slice(0, 2)
  const hiddenCount = comments.length - displayedComments.length

  const isOwnPost = post.author === (currentUser?.displayName || currentUser?.name)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* ── Header ── */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center gap-3 min-w-0">
          <button className="focus:outline-none flex-shrink-0">
            <img
              src={post.avatar}
              alt={post.author}
              className="w-11 h-11 rounded-full object-cover border border-slate-100 hover:ring-2 ring-indigo-200 transition-all"
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button className="font-bold text-slate-900 text-[14px] hover:text-indigo-600 transition-colors focus:outline-none truncate">
                {post.author}
              </button>
              {post.verified && post.verifiedType === 'official' && (
                <span title="Verified Official" className="text-[13px]">
                  ✅
                </span>
              )}
              {post.verified && post.verifiedType === 'alumni' && (
                <span
                  title="Verified Alumni"
                  className="inline-flex items-center justify-center w-4 h-4 bg-indigo-600 rounded-full text-white text-[9px] font-bold leading-none"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <p className="text-[12px] text-slate-500 font-medium leading-tight truncate max-w-[160px] sm:max-w-none">
                {post.role}
              </p>
              <span className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
                {post.time}
              </span>
            </div>
            {/* Post type badge */}
            <span
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${postType.color}`}
            >
              {postType.icon} {postType.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {!isOwnPost && (
            <button
              onClick={() => setFollowing(!following)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${following ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
              {following ? 'Following' : 'Follow'}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <MoreHorizontal size={20} />
            </button>
            {showOptions && <MoreOptions onClose={() => setShowOptions(false)} />}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-3">
        <p
          className={`text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap ${!isContentExpanded && requiresTruncation ? 'line-clamp-3' : ''}`}
        >
          {post.content}
        </p>
        {requiresTruncation && (
          <button
            onClick={() => setIsContentExpanded(!isContentExpanded)}
            className="text-indigo-600 hover:text-indigo-800 text-[13px] font-semibold mt-1 focus:outline-none"
          >
            {isContentExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* ── Image Grid ── */}
      <ImageGrid images={post.images} />

      {/* ── Reaction Summary ── */}
      {totalReactionCount > 0 && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <div className="flex">
              {topReactionEmojis.map((e, i) => (
                <span key={i} className="text-[16px] -ml-1 first:ml-0">
                  {e}
                </span>
              ))}
            </div>
            <span className="text-[13px] text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">
              {myReaction
                ? `You${totalReactionCount > 1 ? ` and ${formatCount(totalReactionCount - 1)} others` : ''}`
                : formatCount(totalReactionCount)}
            </span>
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[13px] text-slate-500 font-medium hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="px-1 py-0.5 border-t border-slate-100 flex items-center">
        {/* Reaction button with long-press picker */}
        <div ref={reactionRef} className="relative flex-1">
          <button
            onClick={handleQuickLike}
            onMouseEnter={() => {
              reactionTimerRef.current = setTimeout(() => setShowReactionPicker(true), 400)
            }}
            onMouseLeave={() => {
              clearTimeout(reactionTimerRef.current)
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[13px] font-medium ${myReaction ? 'text-rose-500 font-bold bg-rose-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            {myReaction ? (
              <span className="text-[18px] leading-none">{myReaction}</span>
            ) : (
              <Heart size={19} />
            )}
            <span>{myReaction || 'Like'}</span>
          </button>
          {showReactionPicker && (
            <EmojiPicker onPick={handleReact} onClose={() => setShowReactionPicker(false)} />
          )}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[13px] font-medium ${showComments ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <MessageCircle size={19} />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[13px] font-medium ${shared ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          {shared ? <Check size={19} /> : <Share2 size={19} />}
          <span>{shared ? 'Copied!' : 'Share'}</span>
        </button>

        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`w-11 flex items-center justify-center py-2.5 rounded-xl transition-all ${bookmarked ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Bookmark size={19} className={bookmarked ? 'fill-indigo-600' : ''} />
        </button>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white">
          {/* Comment Input */}
          <div className="flex gap-2.5 items-center mt-3 mb-4">
            <img
              src={
                currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg'
              }
              alt="You"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                placeholder="Write a comment..."
                className="w-full border border-slate-200 bg-slate-50 rounded-full pl-4 pr-10 py-2 text-[13px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                onClick={sendComment}
                disabled={!commentText.trim()}
                className={`absolute right-1.5 top-1.5 bottom-1.5 w-7 flex items-center justify-center rounded-full transition-all ${commentText.trim() ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-300 cursor-not-allowed'}`}
              >
                <Send size={13} />
              </button>
            </div>
          </div>

          {/* View more (at top, like Instagram) */}
          {!showAllComments && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllComments(true)}
              className="flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
            >
              <ChevronDown size={15} />
              View {hiddenCount} more {hiddenCount === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {displayedComments.map((c) => (
                <CommentItem key={c.id} c={c} currentUser={currentUser} />
              ))}
              {showAllComments && comments.length > 2 && (
                <button
                  onClick={() => setShowAllComments(false)}
                  className="text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors mt-1"
                >
                  Show fewer comments
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Post Composer Modal ────────────────────────────────────────────────── */
const EMOJI_LIST = [
  '😀',
  '😂',
  '😍',
  '🥳',
  '😎',
  '🤔',
  '😢',
  '😮',
  '🔥',
  '❤️',
  '👍',
  '👏',
  '🎉',
  '💡',
  '🚀',
  '💪',
  '🎯',
  '📅',
  '🌟',
  '💼',
]

const PostComposerModal = ({ currentUser, onClose, onPost }) => {
  const [text, setText] = useState('')
  const [postType, setPostType] = useState('UPDATE')
  const [images, setImages] = useState([])
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const MAX_CHARS = 500
  const remaining = MAX_CHARS - text.length
  const progress = Math.min(text.length / MAX_CHARS, 1)
  const circumference = 2 * Math.PI * 10

  useEffect(() => {
    textareaRef.current?.focus()
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setImages((prev) => [...prev, ev.target.result].slice(0, 4))
      reader.readAsDataURL(file)
    })
  }

  const handlePost = () => {
    if (!text.trim()) return
    onPost?.({ text: text.trim(), postType, images })
    onClose()
  }

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const newText = text.slice(0, start) + emoji + text.slice(ta.selectionEnd)
    setText(newText)
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length
      ta.focus()
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-[16px]">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post type tabs */}
        <div className="flex gap-2 px-5 pt-4 pb-2 overflow-x-auto scrollbar-none">
          {Object.entries(POST_TYPES).map(([key, { label, icon, color }]) => (
            <button
              key={key}
              onClick={() => setPostType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${postType === key ? `${color} border-transparent ring-2 ring-offset-1 ring-indigo-300` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3 px-5 py-3">
          <img
            src={currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg'}
            alt="You"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900 text-[14px]">
              {currentUser?.displayName || currentUser?.name || 'You'}
            </p>
            <p className="text-[12px] text-slate-400 font-medium">Sharing with everyone</p>
          </div>
        </div>

        {/* Textarea */}
        <div className="px-5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setText(e.target.value)
                autoResize(e)
              }
            }}
            placeholder={
              postType === 'QUESTION'
                ? 'Ask your network something...'
                : postType === 'ACHIEVEMENT'
                  ? 'Share a win or milestone...'
                  : postType === 'EVENT'
                    ? 'Share an event or opportunity...'
                    : "What's on your mind?"
            }
            rows={3}
            className="w-full text-[15px] text-slate-800 placeholder-slate-400 resize-none focus:outline-none leading-relaxed min-h-[80px]"
            style={{ height: 'auto' }}
          />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-none">
            {images.map((src, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <div className="px-5 py-2 flex flex-wrap gap-1.5 border-t border-b border-slate-100 bg-slate-50">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-[20px] hover:scale-125 transition-transform p-0.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Footer toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImagePick}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Add photo"
            >
              <ImageIcon size={20} />
            </button>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className={`p-2 rounded-xl hover:bg-slate-100 transition-colors ${showEmoji ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600'}`}
              title="Emoji"
            >
              <Smile size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Char counter ring */}
            {text.length > 0 && (
              <div className="relative w-7 h-7 flex items-center justify-center">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke={remaining < 50 ? (remaining < 20 ? '#ef4444' : '#f59e0b') : '#6366f1'}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
                {remaining < 50 && (
                  <span
                    className={`absolute text-[9px] font-bold ${remaining < 20 ? 'text-red-500' : 'text-amber-500'}`}
                  >
                    {remaining}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handlePost}
              disabled={!text.trim()}
              className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all ${text.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── PostComposer (trigger bar) ─────────────────────────────────────────── */
export const PostComposer = ({ currentUser, placeholder = "What's on your mind...?", onPost }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
        <div className="flex gap-3 items-center">
          <img
            src={currentUser?.avatar || 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg'}
            alt="You"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          <button
            onClick={() => setOpen(true)}
            className="flex-1 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all rounded-full px-5 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-slate-100"
          >
            <span className="text-[14px] text-slate-400 font-medium">{placeholder}</span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
          >
            <ImageIcon size={18} />
          </button>
        </div>
      </div>
      {open && (
        <PostComposerModal
          currentUser={currentUser}
          onClose={() => setOpen(false)}
          onPost={onPost}
        />
      )}
    </>
  )
}
