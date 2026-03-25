import { useCallback, useEffect, useState } from 'react'
import api from 'app/utils/api'
import { getAvatarDataUrl } from 'app/utils/avatar'

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

const toContact = (conversation, currentUserId) => {
  const other = (conversation.participants || []).find((p) => p.id !== currentUserId) || conversation.participants?.[0]
  const name = fullName(other) || conversation.title || 'Conversation'
  return {
    id: conversation.id,
    conversationId: conversation.id,
    name,
    role: 'Community Member',
    avatar: getAvatarDataUrl(name),
    status: 'offline',
    email: other?.email || '',
  }
}

const toUiMessage = (message, currentUserId) => ({
  id: message.id,
  senderId: message.sender,
  text: message.content,
  timestamp: message.sent_at,
  isOwn: String(message.sender) === String(currentUserId),
})

export const useChat = (currentUserId) => {
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [messagesByConversation, setMessagesByConversation] = useState({})
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(null)

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true)
    setError(null)
    try {
      const res = await api.get('/conversations/')
      const data = res.data.results ?? res.data
      const list = Array.isArray(data) ? data : []
      setConversations(list)
      setContacts(list.map((conv) => toContact(conv, currentUserId)))
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError('Failed to load conversations.')
    } finally {
      setLoadingConversations(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/conversations/${conversationId}/messages/`)
      const data = res.data.results ?? res.data
      const normalized = (Array.isArray(data) ? data : []).map((m) => toUiMessage(m, currentUserId))
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: normalized }))
      return normalized
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('Failed to load messages.')
      return []
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async (conversationId, content) => {
    const res = await api.post(`/conversations/${conversationId}/send_message/`, { content })
    const uiMessage = toUiMessage(res.data, currentUserId)
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), uiMessage],
    }))
    return uiMessage
  }

  return {
    conversations,
    contacts,
    messagesByConversation,
    loadingConversations,
    loadingMessages,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
  }
}
