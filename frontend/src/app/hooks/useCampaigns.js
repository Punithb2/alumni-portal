// src/app/hooks/useCampaigns.js
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeCampaign = (campaign = {}) => {
  const raised = toNumber(campaign.raised, 0)
  const goal = toNumber(campaign.goal, 0)
  const donorCount = toNumber(campaign.donor_count ?? campaign.donorCount, 0)

  return {
    ...campaign,
    // Canonical frontend fields (camelCase)
    campaignType: campaign.campaign_type ?? campaign.campaignType ?? 'donation',
    donorCount,
    imageUrl: campaign.image_url ?? campaign.imageUrl ?? '',
    longStory: campaign.long_story ?? campaign.longStory ?? '',
    impactExamples: campaign.impact_examples ?? campaign.impactExamples ?? [],
    recentDonors: campaign.recent_donors ?? campaign.recentDonors ?? [],
    allowAnonymous: campaign.allow_anonymous ?? campaign.allowAnonymous ?? false,
    allowRecurring: campaign.allow_recurring ?? campaign.allowRecurring ?? false,
    showDonorList: campaign.show_donor_list ?? campaign.showDonorList ?? true,
    targetDepartment: campaign.target_department ?? campaign.targetDepartment ?? null,
    raised,
    goal,
  }
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [myDonations, setMyDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [campaignsRes, donationsRes] = await Promise.all([
        api.get('/campaigns/'),
        api.get('/donations/'),
      ])
      const rawCampaigns = campaignsRes.data.results ?? campaignsRes.data
      setCampaigns((Array.isArray(rawCampaigns) ? rawCampaigns : []).map(normalizeCampaign))
      setMyDonations(donationsRes.data.results ?? donationsRes.data)
    } catch (err) {
      console.error('Failed to load campaigns:', err)
      setError('Failed to load campaigns.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const addCampaign = async (data) => {
    const res = await api.post('/campaigns/', data)
    const normalized = normalizeCampaign(res.data)
    setCampaigns((prev) => [normalized, ...prev])
    return normalized
  }

  const updateCampaign = async (id, data) => {
    const res = await api.patch(`/campaigns/${id}/`, data)
    const normalized = normalizeCampaign(res.data)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? normalized : c)))
    return normalized
  }

  const deleteCampaign = async (id) => {
    await api.delete(`/campaigns/${id}/`)
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  const donateToCampaign = async (id, amount, options = {}) => {
    const { anonymous = false, recurring = false, frequency = null } = options
    const res = await api.post(`/campaigns/${id}/donate/`, {
      amount,
      anonymous,
      recurring,
      frequency,
    })
    // Refresh campaigns list to get updated raised/donor_count
    const updatedCampaign = await api.get(`/campaigns/${id}/`)
    const normalized = normalizeCampaign(updatedCampaign.data)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? normalized : c)))
    setMyDonations((prev) => [res.data, ...prev])
    return res.data
  }

  const participateInCampaign = async (id) => {
    const res = await api.post(`/campaigns/${id}/participate/`)
    const updatedCampaign = await api.get(`/campaigns/${id}/`)
    const normalized = normalizeCampaign(updatedCampaign.data)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? normalized : c)))
    setMyDonations((prev) => [res.data, ...prev])
    return res.data
  }

  const cancelRecurring = async (donationId) => {
    // Recurring cancellation — mark locally as cancelled (backend doesn't have recurring billing yet)
    setMyDonations((prev) =>
      prev.map((d) => (d.id === donationId ? { ...d, recurring: false, status: 'cancelled' } : d))
    )
  }

  return {
    campaigns,
    myDonations,
    loading,
    error,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    donateToCampaign,
    participateInCampaign,
    cancelRecurring,
    refetch: fetchCampaigns,
    getCampaignById: (id) => campaigns.find((c) => String(c.id) === String(id)),
  }
}
