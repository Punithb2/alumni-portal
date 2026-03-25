import React, { useState, useMemo, useEffect } from 'react'
import DirectoryFilters from '../../components/DirectoryFilters'
import api from '../../utils/api'
import {
  Mail,
  MapPin,
  Briefcase,
  ChevronRight,
  UserPlus,
  BookOpen,
  Home,
  Download,
  Star,
  CheckCircle,
  Search,
  FileText,
} from 'lucide-react'
import ProfileSheet from '../Alumni/ProfileSheet'
import DirectoryMap from '../../components/DirectoryMap'
import { STUDENT_FILTER_OPTIONS } from '../../data/directoryFilters'
import { getAvatarDataUrl } from '../../utils/avatar'

export default function StudentDirectory() {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filters, setFilters] = useState({
    industry: [],
    company: [],
    mentorship: [],
    skills: [],
    hiring: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const [sortOption, setSortOption] = useState('newest')
  const [selectedProfile, setSelectedProfile] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 24
  const [backendProfiles, setBackendProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    api
      .get('/profiles/')
      .then((res) => setBackendProfiles(res.data.results ?? res.data))
      .catch((err) => console.error('Failed to fetch profiles', err))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1)
    }, 0)
  }, [filters, debouncedSearchQuery, sortOption])

  const filteredProfiles = useMemo(() => {
    let result = [...backendProfiles]

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          (p.headline && p.headline.toLowerCase().includes(q)) ||
          (p.current_company && p.current_company.toLowerCase().includes(q))
      )
    }

    if (filters.industry.length > 0) {
      result = result.filter((p) =>
        filters.industry.some(
          (i) => (p.department || '').includes(i) || (p.headline || '').includes(i)
        )
      )
    }
    if (filters.company.length > 0) {
      result = result.filter((p) =>
        filters.company.some((c) => (p.current_company || '').includes(c))
      )
    }
    if (filters.mentorship && filters.mentorship.length > 0) {
      if (filters.mentorship.includes('yes')) {
        result = result.filter((p) => p.willing_to_mentor === true)
      }
    }
    if (filters.skills && filters.skills.length > 0) {
      result = result.filter((p) =>
        filters.skills.some((skill) => p.skills && p.skills.includes(skill))
      )
    }
    if (filters.hiring && filters.hiring.length > 0) {
      if (filters.hiring.includes('yes')) {
        result = result.filter((p) => p.willing_to_hire === true)
      }
    }

    result.sort((a, b) => {
      if (sortOption === 'name_asc') return a.first_name.localeCompare(b.first_name)
      if (sortOption === 'name_desc') return b.first_name.localeCompare(a.first_name)
      if (sortOption === 'newest') return (b.graduation_year || 0) - (a.graduation_year || 0)
      if (sortOption === 'oldest') return (a.graduation_year || 0) - (b.graduation_year || 0)
      return 0
    })

    return result
  }, [filters, sortOption, debouncedSearchQuery, backendProfiles])

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProfiles, currentPage])

  const renderGridCard = (profile) => (
    <div
      key={profile.id}
      className="relative flex flex-col items-center gap-3 cursor-pointer group p-5 rounded-2xl transition-all hover:bg-gray-50 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 text-center"
      onClick={() => setSelectedProfile(profile)}
    >
      <img
        src={profile.avatar || getAvatarDataUrl(`${profile.first_name} ${profile.last_name}`)}
        alt={profile.first_name}
        className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-md"
      />
      <div className="flex-1 w-full min-w-0 flex flex-col items-center">
        <h3 className="font-bold text-gray-900 text-[15px] leading-tight w-full truncate px-2">
          {profile.first_name} {profile.last_name}
        </h3>
        <p className="text-[13px] text-gray-500 font-medium w-full truncate mt-1 px-2">
          {profile.headline || profile.current_position || 'Professional'}
        </p>

        {(profile.current_company || profile.city) && (
          <div className="text-[12px] text-gray-500 mt-2 flex items-center justify-center gap-1.5 w-full px-2">
            {profile.current_company && (
              <span className="font-medium text-gray-700 truncate">{profile.current_company}</span>
            )}
            {profile.current_company && profile.city && (
              <span className="text-gray-300 shrink-0">•</span>
            )}
            {profile.city && <span className="truncate">{profile.city}</span>}
          </div>
        )}

        {(profile.department || profile.graduation_year) && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 w-full">
            {profile.department && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100/50 max-w-full truncate">
                {profile.department}
              </span>
            )}
            {profile.graduation_year && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200/50 whitespace-nowrap">
                Class of '{String(profile.graduation_year).slice(-2)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <DirectoryFilters
        filters={filters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={STUDENT_FILTER_OPTIONS}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onFilterChange={(sectionId, newValues) =>
          setFilters((prev) => ({ ...prev, [sectionId]: newValues }))
        }
        onClearFilters={() =>
          setFilters({ industry: [], company: [], mentorship: [], skills: [], hiring: [] })
        }
        totalResults={filteredProfiles.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        <div className="w-full mt-4 sm:mt-6">
          {actionMessage && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {actionMessage}
            </div>
          )}
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : viewMode === 'grid' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
                {paginatedProfiles.map((p) => renderGridCard(p))}
              </div>
              {filteredProfiles.length > ITEMS_PER_PAGE && (
                <div className="flex justify-between items-center mt-8 px-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 font-medium">
                    Page {currentPage} of {Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= filteredProfiles.length}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* List View (Datatable) */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4 font-semibold">Alumni</th>
                      <th className="px-6 py-4 font-semibold hidden md:table-cell">Graduation</th>
                      <th className="px-6 py-4 font-semibold hidden sm:table-cell">Department</th>
                      <th className="px-6 py-4 font-semibold hidden lg:table-cell">Company</th>
                      <th className="px-6 py-4 font-semibold hidden lg:table-cell">Location</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedProfiles.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProfile(p)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatar || getAvatarDataUrl(`${p.first_name} ${p.last_name}`)}
                              alt={p.first_name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-300"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                                  {p.first_name} {p.last_name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 line-clamp-1">
                                {p.current_position || 'Professional'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600 font-medium whitespace-nowrap">
                          Class of {p.graduation_year}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">
                          {p.department || '-'}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">
                              {p.current_company || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">{p.city || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProfile(p)
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="View Profile"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActionMessage(
                                  `Messaging for ${p.first_name} is not enabled yet. This action is currently in preview mode.`
                                )
                              }}
                              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                              title="Message"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProfiles.length > ITEMS_PER_PAGE && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 font-medium">
                    Page {currentPage} of {Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= filteredProfiles.length}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {viewMode === 'map' && (
            <DirectoryMap profiles={filteredProfiles} onProfileClick={setSelectedProfile} />
          )}

          {filteredProfiles.length === 0 && (
            <div className="py-20 sm:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-200 border-dashed mt-4 sm:mt-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 sm:border-8 border-gray-100/50">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No profiles found</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm mb-6">
                We couldn't find any profiles matching your current search or filter criteria.
              </p>
              <button
                onClick={() =>
                  setFilters({ industry: [], company: [], mentorship: [], skills: [], hiring: [] })
                }
                className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-sm sm:text-base"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </DirectoryFilters>

      <ProfileSheet
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        viewerRole="Student"
      />
    </div>
  )
}
