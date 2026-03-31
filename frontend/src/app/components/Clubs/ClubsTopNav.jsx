import React from 'react'
import useAuth from '../../hooks/useAuth'
import { Users, Compass, Plus, Search, Bell } from 'lucide-react'

const FILTERS = [
  { id: 'Interest Group', label: 'Interest Groups' },
  { id: 'Chapter', label: 'Chapters' },
  { id: 'Cohort', label: 'Cohorts' },
]

const ClubsTopNav = ({
  activeTab,
  onTabSelect,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onCreateGroup,
  pendingCount = 0,
}) => {
  const { user } = useAuth()
  const normalizedRole = String(user?.role || '').toLowerCase()
  const canCreate =
    normalizedRole === 'alumni' ||
    normalizedRole === 'admin' ||
    normalizedRole === 'university' ||
    normalizedRole === 'sa' ||
    normalizedRole === 'super_admin'

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-3 mb-6">
      {/* Row 1: Tabs + Create Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onTabSelect('discover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${
              activeTab === 'discover'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Compass
              size={16}
              className={activeTab === 'discover' ? 'text-indigo-600' : 'text-slate-400'}
            />
            Discover Groups
          </button>

          <div className="w-px h-5 bg-slate-200 hidden sm:block" />

          <button
            onClick={() => onTabSelect('my_groups')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm whitespace-nowrap relative ${
              activeTab === 'my_groups'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users
              size={16}
              className={activeTab === 'my_groups' ? 'text-emerald-600' : 'text-slate-400'}
            />
            My Groups
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-[10px] font-black rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Create Button — visible for Alumni/Admin */}
        {canCreate && (
          <button
            onClick={onCreateGroup}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            Create Group
          </button>
        )}
      </div>

      {/* Row 2: Search + Filters (only on discover) */}
      {activeTab === 'discover' && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block pr-1">
              Type:
            </span>
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedFilter === null
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(selectedFilter === f.id ? null : f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedFilter === f.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClubsTopNav
