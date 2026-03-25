import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Send,
  MoreVertical,
  Info,
  ArrowLeft,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import ChatProfileSheet from './ChatProfileSheet'
import { useChat } from '../../hooks/useChat'

const Chat = () => {
  const { user } = useAuth()
  const currentUser = user || {
    id: 'currentUser',
    name: 'Current User',
    avatar: 'https://i.pravatar.cc/150?u=current',
  }
  const {
    contacts,
    messagesByConversation,
    loadingConversations,
    loadingMessages,
    fetchMessages,
    sendMessage,
  } = useChat(currentUser.id)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showProfileSheet, setShowProfileSheet] = useState(false)

  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messagesByConversation, selectedChat])

  // Reset profile sheet when chat changes
  useEffect(() => {
    setTimeout(() => {
      setShowProfileSheet(false)
    }, 0)
  }, [selectedChat])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const text = messageInput.trim()
    if (!text || !selectedChat) return
    try {
      await sendMessage(selectedChat.conversationId, text)
      setMessageInput('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  // Splitter logic for left sidebar
  const [sidebarWidth, setSidebarWidth] = useState(340)
  const [isDragging, setIsDragging] = useState(false)

  const startResizing = React.useCallback(
    (mouseDownEvent) => {
      mouseDownEvent.preventDefault()
      setIsDragging(true)
      const startX = mouseDownEvent.clientX
      const startWidth = sidebarWidth

      const doDrag = (mouseMoveEvent) => {
        let newWidth = startWidth + mouseMoveEvent.clientX - startX
        if (newWidth < 280) newWidth = 280 // min width
        if (newWidth > 500) newWidth = 500 // max width
        setSidebarWidth(newWidth)
      }

      const stopDrag = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', doDrag)
        document.removeEventListener('mouseup', stopDrag)
      }

      document.addEventListener('mousemove', doDrag)
      document.addEventListener('mouseup', stopDrag)
    },
    [sidebarWidth]
  )

  // Splitter logic for right profile sheet
  const [profileSheetWidth, setProfileSheetWidth] = useState(350)
  const [isProfileDragging, setIsProfileDragging] = useState(false)

  const startProfileResizing = React.useCallback(
    (mouseDownEvent) => {
      mouseDownEvent.preventDefault()
      setIsProfileDragging(true)
      const startX = mouseDownEvent.clientX
      const startWidth = profileSheetWidth

      const doDrag = (mouseMoveEvent) => {
        let newWidth = startWidth - (mouseMoveEvent.clientX - startX)
        if (newWidth < 280) newWidth = 280 // min width
        if (newWidth > 500) newWidth = 500 // max width
        setProfileSheetWidth(newWidth)
      }

      const stopDrag = () => {
        setIsProfileDragging(false)
        document.removeEventListener('mousemove', doDrag)
        document.removeEventListener('mouseup', stopDrag)
      }

      document.addEventListener('mousemove', doDrag)
      document.addEventListener('mouseup', stopDrag)
    },
    [profileSheetWidth]
  )

  const getFormatTime = (date) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(
      new Date(date)
    )

  useEffect(() => {
    if (selectedChat?.conversationId) {
      fetchMessages(selectedChat.conversationId)
    }
  }, [selectedChat, fetchMessages])

  const filteredContacts = contacts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesRole = true
    if (roleFilter === 'Alumni') matchesRole = p.role?.toLowerCase().includes('alumni')
    if (roleFilter === 'Students') matchesRole = p.role?.toLowerCase().includes('student')
    return matchesSearch && matchesRole
  })

  const selectedMessages = selectedChat
    ? messagesByConversation[selectedChat.conversationId] || []
    : []

  return (
    <div
      className={`flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative ${isDragging || isProfileDragging ? 'select-none pointer-events-none' : ''}`}
      style={{ height: 'calc(100vh - 5.5rem)' }}
    >
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-slate-200 flex flex-col h-full shrink-0 max-md:!w-full ${selectedChat ? 'hidden md:flex' : 'flex'}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chats</h2>
            <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 text-sm font-medium overflow-x-auto pb-1 hide-scrollbar">
            {['All', 'Alumni', 'Students'].map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${roleFilter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto w-full">
          {loadingConversations ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">Loading conversations...</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            <ul className="p-2 space-y-1">
              {filteredContacts.map((profile) => (
                <li key={profile.id}>
                  <button
                    onClick={() => setSelectedChat(profile)}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all ${selectedChat?.id === profile.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative shrink-0">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100"
                        />
                        {profile.status === 'online' && (
                          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="text-sm font-semibold text-slate-900 truncate pr-2">
                            {profile.name}
                          </h4>
                        </div>
                        <p
                          className={`text-xs truncate ${selectedChat?.id === profile.id ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}
                        >
                          {profile.role}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">No conversations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Splitter */}
      <div
        className="hidden md:block w-1 bg-slate-100 hover:bg-indigo-400 cursor-col-resize shrink-0 transition-colors z-20 group relative"
        onMouseDown={startResizing}
      >
        {/* Invisible wider grab area for easier clicking */}
        <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent"></div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col h-full bg-white min-w-0 ${!selectedChat ? 'hidden md:flex' : 'flex'} absolute md:relative inset-0 md:inset-auto w-full pointer-events-auto`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  className="md:hidden -ml-2 p-2 hover:bg-slate-100 rounded-full text-slate-600 shrink-0 transition-colors"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft size={22} />
                </button>
                <div className="relative shrink-0 cursor-pointer">
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  {selectedChat.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="min-w-0 cursor-pointer">
                  <h3 className="text-base font-bold text-slate-900 truncate leading-tight">
                    {selectedChat.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedChat.status === 'online' ? (
                      <span className="text-emerald-600 font-medium">Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 shrink-0">
                <button
                  onClick={() => setShowProfileSheet(!showProfileSheet)}
                  className={`p-2 sm:p-2.5 rounded-full transition-colors hidden sm:block ${showProfileSheet ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 hover:text-slate-700'}`}
                >
                  <Info size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-6 space-y-4 bg-slate-50/50">
              {loadingMessages && (
                <div className="text-xs text-slate-500 text-center">Loading messages...</div>
              )}
              {selectedMessages.map((msg, index) => {
                const isIncoming = !msg.isOwn
                const senderProps = isIncoming ? selectedChat : currentUser
                const showAvatar =
                  index === selectedMessages.length - 1 ||
                  selectedMessages[index + 1]?.senderId !== msg.senderId

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} group`}
                  >
                    <div
                      className={`flex gap-2 max-w-[85%] sm:max-w-[70%] ${isIncoming ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {isIncoming && (
                        <div className="w-8 shrink-0 flex flex-col justify-end">
                          {showAvatar && (
                            <img
                              src={senderProps.avatar}
                              alt={senderProps.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                            />
                          )}
                        </div>
                      )}

                      <div
                        className={`flex flex-col min-w-0 ${isIncoming ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                            isIncoming
                              ? 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100'
                              : 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                          {getFormatTime(msg.timestamp)}
                        </span>
                      </div>

                      {!isIncoming && (
                        <div className="w-8 shrink-0 flex flex-col justify-end">
                          <img
                            src={currentUser.avatar}
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover shadow-sm hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-end gap-2 max-w-5xl mx-auto">
                <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white transition-all overflow-hidden flex pl-3 sm:pl-4">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 resize-none bg-transparent py-3 px-3 sm:px-0 min-h-[48px] max-h-32 text-[15px] outline-none leading-relaxed"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 mb-0.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shrink-0 shadow-sm"
                >
                  <Send size={20} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-500"
              >
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Your Messages</h3>
            <p className="text-slate-500 max-w-sm">
              Select a conversation from the sidebar to view chat history or start a new message.
            </p>
          </div>
        )}
      </div>

      {/* Profile Sheet Splitter */}
              {showProfileSheet && selectedChat && (
        <div
          className="hidden lg:block w-1 bg-slate-100 hover:bg-indigo-400 cursor-col-resize shrink-0 transition-colors z-20 group relative"
          onMouseDown={startProfileResizing}
        >
          <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent"></div>
        </div>
      )}

      {/* Profile Info Column */}
      <ChatProfileSheet
        isOpen={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        profile={selectedChat}
        customWidth={profileSheetWidth}
      />
    </div>
  )
}

export default Chat
