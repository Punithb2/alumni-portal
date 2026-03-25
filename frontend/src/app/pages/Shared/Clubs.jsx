import React, { useState } from 'react'
import ClubsTopNav from '../../components/Clubs/ClubsTopNav'
import ClubsRightSidebar from '../../components/Clubs/ClubsRightSidebar'
import ClubDiscoverCard from '../../components/Clubs/ClubDiscoverCard'
import ClubDetail from '../../components/Clubs/ClubDetail'
import CreateGroupModal from '../../components/Clubs/CreateGroupModal'
import { useClubs } from '../../hooks/useClubs'
import { Users, Star, Compass } from 'lucide-react'

const SECTIONS = [
  {
    type: 'Interest Group',
    label: 'Featured Interest Groups',
    desc: 'Connect around shared passions and industries',
  },
  { type: 'Chapter', label: 'Regional Chapters', desc: 'Find alumni near your city or region' },
  { type: 'Cohort', label: 'Cohorts & Class Years', desc: 'Reconnect with your batchmates' },
]

const Clubs = () => {
  const { clubs, joinedIds, pendingIds, joinClub, /* leaveClub, */ cancelRequest } = useClubs()

  const [activeTab, setActiveTab] = useState('discover')
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingGroupId, setViewingGroupId] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const viewingGroup = clubs.find((c) => c.id === viewingGroupId) || null

  // Filter logic
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      !searchQuery ||
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = !selectedFilter || club.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  const myGroups = filteredClubs.filter((c) => joinedIds.has(c.id))
  const pendingCount = pendingIds.size

  // const totalMembers = clubs.reduce((sum, c) => sum + (c.membersCount || 0), 0)

  return (
    <div className="max-w-[1500px] mx-auto min-h-[calc(100vh-100px)] flex flex-col pb-8 font-sans px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 mt-4 md:mt-8 pb-5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {viewingGroupId ? viewingGroup?.name : 'Clubs & Communities'}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            {viewingGroupId
              ? 'Connect, share, and collaborate with members.'
              : 'Join chapters, cohorts, and interest groups to stay connected.'}
          </p>
        </div>
        {viewingGroupId && (
          <button
            onClick={() => setViewingGroupId(null)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
          >
            <Compass size={15} /> Back to Directory
          </button>
        )}
      </div>

      {/* Top Nav only on list views */}
      {!viewingGroupId && (
        <ClubsTopNav
          activeTab={activeTab}
          onTabSelect={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          onCreateGroup={() => setIsCreateModalOpen(true)}
          pendingCount={pendingCount}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {viewingGroupId ? (
            <ClubDetail groupId={viewingGroupId} />
          ) : activeTab === 'discover' ? (
            <div className="space-y-12">
              {SECTIONS.map((section) => {
                const sectionClubs = filteredClubs.filter(
                  (g) => g.type === section.type && g.status === 'active'
                )
                if (sectionClubs.length === 0 && !searchQuery) return null
                return (
                  <section key={section.type}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{section.label}</h2>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{section.desc}</p>
                      </div>
                      <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                        See all
                      </button>
                    </div>
                    {sectionClubs.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center">
                        <p className="text-slate-500 font-medium">No groups match your search.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {sectionClubs.map((group) => (
                          <ClubDiscoverCard
                            key={group.id}
                            group={group}
                            isJoined={joinedIds.has(group.id)}
                            isPending={pendingIds.has(group.id)}
                            onView={(id) => setViewingGroupId(id)}
                            onJoin={joinClub}
                            onCancelRequest={cancelRequest}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          ) : (
            /* My Groups Tab */
            <div className="space-y-6">
              {myGroups.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                  <Users size={40} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">
                    You haven't joined any groups yet
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Explore the discover tab to find communities that match your interests.
                  </p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm"
                  >
                    Discover Groups
                  </button>
                </div>
              ) : (
                <>
                  {pendingCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                      <Star size={16} className="text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800 font-bold">
                        You have{' '}
                        <span className="underline">
                          {pendingCount} pending join request{pendingCount > 1 ? 's' : ''}
                        </span>
                        . Awaiting group admin approval.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {myGroups.map((group) => (
                      <ClubDiscoverCard
                        key={group.id}
                        group={group}
                        isJoined={joinedIds.has(group.id)}
                        isPending={pendingIds.has(group.id)}
                        onView={(id) => setViewingGroupId(id)}
                        onJoin={joinClub}
                        onCancelRequest={cancelRequest}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Removed per user request */}
        {/* 
                <ClubsRightSidebar
                    groupDetails={viewingGroupId ? viewingGroup : null}
                    stats={{ active: clubs.filter(c => c.status === 'active').length, members: totalMembers }}
                /> 
                */}
      </div>

      {/* Create Group Drawer */}
      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}

export default Clubs
