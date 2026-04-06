import { useCallback, useEffect, useMemo, useState } from 'react'
import api from 'app/utils/api'
import { getAvatarDataUrl } from 'app/utils/avatar'
import { normalizeJob } from 'app/components/Jobs/jobUtils'

const extractList = (payload) => payload?.results ?? payload ?? []

const normalizeProfile = (profile = {}) => {
  const firstName = profile.user?.first_name || ''
  const lastName = profile.user?.last_name || ''
  const name = `${firstName} ${lastName}`.trim() || profile.user?.username || 'Member'

  return {
    ...profile,
    name,
    avatar: profile.avatar || getAvatarDataUrl(name),
    connectionStatus: profile.connection_status ?? 'none',
    connectionRequestId: profile.connection_request_id ?? null,
  }
}

const sortByDateDesc = (items, key) =>
  [...items].sort((a, b) => new Date(b?.[key] || 0).getTime() - new Date(a?.[key] || 0).getTime())

export const useDashboardData = (currentUser) => {
  const [profiles, setProfiles] = useState([])
  const [jobs, setJobs] = useState([])
  const [events, setEvents] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profilesRes, jobsRes, eventsRes, campaignsRes] = await Promise.all([
        api.get('/profiles/'),
        api.get('/jobs/'),
        api.get('/events/'),
        api.get('/campaigns/'),
      ])

      const normalizedProfiles = extractList(profilesRes.data)
        .filter((profile) => String(profile.user?.id) !== String(currentUser?.id))
        .map(normalizeProfile)

      setProfiles(normalizedProfiles)
      setJobs(extractList(jobsRes.data).map((job) => normalizeJob(job, currentUser?.id)))
      setEvents(extractList(eventsRes.data))
      setCampaigns(extractList(campaignsRes.data))
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const connectionsCount = useMemo(
    () => profiles.filter((profile) => profile.connectionStatus === 'connected').length,
    [profiles]
  )

  const pendingConnectionsCount = useMemo(
    () => profiles.filter((profile) => profile.connectionStatus?.includes('pending')).length,
    [profiles]
  )

  const mentorProfiles = useMemo(
    () => profiles.filter((profile) => profile.willing_to_mentor),
    [profiles]
  )

  const hiringProfiles = useMemo(
    () => profiles.filter((profile) => profile.willing_to_hire),
    [profiles]
  )

  const highlightUsers = useMemo(
    () =>
      profiles.slice(0, 5).map((profile) => ({
        title: profile.name.split(' ')[0] || profile.name,
        src: profile.avatar,
        online:
          profile.connectionStatus === 'connected' ||
          profile.willing_to_mentor ||
          profile.willing_to_hire,
      })),
    [profiles]
  )

  const featuredJobs = useMemo(() => sortByDateDesc(jobs, 'createdAt').slice(0, 3), [jobs])
  const featuredEvents = useMemo(
    () =>
      [...events]
        .filter((event) => {
          const eventDate = new Date(event.date || event.created_at || 0)
          return !Number.isNaN(eventDate.getTime()) && eventDate.getTime() >= Date.now() - 86400000
        })
        .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
        .slice(0, 3),
    [events]
  )
  const featuredCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.featured) || campaigns[0] || null,
    [campaigns]
  )
  const referralJobs = useMemo(
    () =>
      sortByDateDesc(
        jobs.filter((job) => job.canRefer),
        'createdAt'
      ).slice(0, 3),
    [jobs]
  )

  return {
    profiles,
    jobs,
    events,
    campaigns,
    loading,
    error,
    connectionsCount,
    pendingConnectionsCount,
    mentorProfiles,
    hiringProfiles,
    highlightUsers,
    featuredJobs,
    featuredEvents,
    featuredCampaign,
    referralJobs,
    refetch: fetchDashboardData,
  }
}
