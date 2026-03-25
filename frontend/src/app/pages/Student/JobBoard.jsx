import React, { useState, useMemo } from 'react'
import { MOCK_JOBS } from '../../utils/mockData'
import { dummyJobs } from '../../data/dummyData'

import JobsFilterBar from '../../components/Jobs/JobsFilterBar'
import JobCard from '../../components/Jobs/JobCard'
import JobDetailDrawer from '../../components/Jobs/JobDetailDrawer'
import { SeekerProfileModal } from '../../components/Jobs/JobModals'

// Normalize MOCK_JOBS
const normalizeJob = (job) => ({
  id: String(job.id),
  title: job.title,
  company: job.company,
  location: job.is_remote ? 'Remote' : job.location,
  type:
    job.type ||
    {
      full_time: 'Full-time',
      part_time: 'Part-time',
      internship: 'Internship',
      contract: 'Contract',
    }[job.job_type] ||
    'Full-time',
  description: job.description,
  salary:
    job.salary ||
    (job.salary_min && job.salary_max
      ? `$${job.salary_min} - $${job.salary_max}`
      : 'Not specified'),
  experience_required: job.experience_required || 'Not specified',
  postedDate: job.postedDate || 'Recently',
  logo: job.logo || null,
  postedBy: job.posted_by,
  canRefer: Math.random() > 0.7, // Mock referral status
  alumniPosted: Math.random() > 0.5, // Mock alumni posted status
})

const StudentJobBoard = () => {
  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [industryFilter, setIndustryFilter] = useState('All Industries')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [expFilter, setExpFilter] = useState('All Levels')
  const [alumniRecommendedOnly, setAlumniRecommendedOnly] = useState(false)

  const [activeTab, setActiveTab] = useState('all') // 'all', 'internships', 'saved'
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const [savedJobIds, setSavedJobIds] = useState(new Set())

  // Derived Data
  const allJobs = useMemo(() => {
    const defaultMock = (MOCK_JOBS || []).map(normalizeJob)
    const dummys = dummyJobs.map((j) => ({ ...j, postedDate: 'Recently' }))
    return [...dummys, ...defaultMock].sort((a, b) => {
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idA - idB
    })
  }, [])

  const internships = useMemo(() => allJobs.filter((j) => j.type === 'Internship'), [allJobs])

  const filteredJobs = useMemo(() => {
    let list =
      activeTab === 'internships'
        ? internships
        : activeTab === 'saved'
          ? allJobs.filter((j) => savedJobIds.has(j.id))
          : allJobs

    return list.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'All Types' || job.type === typeFilter
      const matchesLoc =
        locationFilter === 'All Locations' ||
        (locationFilter === 'Remote' && job.location?.includes('Remote')) ||
        (locationFilter === 'On-site' && !job.location?.includes('Remote'))

      const matchesExp =
        expFilter === 'All Levels' ||
        (expFilter === 'Senior' && job.experience_required?.includes('5+')) ||
        (expFilter === 'Mid Level' && job.experience_required?.includes('3+')) ||
        (expFilter === 'Entry Level' && job.type === 'Internship') ||
        expFilter === 'All Levels'

      const matchesInd = industryFilter === 'All Industries'

      const matchesAlumni = alumniRecommendedOnly
        ? job.alumniRecommended || job.alumniPosted || job.postedByRole === 'Alumni'
        : true

      return matchesSearch && matchesType && matchesLoc && matchesExp && matchesInd && matchesAlumni
    })
  }, [
    allJobs,
    internships,
    activeTab,
    search,
    typeFilter,
    locationFilter,
    expFilter,
    industryFilter,
    savedJobIds,
    alumniRecommendedOnly,
  ])

  // Handlers
  const toggleSaveJob = (id) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApply = (job) => {
    setSelectedJob(job)
  }

  return (
    <div className="max-w-[1500px] mx-auto min-h-[calc(100vh-100px)] flex flex-col pb-8 font-sans px-4 sm:px-6 lg:px-8">
      <SeekerProfileModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4 md:mt-8 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Job Board
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Browse full-time jobs and internships prominently featured by our alumni network.
          </p>
        </div>
      </div>

      {/* Horizontal Filters */}
      <JobsFilterBar
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        expFilter={expFilter}
        setExpFilter={setExpFilter}
        alumniRecommendedOnly={alumniRecommendedOnly}
        setAlumniRecommendedOnly={setAlumniRecommendedOnly}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-2">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 scrollbar-hide">
            {[
              { id: 'all', label: `All Jobs (${allJobs.length})` },
              { id: 'internships', label: `Internships (${internships.length})` },
              { id: 'saved', label: `Saved (${savedJobIds.size})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-5 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></div>
                )}
              </button>
            ))}
          </div>

          {filteredJobs.length > 0 ? (
            <div className="flex flex-col">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onSave={toggleSaveJob}
                  onApply={handleApply}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <span className="text-3xl">??</span>
              </div>
              <p className="text-lg font-bold text-slate-800">No jobs found</p>
              <p className="text-sm mt-2 text-slate-500 max-w-xs">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentJobBoard
