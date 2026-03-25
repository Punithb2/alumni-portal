import React from 'react'
import { Calendar, MonitorPlay, Users, MapPin, CheckCircle2, LayoutGrid, List } from 'lucide-react'

const EventsSidebar = ({
  activeTab,
  setActiveTab,
  eventTypeFilter,
  setEventTypeFilter,
  categoryFilter,
  setCategoryFilter,
  showMyRsvps,
  setShowMyRsvps,
  viewMode,
  setViewMode,
}) => {
  const tabs = ['Upcoming', 'Past']
  const eventTypes = ['All', 'Online', 'In-person', 'Hybrid']
  const categories = ['All', 'Networking', 'Webinar', 'Reunion', 'Gala']

  return (
    <div className="w-full shrink-0 flex flex-col md:flex-row gap-4 mb-6">
      {/* Time Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-shrink-0">
        <div className="flex bg-slate-100 p-1 rounded-xl h-full items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-1 items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                showMyRsvps
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 group-hover:border-indigo-400 bg-white'
              }`}
              onClick={() => setShowMyRsvps(!showMyRsvps)}
            >
              {showMyRsvps && <CheckCircle2 size={14} />}
            </div>
            <span className="text-sm text-slate-700 font-medium whitespace-nowrap">My RSVPs</span>
          </label>
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Format:</span>
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Category:</span>
          <select
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block flex-1"></div>

        {/* View Mode Toggle */}
        {viewMode && setViewMode && (
          <div className="flex bg-slate-100 p-1 rounded-xl items-center ml-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Card View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsSidebar
