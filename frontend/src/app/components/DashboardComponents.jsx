import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  X,
  Smile,
  Check,
  UserPlus,
  UserCheck,
  Clock3,
} from 'lucide-react'
import { REACTIONS } from '../constants/feed'
import { getAvatarDataUrl } from '../utils/avatar'

const totalReactions = (reactions = {}) =>
  Object.values(reactions).reduce((sum, value) => sum + Number(value || 0), 0)

const formatCount = (value) => {
  const number = Number(value || 0)
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k`
  return number
}

const formatFollowState = (status) => {
  if (status === 'connected') {
    return {
      icon: <UserCheck size={13} />,
      label: 'Following',
      className: 'bg-slate-100 text-slate-600 cursor-default',
      disabled: true,
    }
  }

  if (status === 'outgoing_pending') {
    return {
      icon: <Clock3 size={13} />,
      label: 'Requested',
      className: 'bg-amber-50 text-amber-700 cursor-default',
      disabled: true,
    }
  }

  if (status === 'incoming_pending') {
    return {
      icon: <UserPlus size={13} />,
      label: 'Pending request',
      className: 'bg-slate-100 text-slate-600 cursor-default',
      disabled: true,
    }
  }

  return {
    icon: <UserPlus size={13} />,
    label: 'Follow',
    className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    disabled: false,
  }
}

export const OnlineHighlightRow = ({
  title = "Who's Online",
  subtitle = "Don't walk alone, connect locally",
  users = [],
  actionText = 'See all',
  actionTo = null,
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
      {actionTo ? (
        <Link
          to={actionTo}
          className="text-[12px] text-indigo-600 font-semibold hover:text-indigo-800"
        >
          {actionText}
        </Link>
      ) : (
        <span className="text-[12px] text-indigo-600 font-semibold">{actionText}</span>
      )}
    </div>
    {users.length > 0 ? (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-1">
        {users.map((user, index) => (
          <div
            key={`${user.title}-${index}`}
            className="flex-shrink-0 flex flex-col items-center gap-1.5"
          >
            <div className="relative">
              <div
                className={`p-0.5 rounded-full ${user.online ? 'bg-linear-to-tr from-indigo-500 via-fuchsia-500 to-emerald-500' : 'bg-slate-200'}`}
              >
                <div className="p-0.5 bg-white rounded-full">
                  <img
                    src={user.src}
                    alt={user.title}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              {user.online && (
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[56px]">
              {user.title}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="px-1 text-[13px] text-slate-500">No active members to show yet.</p>
    )}
  </div>
)

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

const MoreOptions = ({ onCopyLink, onClose }) => {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-44 bg-white border border-slate-200 shadow-lg rounded-2xl py-1.5 overflow-hidden animate-fade-in"
    >
      <button
        onClick={() => {
          onCopyLink()
          onClose()
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
      >
        <Share2 size={15} className="text-slate-400" />
        Copy link
      </button>
    </div>
  )
}

const CommentItem = ({ comment }) => (
  <div className="flex gap-2.5 items-start">
    <img
      src={comment.avatar}
      alt={comment.author}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
    />
    <div className="flex-1 min-w-0">
      <div className="inline-block bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-[13px] text-slate-800 max-w-full">
        <p className="font-bold text-slate-900 text-[12px] mb-0.5 truncate">{comment.author}</p>
        <p className="leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
      <div className="mt-1 ml-1 text-[11px] text-slate-400 font-medium">{comment.time}</div>
    </div>
  </div>
)

export const FeedPost = ({
  post,
  currentUser,
  onFollow,
  onComment,
  onReact,
  actionBusy = false,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [showAllComments, setShowAllComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [shared, setShared] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  const reactionRef = useRef(null)
  const reactionTimerRef = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (reactionRef.current && !reactionRef.current.contains(event.target)) {
        setShowReactionPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleReact = async (emoji) => {
    if (!onReact || actionBusy) return
    await onReact(post.id, emoji)
  }

  const handleQuickLike = () => {
    handleReact('👍')
    setShowReactionPicker(false)
  }

  const handleShare = async () => {
    const link = `${window.location.origin}${window.location.pathname}#post-${post.id}`
    try {
      await navigator.clipboard.writeText(link)
      setShared(true)
      window.setTimeout(() => setShared(false), 2000)
    } catch (error) {
      console.error('Failed to copy post link:', error)
    }
  }

  const sendComment = async () => {
    const content = commentText.trim()
    if (!content || !onComment || actionBusy) return
    await onComment(post.id, content)
    setCommentText('')
    setShowComments(true)
    setShowAllComments(true)
  }

  const requiresTruncation = post.content.split('\n').length > 3 || post.content.length > 200
  const totalReactionCount = totalReactions(post.reactions)
  const topReactionEmojis = Object.entries(post.reactions || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emoji]) => emoji)
  const comments = Array.isArray(post.comments) ? post.comments : []
  const displayedComments = showAllComments ? comments : comments.slice(0, 2)
  const hiddenCount = comments.length - displayedComments.length
  const currentUserName = currentUser?.displayName || currentUser?.name || ''
  const isOwnPost =
    String(post.authorId || '') === String(currentUser?.id || '') || post.author === currentUserName
  const followState = formatFollowState(post.authorConnectionStatus)

  return (
    <div
      id={`post-${post.id}`}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-4 flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-11 h-11 rounded-full object-cover border border-slate-100"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-[14px] truncate">{post.author}</span>
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
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isOwnPost && (
            <button
              onClick={() => onFollow?.(post.authorProfileId)}
              disabled={followState.disabled || actionBusy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all disabled:opacity-70 ${followState.className}`}
            >
              {followState.icon}
              {followState.label}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowOptions((value) => !value)}
              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <MoreHorizontal size={20} />
            </button>
            {showOptions && (
              <MoreOptions onCopyLink={handleShare} onClose={() => setShowOptions(false)} />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p
          className={`text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap ${!isContentExpanded && requiresTruncation ? 'line-clamp-3' : ''}`}
        >
          {post.content}
        </p>
        {requiresTruncation && (
          <button
            onClick={() => setIsContentExpanded((value) => !value)}
            className="text-indigo-600 hover:text-indigo-800 text-[13px] font-semibold mt-1 focus:outline-none"
          >
            {isContentExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {(totalReactionCount > 0 || comments.length > 0) && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {topReactionEmojis.map((emoji, index) => (
                <span key={`${emoji}-${index}`} className="text-[16px] -ml-1 first:ml-0">
                  {emoji}
                </span>
              ))}
            </div>
            <span className="text-[13px] text-slate-500 font-medium">
              {totalReactionCount > 0 ? formatCount(totalReactionCount) : ''}
            </span>
          </div>
          <button
            onClick={() => setShowComments((value) => !value)}
            className="text-[13px] text-slate-500 font-medium hover:text-indigo-600 transition-colors"
          >
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      )}

      <div className="px-1 py-0.5 border-t border-slate-100 flex items-center">
        <div ref={reactionRef} className="relative flex-1">
          <button
            onClick={handleQuickLike}
            disabled={actionBusy}
            onMouseEnter={() => {
              reactionTimerRef.current = window.setTimeout(() => setShowReactionPicker(true), 400)
            }}
            onMouseLeave={() => {
              window.clearTimeout(reactionTimerRef.current)
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[13px] font-medium disabled:opacity-60 ${post.myReaction ? 'text-rose-500 font-bold bg-rose-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            {post.myReaction ? (
              <span className="text-[18px] leading-none">{post.myReaction}</span>
            ) : (
              <Heart size={19} />
            )}
            <span>{post.myReaction || 'Like'}</span>
          </button>
          {showReactionPicker && (
            <EmojiPicker onPick={handleReact} onClose={() => setShowReactionPicker(false)} />
          )}
        </div>

        <button
          onClick={() => setShowComments((value) => !value)}
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
      </div>

      {showComments && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white">
          <div className="flex gap-2.5 items-center mt-3 mb-4">
            <img
              src={
                currentUser?.avatar ||
                getAvatarDataUrl(currentUser?.displayName || currentUser?.name || 'You')
              }
              alt="You"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && sendComment()}
                placeholder="Write a comment..."
                className="w-full border border-slate-200 bg-slate-50 rounded-full pl-4 pr-10 py-2 text-[13px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                onClick={sendComment}
                disabled={!commentText.trim() || actionBusy}
                className={`absolute right-1.5 top-1.5 bottom-1.5 w-7 flex items-center justify-center rounded-full transition-all ${commentText.trim() && !actionBusy ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-300 cursor-not-allowed'}`}
              >
                <Send size={13} />
              </button>
            </div>
          </div>

          {!showAllComments && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
            >
              View {hiddenCount} more {hiddenCount === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {comments.length > 0 ? (
            <div className="space-y-3">
              {displayedComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
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
          ) : (
            <p className="text-[13px] text-slate-500">No comments yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

const EMOJI_LIST = ['😀', '😂', '😍', '🥳', '😎', '🤔', '😢', '😮', '🔥', '❤️', '👍', '👏']

const PostComposerModal = ({ currentUser, onClose, onPost, isSubmitting = false }) => {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef(null)

  const maxChars = 500
  const remaining = maxChars - text.length
  const progress = Math.min(text.length / maxChars, 1)
  const circumference = 2 * Math.PI * 10

  useEffect(() => {
    textareaRef.current?.focus()
    const handleEsc = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isSubmitting, onClose])

  const autoResize = (event) => {
    event.target.style.height = 'auto'
    event.target.style.height = `${event.target.scrollHeight}px`
  }

  const handlePost = async () => {
    const content = text.trim()
    if (!content || isSubmitting) return
    await onPost?.({ text: content })
    onClose()
  }

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const nextText = text.slice(0, start) + emoji + text.slice(textarea.selectionEnd)
    setText(nextText)
    window.setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.focus()
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-[16px]">Create Post</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-5 py-3">
          <img
            src={
              currentUser?.avatar ||
              getAvatarDataUrl(currentUser?.displayName || currentUser?.name || 'You')
            }
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

        <div className="px-5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              if (event.target.value.length <= maxChars) {
                setText(event.target.value)
                autoResize(event)
              }
            }}
            placeholder="Share an update with your network..."
            rows={3}
            className="w-full text-[15px] text-slate-800 placeholder-slate-400 resize-none focus:outline-none leading-relaxed min-h-20"
            style={{ height: 'auto' }}
          />
        </div>

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

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <button
            onClick={() => setShowEmoji((value) => !value)}
            className={`p-2 rounded-xl hover:bg-slate-100 transition-colors ${showEmoji ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600'}`}
            title="Emoji"
          >
            <Smile size={20} />
          </button>

          <div className="flex items-center gap-3">
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
              disabled={!text.trim() || isSubmitting}
              className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all ${text.trim() && !isSubmitting ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const PostComposer = ({
  currentUser,
  placeholder = "What's on your mind...?",
  onPost,
  isSubmitting = false,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
        <div className="flex gap-3 items-center">
          <img
            src={
              currentUser?.avatar ||
              getAvatarDataUrl(currentUser?.displayName || currentUser?.name || 'You')
            }
            alt="You"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          <button
            onClick={() => setOpen(true)}
            className="flex-1 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all rounded-full px-5 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-slate-100"
          >
            <span className="text-[14px] text-slate-400 font-medium">{placeholder}</span>
          </button>
        </div>
      </div>
      {open && (
        <PostComposerModal
          currentUser={currentUser}
          onClose={() => setOpen(false)}
          onPost={onPost}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}
