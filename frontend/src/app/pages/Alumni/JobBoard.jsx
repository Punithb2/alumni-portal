import React, { useState, useMemo, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import api from '../../utils/api'

import JobsFilterBar from '../../components/Jobs/JobsFilterBar'
import JobCard from '../../components/Jobs/JobCard'
import JobDetailDrawer from '../../components/Jobs/JobDetailDrawer'
import { PostJobWizard } from '../../components/Jobs/JobModals'
import { Briefcase, Handshake, CheckSquare } from 'lucide-react'

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

const AlumniJobBoard = () => {
  const { user } = useAuth()

  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [industryFilter, setIndustryFilter] = useState('All Industries')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [expFilter, setExpFilter] = useState('All Levels')
  const [alumniRecommendedOnly, setAlumniRecommendedOnly] = useState(false)

  const [activeTab, setActiveTab] = useState('all') // 'all' or 'saved' or 'myposts' or 'referrals'
  const [showModal, setShowModal] = useState(false)
  const [openToWork, setOpenToWork] = useState(false)

  const [backendJobs, setBackendJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [postedJobs, setPostedJobs] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [selectedJob, setSelectedJob] = useState(null)

  // Fetch Jobs from Backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/')
        const jobsData = response.data.results || response.data
        setBackendJobs(jobsData)
      } catch (error) {
        console.error('Failed to fetch jobs', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Derived Data
  const allJobs = useMemo(() => {
    const normalizedBackend = (backendJobs || []).map(normalizeJob)
    const normalizedPosted = (postedJobs || []).map(normalizeJob)
    const jobs = [...normalizedPosted, ...normalizedBackend]
    return jobs.sort((a, b) => {
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idB - idA // Newest first
    })
  }, [backendJobs, postedJobs])

  const filteredJobs = useMemo(() => {
    let list =
      activeTab === 'saved'
        ? allJobs.filter((j) => savedJobIds.has(j.id))
        : activeTab === 'myposts'
          ? postedJobs
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
    activeTab,
    search,
    typeFilter,
    locationFilter,
    expFilter,
    industryFilter,
    savedJobIds,
    postedJobs,
    alumniRecommendedOnly,
  ])

  // Handlers
  const handlePost = (job) => {
    setPostedJobs([
      {
        ...job,
        id: 'mypost-' + Date.now(),
        postedBy: user?.name || 'Alumni',
        postedByRole: 'Alumni',
        alumniPosted: true,
      },
      ...postedJobs,
    ])
    setShowModal(false)
    setActiveTab('myposts')
  }

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
      <PostJobWizard isOpen={showModal} onClose={() => setShowModal(false)} onSave={handlePost} />
      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4 md:mt-8 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Alumni Job Board
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Discover exclusive careers, post opportunities, and manage referrals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm font-semibold text-slate-700">Open to Work</span>
            <button
              onClick={() => setOpenToWork(!openToWork)}
              className={`w-10 h-5 rounded-full relative transition-colors ${openToWork ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${openToWork ? 'left-5' : 'left-0.5'}`}
              ></span>
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <span className="text-lg leading-none">+</span> Post a Job
          </button>
        </div>
      </div>

      {openToWork && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-indigo-900 text-sm">
              Your profile is visible to recruiters!
            </h3>
            <p className="text-xs text-indigo-700 mt-1">
              Target Roles: Frontend Developer, Software Engineer � Location: Any
            </p>
          </div>
          <button className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50">
            Edit Preferences
          </button>
        </div>
      )}

      {/* Horizontal Filters */}
      {activeTab !== 'myposts' && activeTab !== 'referrals' && (
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
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-2">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 scrollbar-hide">
            {[
              { id: 'all', label: `All Jobs (${allJobs.length})` },
              { id: 'saved', label: `Saved (${savedJobIds.size})` },
              { id: 'myposts', label: `My Posted Jobs (${postedJobs.length})` },
              { id: 'referrals', label: 'Referral Requests (2)' },
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

          {activeTab === 'referrals' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Referral Requests</h2>
              <div className="space-y-4">
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      SJ
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Sarah Jenkins (Student)</h4>
                      <p className="text-xs text-slate-500">
                        Requested referral for: Software Engineer at Innovate
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      View Message
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                      Approve
                    </button>
                  </div>
                </div>
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                      MK
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Mike Ross (Student)</h4>
                      <p className="text-xs text-slate-500">Requested referral for: Data Analyst</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      View Message
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
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

export default AlumniJobBoard
