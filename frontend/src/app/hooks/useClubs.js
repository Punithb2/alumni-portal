// src/app/hooks/useClubs.js
// Custom hook providing reactive state for the Clubs feature using localStorage for persistence
import { useState, useCallback, useEffect } from 'react'
import { useGamification, BADGES } from '../contexts/GamificationContext'
import {
    INITIAL_CLUBS,
    INITIAL_POSTS,
    INITIAL_MEMBERS,
    INITIAL_JOIN_REQUESTS,
    INITIAL_MESSAGES,
    USER_JOINED_GROUP_IDS,
    USER_PENDING_GROUP_IDS,
    CLUB_EVENTS,
    CLUB_JOBS,
} from '../data/clubsStore'

// Simple module-level store so state persists across component mounts within the same session
let _clubs = [...INITIAL_CLUBS]
let _posts = { ...INITIAL_POSTS }
let _members = { ...INITIAL_MEMBERS }
let _joinRequests = { ...INITIAL_JOIN_REQUESTS }
let _messages = { ...INITIAL_MESSAGES }
let _joinedIds = new Set(USER_JOINED_GROUP_IDS)
let _pendingIds = new Set(USER_PENDING_GROUP_IDS)
let _listeners = []

const notify = () => _listeners.forEach(fn => fn())

export function useClubs() {
    const [, forceUpdate] = useState(0)

    const subscribe = useCallback(() => {
        const re = () => forceUpdate(n => n + 1)
        _listeners.push(re)
        return () => { _listeners = _listeners.filter(l => l !== re) }
    }, [])

    // Subscribe on mount
    useEffect(() => {
        const unsub = subscribe()
        return unsub
    }, [subscribe])

    // ─── Club CRUD ─────────────────────────────────────────────────────────────
    const createClub = useCallback((data) => {
        const requiresUniversityApproval = data.isPrivate && data.createdByRole === 'Alumni'
        const creatorName = data.createdByName || 'You'

        const ownerMember = {
            id: 'me',
            name: creatorName,
            role: 'Owner',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
            title: 'Founder',
            joinedAt: 'Just now',
            isOnline: true,
        }

        const invitedMembers = Array.isArray(data.initialMembers) ? data.initialMembers : []
        const allMembers = [ownerMember, ...invitedMembers]

        const newClub = {
            ...data,
            id: Date.now(),
            membersCount: allMembers.length,
            status: requiresUniversityApproval ? 'pending' : (data.status || 'active'),
            createdAt: new Date().toISOString().split('T')[0],
            memberAvatars: allMembers.slice(0, 5).map(m => m.avatar).filter(Boolean),
            admins: [{
                id: 'me',
                name: creatorName,
                role: 'Owner',
                avatar: ownerMember.avatar,
            }],
            tags: data.tags || [],
            rules: [],
        }
        _clubs = [newClub, ..._clubs]
        _joinedIds = new Set([..._joinedIds, newClub.id])
        _members = {
            ..._members,
            [newClub.id]: allMembers,
        }
        _posts = {
            ..._posts,
            [newClub.id]: []
        }
        notify()
        return newClub
    }, [])

    const updateClub = useCallback((id, data) => {
        _clubs = _clubs.map(c => c.id === id ? { ...c, ...data } : c)
        notify()
    }, [])

    const deleteClub = useCallback((id) => {
        _clubs = _clubs.filter(c => c.id !== id)
        _joinedIds.delete(id)
        notify()
    }, [])

    const approveClub = useCallback((id) => {
        _clubs = _clubs.map(c => c.id === id ? { ...c, status: 'active' } : c)
        notify()
    }, [])

    const suspendClub = useCallback((id) => {
        _clubs = _clubs.map(c => c.id === id ? { ...c, status: 'suspended' } : c)
        notify()
    }, [])

    // ─── Membership ────────────────────────────────────────────────────────────
    const joinClub = useCallback((clubId) => {
        const club = _clubs.find(c => c.id === clubId)
        if (!club) return
        if (club.isPrivate) {
            // Send a join request
            _pendingIds = new Set([..._pendingIds, clubId])
        } else {
            _joinedIds = new Set([..._joinedIds, clubId])
            _clubs = _clubs.map(c => c.id === clubId ? { ...c, membersCount: c.membersCount + 1 } : c)
        }
        notify()
    }, [])

    const leaveClub = useCallback((clubId) => {
        _joinedIds.delete(clubId)
        _joinedIds = new Set(_joinedIds)
        _clubs = _clubs.map(c => c.id === clubId ? { ...c, membersCount: Math.max(0, c.membersCount - 1) } : c)
        notify()
    }, [])

    const cancelRequest = useCallback((clubId) => {
        _pendingIds.delete(clubId)
        _pendingIds = new Set(_pendingIds)
        notify()
    }, [])

    // ─── Join Request Approval ─────────────────────────────────────────────────
    const approveJoinRequest = useCallback((clubId, requestId) => {
        const req = (_joinRequests[clubId] || []).find(r => r.id === requestId)
        if (!req) return
        _joinRequests = {
            ..._joinRequests,
            [clubId]: (_joinRequests[clubId] || []).filter(r => r.id !== requestId)
        }
        const newMember = {
            id: req.userId,
            name: req.name,
            role: 'Member',
            avatar: req.avatar,
            title: req.title,
            joinedAt: 'Just now',
            isOnline: false,
        }
        _members = {
            ..._members,
            [clubId]: [...(_members[clubId] || []), newMember]
        }
        _clubs = _clubs.map(c => c.id === clubId ? { ...c, membersCount: c.membersCount + 1 } : c)
        notify()
    }, [])

    const rejectJoinRequest = useCallback((clubId, requestId) => {
        _joinRequests = {
            ..._joinRequests,
            [clubId]: (_joinRequests[clubId] || []).filter(r => r.id !== requestId)
        }
        notify()
    }, [])

    const removeMember = useCallback((clubId, memberId) => {
        _members = {
            ..._members,
            [clubId]: (_members[clubId] || []).filter(m => m.id !== memberId)
        }
        _clubs = _clubs.map(c => c.id === clubId ? { ...c, membersCount: Math.max(0, c.membersCount - 1) } : c)
        notify()
    }, [])

    const promoteMember = useCallback((clubId, memberId) => {
        _members = {
            ..._members,
            [clubId]: (_members[clubId] || []).map(m =>
                m.id === memberId ? { ...m, role: m.role === 'Moderator' ? 'Member' : 'Moderator' } : m
            )
        }
        notify()
    }, [])

    // ─── Posts ────────────────────────────────────────────────────────────────
    const createPost = useCallback((clubId, postData) => {
        const newPost = {
            id: Date.now(),
            author: postData.author || 'You',
            authorId: 'me',
            avatar: postData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
            time: 'Just now',
            content: postData.content,
            likes: 0,
            comments: [],
            isPinned: false,
            image: postData.image || null,
        }
        _posts = {
            ..._posts,
            [clubId]: [newPost, ...(_posts[clubId] || [])]
        }
        notify()
        return newPost
    }, [])

    const deletePost = useCallback((clubId, postId) => {
        _posts = {
            ..._posts,
            [clubId]: (_posts[clubId] || []).filter(p => p.id !== postId)
        }
        notify()
    }, [])

    const likePost = useCallback((clubId, postId, liked) => {
        _posts = {
            ..._posts,
            [clubId]: (_posts[clubId] || []).map(p =>
                p.id === postId ? { ...p, likes: liked ? p.likes - 1 : p.likes + 1 } : p
            )
        }
        notify()
    }, [])

    const addComment = useCallback((clubId, postId, comment) => {
        _posts = {
            ..._posts,
            [clubId]: (_posts[clubId] || []).map(p =>
                p.id === postId
                    ? { ...p, comments: [{ id: Date.now(), ...comment, time: 'Just now', replies: [] }, ...p.comments] }
                    : p
            )
        }
        notify()
    }, [])

    const addReply = useCallback((clubId, postId, commentId, reply) => {
        _posts = {
            ..._posts,
            [clubId]: (_posts[clubId] || []).map(p => {
                if (p.id !== postId) return p;
                return {
                    ...p,
                    comments: p.comments.map(c => 
                        c.id === commentId
                            ? { ...c, replies: [{ id: Date.now(), ...reply, time: 'Just now' }, ...(c.replies || [])] }
                            : c
                    )
                };
            })
        }
        notify()
    }, [])

    const pinPost = useCallback((clubId, postId) => {
        _posts = {
            ..._posts,
            [clubId]: (_posts[clubId] || []).map(p =>
                p.id === postId ? { ...p, isPinned: !p.isPinned } : p
            )
        }
        notify()
    }, [])

    // ─── Chat ─────────────────────────────────────────────────────────────────
    const sendMessage = useCallback((clubId, message) => {
        const newMsg = {
            id: Date.now(),
            senderId: 'me',
            sender: 'You',
            initials: 'ME',
            isMe: true,
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Sent',
        }
        _messages = {
            ..._messages,
            [clubId]: [...(_messages[clubId] || []), newMsg]
        }
        notify()
    }, [])

    return {
        clubs: _clubs,
        posts: _posts,
        members: _members,
        joinRequests: _joinRequests,
        messages: _messages,
        joinedIds: _joinedIds,
        pendingIds: _pendingIds,
        clubEvents: CLUB_EVENTS,
        clubJobs: CLUB_JOBS,

        // Club actions
        createClub,
        updateClub,
        deleteClub,
        approveClub,
        suspendClub,

        // Membership
        joinClub,
        leaveClub,
        cancelRequest,

        // Join requests
        approveJoinRequest,
        rejectJoinRequest,
        removeMember,
        promoteMember,

        // Posts
        createPost,
        deletePost,
        likePost,
        addComment,
        addReply,
        pinPost,

        // Chat
        sendMessage,
    }
}
