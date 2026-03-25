// src/app/hooks/useCampaigns.js
import { useState, useEffect, useCallback } from 'react'
import api from 'app/utils/api'

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
      setCampaigns(campaignsRes.data.results ?? campaignsRes.data)
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
    setCampaigns((prev) => [res.data, ...prev])
    return res.data
  }

  const updateCampaign = async (id, data) => {
    const res = await api.patch(`/campaigns/${id}/`, data)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    return res.data
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
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updatedCampaign.data : c)))
    setMyDonations((prev) => [res.data, ...prev])
    return res.data
  }

  const participateInCampaign = async (id) => {
    const res = await api.post(`/campaigns/${id}/participate/`)
    const updatedCampaign = await api.get(`/campaigns/${id}/`)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updatedCampaign.data : c)))
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
