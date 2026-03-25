import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, CheckSquare } from 'lucide-react'

const DropdownFilter = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasSelection =
    value !== 'All' &&
    value !== 'All Levels' &&
    value !== 'All Types' &&
    value !== 'All Industries' &&
    value !== 'All Locations'
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors bg-white rounded-md border border-transparent hover:border-slate-200"
      >
        {label}
        {hasSelection && (
          <span className="flex bg-slate-100 text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded">
            1
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 shadow-lg rounded-xl z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === option ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {value === option && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const JobsFilterBar = ({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  industryFilter,
  setIndustryFilter,
  locationFilter,
  setLocationFilter,
  expFilter,
  setExpFilter,
  alumniRecommendedOnly,
  setAlumniRecommendedOnly,
}) => {
  return (
    <div className="w-full bg-white border-y border-slate-200 py-3 mb-6 px-4 sticky top-0 z-30">
      <div className="flex items-center justify-between flex-wrap gap-4 max-w-[1500px] mx-auto">
        {/* Left Side: Search / Sort */}
        <div className="flex items-center flex-1 min-w-[200px] max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:font-normal"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {setAlumniRecommendedOnly && (
            <button
              onClick={() => setAlumniRecommendedOnly(!alumniRecommendedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all border ${alumniRecommendedOnly ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
            >
              <CheckSquare
                className={`w-4 h-4 ${alumniRecommendedOnly ? 'text-amber-600' : 'text-slate-400'}`}
              />
              Alumni Recommended
            </button>
          )}
          <DropdownFilter
            label="Job Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship']}
          />
          <DropdownFilter
            label="Industry"
            value={industryFilter}
            onChange={setIndustryFilter}
            options={[
              'All Industries',
              'Technology',
              'Finance',
              'Healthcare',
              'Education',
              'Non-profit',
            ]}
          />
          <DropdownFilter
            label="Location"
            value={locationFilter}
            onChange={setLocationFilter}
            options={['All Locations', 'Remote', 'On-site']}
          />
          <DropdownFilter
            label="Experience"
            value={expFilter}
            onChange={setExpFilter}
            options={['All Levels', 'Entry Level', 'Mid Level', 'Senior', 'Executive']}
          />
        </div>
      </div>
    </div>
  )
}

export default JobsFilterBar
