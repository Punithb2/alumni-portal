import React, { useEffect, useMemo, useState } from 'react'
import api from '../../utils/api'
import useAuth from '../../hooks/useAuth'
import JobsFilterBar from '../../components/Jobs/JobsFilterBar'
import JobCard from '../../components/Jobs/JobCard'
import JobDetailDrawer from '../../components/Jobs/JobDetailDrawer'
import { normalizeJob } from '../../components/Jobs/jobUtils'

const StudentJobBoard = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [industryFilter, setIndustryFilter] = useState('All Industries')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [expFilter, setExpFilter] = useState('All Levels')
  const [alumniRecommendedOnly, setAlumniRecommendedOnly] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState([])
  const [backendJobs, setBackendJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [saveActionError, setSaveActionError] = useState('')
  const [savingJobIds, setSavingJobIds] = useState(new Set())
  const [applyState, setApplyState] = useState({
    jobId: null,
    isSubmitting: false,
    error: '',
    success: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, applicationsResponse, savedJobsResponse] = await Promise.all([
          api.get('/jobs/'),
          api.get('/job-applications/'),
          api.get('/saved-jobs/'),
        ])
        setBackendJobs(jobsResponse.data.results ?? jobsResponse.data)
        setApplications(applicationsResponse.data.results ?? applicationsResponse.data)
        setSavedJobs(savedJobsResponse.data.results ?? savedJobsResponse.data)
      } catch (error) {
        console.error('Failed to fetch jobs page data', error)
        setPageError('Unable to load jobs right now.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const allJobs = useMemo(
    () =>
      (backendJobs || [])
        .map((job) => normalizeJob(job, user?.id))
        .sort((firstJob, secondJob) => {
          const firstId = Number.parseInt(firstJob.id, 10) || 0
          const secondId = Number.parseInt(secondJob.id, 10) || 0
          return secondId - firstId
        }),
    [backendJobs, user?.id]
  )

  const internships = useMemo(() => allJobs.filter((job) => job.type === 'Internship'), [allJobs])
  const appliedJobIds = useMemo(
    () => new Set((applications || []).map((application) => Number(application.job))),
    [applications]
  )
  const savedJobIds = useMemo(
    () => new Set((savedJobs || []).map((savedJob) => String(savedJob.job))),
    [savedJobs]
  )
  const savedJobRecordsByJobId = useMemo(
    () => Object.fromEntries((savedJobs || []).map((savedJob) => [String(savedJob.job), savedJob])),
    [savedJobs]
  )

  const filteredJobs = useMemo(() => {
    const baseList =
      activeTab === 'internships'
        ? internships
        : activeTab === 'saved'
          ? allJobs.filter((job) => savedJobIds.has(job.id))
          : allJobs

    return baseList.filter((job) => {
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
        (expFilter === 'Senior' && job.experience_required?.toLowerCase().includes('senior')) ||
        (expFilter === 'Mid Level' && job.experience_required?.toLowerCase().includes('mid')) ||
        (expFilter === 'Entry Level' &&
          (job.type === 'Internship' ||
            job.experience_required?.toLowerCase().includes('entry'))) ||
        (expFilter === 'Executive' && job.experience_required?.toLowerCase().includes('director'))

      const matchesIndustry = industryFilter === 'All Industries'
      const matchesAlumni = alumniRecommendedOnly ? job.alumniPosted : true

      return (
        matchesSearch && matchesType && matchesLoc && matchesExp && matchesIndustry && matchesAlumni
      )
    })
  }, [
    activeTab,
    allJobs,
    alumniRecommendedOnly,
    expFilter,
    industryFilter,
    internships,
    locationFilter,
    savedJobIds,
    search,
    typeFilter,
  ])

  const toggleSaveJob = async (jobId) => {
    setSaveActionError('')
    setSavingJobIds((previousIds) => new Set(previousIds).add(jobId))

    try {
      const existingSavedJob = savedJobRecordsByJobId[jobId]
      if (existingSavedJob) {
        await api.delete(`/saved-jobs/${existingSavedJob.id}/`)
        setSavedJobs((previousSavedJobs) =>
          previousSavedJobs.filter(
            (savedJob) => Number(savedJob.id) !== Number(existingSavedJob.id)
          )
        )
      } else {
        const response = await api.post('/saved-jobs/', {
          job: Number(jobId),
        })
        setSavedJobs((previousSavedJobs) => [response.data, ...previousSavedJobs])
      }
    } catch (error) {
      const errorData = error?.response?.data
      setSaveActionError(
        errorData?.detail ||
          errorData?.non_field_errors?.[0] ||
          'Unable to update saved jobs right now.'
      )
    } finally {
      setSavingJobIds((previousIds) => {
        const nextIds = new Set(previousIds)
        nextIds.delete(jobId)
        return nextIds
      })
    }
  }

  const handleSubmitApplication = async (job, coverLetter) => {
    setApplyState({
      jobId: job.rawId,
      isSubmitting: true,
      error: '',
      success: '',
    })

    try {
      const response = await api.post('/job-applications/', {
        job: job.rawId,
        cover_letter: (coverLetter || '').trim(),
      })
      setApplications((previousApplications) => [
        response.data,
        ...previousApplications.filter(
          (application) => Number(application.id) !== Number(response.data.id)
        ),
      ])
      setApplyState({
        jobId: job.rawId,
        isSubmitting: false,
        error: '',
        success: 'Application submitted successfully.',
      })
    } catch (error) {
      const errorData = error?.response?.data
      const firstFieldError = Object.values(errorData || {}).find(
        (value) => Array.isArray(value) && value.length > 0
      )

      setApplyState({
        jobId: job.rawId,
        isSubmitting: false,
        error:
          errorData?.detail ||
          errorData?.non_field_errors?.[0] ||
          firstFieldError?.[0] ||
          'Unable to submit your application right now.',
        success: '',
      })
    }
  }

  const selectedJobApplicationState = selectedJob
    ? {
        ...applyState,
        hasApplied: appliedJobIds.has(Number(selectedJob.rawId)),
        error: applyState.jobId === selectedJob.rawId ? applyState.error : '',
        success: applyState.jobId === selectedJob.rawId ? applyState.success : '',
        isSubmitting: applyState.jobId === selectedJob.rawId ? applyState.isSubmitting : false,
      }
    : {}

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1500px] flex-col px-4 pb-8 font-sans sm:px-6 lg:px-8">
      <JobDetailDrawer
        key={selectedJob?.id || 'student-job-drawer'}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        viewerRole="student"
        onSubmitApplication={handleSubmitApplication}
        applicationState={selectedJobApplicationState}
      />

      <div className="mb-6 mt-4 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:mt-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Student Job Board
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Browse full-time jobs and internships shared by our alumni network.
          </p>
        </div>
      </div>

      {(pageError || saveActionError) && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {pageError || saveActionError}
        </div>
      )}

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

      <div className="mt-2 flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 scrollbar-hide">
            {[
              { id: 'all', label: `All Jobs (${allJobs.length})` },
              { id: 'internships', label: `Internships (${internships.length})` },
              { id: 'saved', label: `Saved (${savedJobIds.size})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap px-5 py-3 text-sm font-bold transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-t-md bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="flex flex-col">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onSave={toggleSaveJob}
                  onApply={setSelectedJob}
                  actionLabel={appliedJobIds.has(Number(job.rawId)) ? 'Applied' : 'Apply'}
                  isSaving={savingJobIds.has(job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                <span className="text-3xl">?</span>
              </div>
              <p className="text-lg font-bold text-slate-800">No jobs found</p>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
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
