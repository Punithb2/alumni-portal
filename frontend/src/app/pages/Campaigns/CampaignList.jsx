import React, { useState } from 'react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { CampaignCard } from '../../components/campaigns/CampaignCard'
import { CampaignSheet } from '../../components/campaigns/CampaignSheet'
import { HeartHandshake, TrendingUp, Sparkles } from 'lucide-react'

export default function CampaignList() {
  const { campaigns } = useCampaigns()
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign)
    setIsSheetOpen(true)
  }

  const closeSheet = () => {
    setIsSheetOpen(false)
    setTimeout(() => setSelectedCampaign(null), 300)
  }

  const totalRaised = campaigns
    .filter((c) => c.campaignType !== 'participation')
    .reduce((sum, c) => sum + (Number(c.raised) || 0), 0)
  const totalDonors = campaigns.reduce((sum, c) => sum + (Number(c.donorCount) || 0), 0)

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-xs font-medium mb-4">
            <Sparkles size={14} className="text-violet-600" />
            <span className="text-violet-700">Make an Impact Today</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900 leading-tight tracking-tight">
            Empower the Next Generation
          </h1>
          <p className="text-slate-600 text-sm md:text-base mb-5 leading-relaxed max-w-lg">
            Join thousands of alumni in supporting scholarships, research, and campus development.
            Every contribution builds a stronger legacy.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1.5">
              <TrendingUp size={14} /> Total Impact
            </p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{totalRaised.toLocaleString()}
            </p>
          </div>
          <div className="w-px bg-slate-200 hidden sm:block" />
          <div>
            <p className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1.5">
              <HeartHandshake size={14} /> Global Supporters
            </p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalDonors.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Campaigns</h2>
        <span className="text-violet-700 font-semibold bg-violet-50 px-3 py-1 rounded-full text-sm border border-violet-100 shadow-sm">
          {campaigns.length} initiatives
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            isAdmin={false}
            onCampaignClick={handleCampaignClick}
          />
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
            <HeartHandshake size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-700 mb-1">No active campaigns</p>
            <p className="text-sm">Check back later for new giving opportunities.</p>
          </div>
        )}
      </div>

      <CampaignSheet isOpen={isSheetOpen} onClose={closeSheet} campaignId={selectedCampaign?.id} />
    </div>
  )
}
