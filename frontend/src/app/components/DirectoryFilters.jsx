// src/app/components/DirectoryFilters.jsx
import React, { useState } from 'react'
import {
  ChevronDown,
  Check,
  Filter,
  LayoutGrid,
  List,
  Map as MapIcon,
  X,
  Search,
} from 'lucide-react'
import clsx from 'clsx'

export function FilterColumn({ title, options, selectedValues, onChange }) {
  if (!options || options.length === 0) return null

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 group cursor-pointer lg:hover:bg-gray-50 lg:p-1 lg:-ml-1 lg:rounded-md transition-colors"
          >
            <div
              className={clsx(
                'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0',
                selectedValues.includes(option.value)
                  ? 'bg-blue-600 border-blue-600 shadow-sm'
                  : 'border-gray-300 group-hover:border-blue-400 bg-white'
              )}
            >
              {selectedValues.includes(option.value) && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
              <input
                type="checkbox"
                className="hidden"
                checked={selectedValues.includes(option.value)}
                onChange={() => onChange(option.value)}
              />
            </div>
            <span
              className={clsx(
                'text-[15px] sm:text-sm truncate select-none flex-1 transition-colors',
                selectedValues.includes(option.value)
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 group-hover:text-gray-900'
              )}
            >
              {option.label}
            </span>
            {option.count && (
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full ml-auto">
                {option.count}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

export function SortDropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm"
      >
        <span className="font-medium whitespace-nowrap">
          {label}:{' '}
          <span className="text-gray-900">
            {options.find((o) => o.value === value)?.label || 'Newest'}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 origin-top-right">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={clsx(
                'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors',
                value === opt.value ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'
              )}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
              {value === opt.value && <Check className="w-4 h-4 text-blue-600" strokeWidth={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DirectoryFilters({
  filters,
  filterOptions,
  sortOption,
  onSortChange,
  onFilterChange,
  onClearFilters,
  viewMode = 'grid', // 'grid' | 'list' | 'map'
  onViewModeChange,
  searchQuery,
  onSearchChange,
  willingToMentor,
  onWillingToMentorChange,
  children, // The grid of profiles
  totalResults,
}) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // Calculate total active filters safely
  const activeFilterCount =
    Object.values(filters).reduce((acc, curr) => {
      return acc + (Array.isArray(curr) ? curr.length : 0)
    }, 0) + (willingToMentor ? 1 : 0)

  const handleCheckboxChange = (sectionId, value) => {
    const currentValues = filters[sectionId] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    onFilterChange(sectionId, newValues)
  }

  // Active filters pills rendering
  const renderActiveFilterPills = () => {
    const pills = []

    // Add willingness to mentor
    if (willingToMentor) {
      pills.push(
        <span
          key="mentor"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          Willing to Mentor
          <button
            onClick={() => onWillingToMentorChange(false)}
            className="hover:bg-blue-200 p-0.5 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )
    }

    // Add category filters
    filterOptions.forEach((section) => {
      const activeValues = filters[section.id] || []
      activeValues.forEach((val) => {
        const option = section.options.find((o) => o.value === val)
        if (option) {
          pills.push(
            <span
              key={`${section.id}-${val}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
            >
              {section.title}: <span className="text-gray-600">{option.label}</span>
              <button
                onClick={() => handleCheckboxChange(section.id, val)}
                className="hover:bg-gray-200 p-0.5 rounded-full transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )
        }
      })
    })

    if (pills.length === 0) return null

    return (
      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/30 md:rounded-b-2xl">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
          Active Filters:
        </span>
        {pills}
      </div>
    )
  }

  return (
    <div className="w-full bg-white h-full">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="bg-white min-h-[calc(100vh-6rem)] rounded-3xl">
          <div className="px-5 sm:px-8 py-6">
            {/* Header Summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl border-gray-300 font-bold text-gray-900 border-none outline-none">
                  Directory
                </h1>
                {totalResults !== undefined && (
                  <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                    {totalResults} <span className="hidden sm:inline">profiles found</span>
                  </span>
                )}
              </div>
            </div>

            {/* Modern Filter Header Bar */}
            <div className="bg-white border md:rounded-2xl border-gray-200 mb-6 shadow-sm flex flex-col relative z-20">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 sm:px-6 py-4 gap-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className={clsx(
                      'flex items-center justify-center gap-2 text-sm font-semibold transition-colors focus:outline-none px-4 py-2.5 rounded-xl flex-1 md:flex-none',
                      isFilterPanelOpen || activeFilterCount > 0
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Filter
                      className={clsx(
                        'w-4 h-4',
                        isFilterPanelOpen || activeFilterCount > 0 ? 'text-white' : 'text-gray-500'
                      )}
                    />
                    {activeFilterCount > 0 ? `${activeFilterCount} Filters` : 'All Filters'}
                  </button>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={onClearFilters}
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors px-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {onSearchChange && (
                  <div className="flex-1 w-full md:max-w-md mx-4 hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="w-4.5 h-4.5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                        placeholder="Search by name, company, role..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
                  {onSortChange && (
                    <SortDropdown
                      label="Sort"
                      value={sortOption}
                      options={[
                        { label: 'Newest', value: 'newest' },
                        { label: 'Oldest', value: 'oldest' },
                        { label: 'Name (A-Z)', value: 'name_asc' },
                        { label: 'Name (Z-A)', value: 'name_desc' },
                      ]}
                      onChange={onSortChange}
                    />
                  )}

                  {onViewModeChange && (
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/50 shadow-inner">
                      <button
                        onClick={() => onViewModeChange('grid')}
                        className={clsx(
                          'p-2 rounded-lg transition-all',
                          viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        )}
                        aria-label="Grid view"
                      >
                        <LayoutGrid className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => onViewModeChange('list')}
                        className={clsx(
                          'p-2 rounded-lg transition-all',
                          viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        )}
                        aria-label="List view"
                      >
                        <List className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => onViewModeChange('map')}
                        className={clsx(
                          'p-2 rounded-lg transition-all',
                          viewMode === 'map'
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        )}
                        aria-label="Map view"
                      >
                        <MapIcon className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Search Input (shows below the top bar on small screens) */}
              {onSearchChange && (
                <div className="md:hidden px-4 sm:px-6 pb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="w-4.5 h-4.5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                      placeholder="Search by name, company, role..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Active Filters Pills */}
              {activeFilterCount > 0 && !isFilterPanelOpen && renderActiveFilterPills()}

              {/* Expandable Mega Menu Panel */}
              {isFilterPanelOpen && (
                <div className="border-t border-gray-200 p-6 sm:p-8 bg-gray-50/80 animate-in slide-in-from-top-2 fade-in duration-200 shadow-inner max-h-[70vh] md:max-h-none overflow-y-auto w-full absolute md:relative z-20 left-0 right-0 md:rounded-b-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                    {filterOptions.map((section) => (
                      <FilterColumn
                        key={section.id}
                        title={section.title}
                        options={section.options}
                        selectedValues={filters[section.id] || []}
                        onChange={(val) => handleCheckboxChange(section.id, val)}
                      />
                    ))}

                    {/* Willing to Mentor Toggle */}
                    {onWillingToMentorChange && (
                      <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                        <label className="flex items-center justify-between cursor-pointer group p-3.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-sm">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                            Willing to Mentor
                          </span>
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={willingToMentor}
                              onChange={(e) => onWillingToMentorChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6">
                    <button
                      onClick={onClearFilters}
                      className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setIsFilterPanelOpen(false)}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                      Show Results ({totalResults})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Grid */}
            <main className="w-full">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
