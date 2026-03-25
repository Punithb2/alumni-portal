import React, { useState, useMemo, useEffect } from 'react'
import DirectoryFilters from '../../components/DirectoryFilters'
import api from '../../utils/api'
import { ALUMNI_FILTER_OPTIONS } from '../../data/directoryFilters'
import {
  MapPin,
  Briefcase,
  ChevronRight,
  Home,
  Search,
  Download,
  FileText,
  Globe,
  UserPlus,
  Shield,
  Star,
  CheckCircle,
  MessageSquare,
} from 'lucide-react'
import DirectoryMap from '../../components/DirectoryMap'
import ProfileSheet from './ProfileSheet'
import { getAvatarDataUrl } from '../../utils/avatar'

export default function AlumniDirectory() {
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list', 'map'
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    year: [],
    department: [],
    industry: [],
    company: [],
    location: [],
    skills: [],
    hiring: [],
  })
  const [willingToMentor, setWillingToMentor] = useState(false)
  const [sortOption, setSortOption] = useState('newest')
  const [backendProfiles, setBackendProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 24

  // Fetch Profiles from Backend
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await api.get('/profiles/')
        const profilesData = response.data.results || response.data
        setBackendProfiles(profilesData)
      } catch (error) {
        console.error('Failed to fetch profiles', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfiles()
  }, [])

  const handleClearAllFilters = () => {
    setFilters({
      year: [],
      department: [],
      industry: [],
      company: [],
      location: [],
      skills: [],
      hiring: [],
    })
    setWillingToMentor(false)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const filteredProfiles = useMemo(() => {
    let result = [...backendProfiles]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => {
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
        return (
          fullName.includes(q) ||
          (p.headline && p.headline.toLowerCase().includes(q)) ||
          (p.current_company && p.current_company.toLowerCase().includes(q)) ||
          (p.current_position && p.current_position.toLowerCase().includes(q)) ||
          (p.department && p.department.toLowerCase().includes(q))
        )
      })
    }

    if (filters.department.length > 0) {
      result = result.filter((p) =>
        filters.department.some((dep) => p.department && p.department.includes(dep))
      )
    }

    if (filters.industry.length > 0) {
      result = result.filter((p) =>
        filters.industry.some(
          (ind) =>
            (p.department && p.department.includes(ind)) || (p.headline && p.headline.includes(ind))
        )
      )
    }

    if (filters.company.length > 0) {
      result = result.filter((p) =>
        filters.company.some((comp) => p.current_company && p.current_company.includes(comp))
      )
    }

    if (filters.location.length > 0) {
      result = result.filter((p) => filters.location.some((loc) => p.city && p.city.includes(loc)))
    }

    if (filters.year.length > 0) {
      result = result.filter((p) => {
        if (filters.year.includes('older')) {
          if (p.graduation_year < 2020) return true
        }
        return filters.year.includes(String(p.graduation_year))
      })
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

    if (willingToMentor) {
      result = result.filter((p) => p.willing_to_mentor === true)
    }

    result.sort((a, b) => {
      if (sortOption === 'name_asc') return a.first_name.localeCompare(b.first_name)
      if (sortOption === 'name_desc') return b.first_name.localeCompare(a.first_name)
      if (sortOption === 'newest') return b.graduation_year - a.graduation_year
      if (sortOption === 'oldest') return a.graduation_year - b.graduation_year
      return 0
    })

    return result
  }, [filters, sortOption, searchQuery, willingToMentor, backendProfiles])

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProfiles, currentPage])

  const renderMapPlaceholder = () => (
    <DirectoryMap profiles={filteredProfiles} onProfileClick={(p) => setSelectedProfile(p)} />
  )

  return (
    <div className="min-h-screen bg-white">
      <DirectoryFilters
        filters={filters}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setCurrentPage(1)
        }}
        filterOptions={ALUMNI_FILTER_OPTIONS}
        sortOption={sortOption}
        onSortChange={(val) => {
          setSortOption(val)
          setCurrentPage(1)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredProfiles.length}
        willingToMentor={willingToMentor}
        onWillingToMentorChange={(val) => {
          setWillingToMentor(val)
          setCurrentPage(1)
        }}
        onFilterChange={(sectionId, newValues) => {
          setFilters((prev) => ({ ...prev, [sectionId]: newValues }))
          setCurrentPage(1)
        }}
        onClearFilters={handleClearAllFilters}
      >
        <div className="pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            viewMode === 'grid' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {paginatedProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="relative flex flex-col cursor-pointer group rounded-2xl transition-all hover:-translate-y-1 bg-white border border-gray-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-blue-200 flex-1 h-full"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      {/* Banner Image */}
                      <div className="h-20 w-full bg-gradient-to-r from-blue-100 to-indigo-50"></div>

                      {/* Avatar & Content */}
                      <div className="px-5 pb-5 flex-1 flex flex-col relative pt-0">
                        <div className="flex justify-center -mt-10 mb-3">
                          <img
                            src={
                              profile.avatar ||
                              getAvatarDataUrl(`${profile.first_name} ${profile.last_name}`)
                            }
                            alt={profile.first_name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm bg-white"
                          />
                        </div>

                        <div className="flex-1 flex flex-col items-center text-center">
                          <h3 className="font-bold text-gray-900 text-base leading-tight w-full truncate mb-1">
                            {profile.first_name} {profile.last_name}
                          </h3>
                          <p className="text-[13px] text-gray-600 font-medium w-full line-clamp-2 min-h-[39px]">
                            {profile.headline || profile.current_position || 'Professional'}
                          </p>

                          <div className="text-xs text-gray-500 mt-2.5 flex items-center justify-center gap-1 w-full flex-wrap">
                            {profile.current_company && (
                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">
                                  {profile.current_company}
                                </span>
                              </span>
                            )}
                          </div>
                          {profile.city && (
                            <div className="text-xs text-gray-500 mt-1.5 flex items-center justify-center gap-1 w-full">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">{profile.city}</span>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap justify-center gap-1.5 w-full">
                            {profile.department && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-100 max-w-full truncate">
                                {profile.department}
                              </span>
                            )}
                            {profile.graduation_year && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100/50 whitespace-nowrap">
                                Class of '{String(profile.graduation_year).slice(-2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Action buttons on card */}
                      <div className="px-5 pb-5 pt-2 flex items-center justify-center gap-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            alert(
                              `Connection request sent to ${profile.first_name} ${profile.last_name}!`
                            )
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProfile(profile)
                          }}
                          className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                          title="View Profile"
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  ))}
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
            )
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
                    {paginatedProfiles.map((profile) => (
                      <tr
                        key={profile.id}
                        onClick={() => setSelectedProfile(profile)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                profile.avatar ||
                                getAvatarDataUrl(`${profile.first_name} ${profile.last_name}`)
                              }
                              alt={profile.first_name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-300"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                                  {profile.first_name} {profile.last_name}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 line-clamp-1">
                                {profile.current_position || 'Professional'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600 font-medium whitespace-nowrap">
                          Class of {profile.graduation_year}
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">
                          {profile.department || '-'}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">
                              {profile.current_company || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">{profile.city || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProfile(profile)
                              }}
                              className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors shadow-sm font-medium"
                              title="View Profile"
                            >
                              Profile
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(
                                  `Connection request sent to ${profile.first_name} ${profile.last_name}!`
                                )
                              }}
                              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm font-medium flex items-center gap-1.5"
                              title="Connect"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Connect
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

          {/* Map View */}
          {viewMode === 'map' && renderMapPlaceholder()}

          {filteredProfiles.length === 0 && (
            <div className="py-20 sm:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-200 border-dashed mt-4 sm:mt-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 sm:border-8 border-gray-100/50">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No alumni found</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm mb-6">
                We couldn't find any alumni matching your current search or filter criteria.
              </p>
              <button
                onClick={handleClearAllFilters}
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
      />
    </div>
  )
}
