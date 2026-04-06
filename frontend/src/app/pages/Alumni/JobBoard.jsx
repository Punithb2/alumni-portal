import React, { useEffect, useMemo, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import api from '../../utils/api'
import JobsFilterBar from '../../components/Jobs/JobsFilterBar'
import JobCard from '../../components/Jobs/JobCard'
import JobDetailDrawer from '../../components/Jobs/JobDetailDrawer'
import { PostJobWizard } from '../../components/Jobs/JobModals'
import { getInitials, normalizeJob } from '../../components/Jobs/jobUtils'

const AlumniJobBoard = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [industryFilter, setIndustryFilter] = useState('All Industries')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [expFilter, setExpFilter] = useState('All Levels')
  const [alumniRecommendedOnly, setAlumniRecommendedOnly] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [backendJobs, setBackendJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [profiles, setProfiles] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null)
  const [savingJobIds, setSavingJobIds] = useState(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, applicationsResponse, profilesResponse, savedJobsResponse] =
          await Promise.all([
            api.get('/jobs/'),
            api.get('/job-applications/'),
            api.get('/profiles/'),
            api.get('/saved-jobs/'),
          ])
        setBackendJobs(jobsResponse.data.results ?? jobsResponse.data)
        setApplications(applicationsResponse.data.results ?? applicationsResponse.data)
        setProfiles(profilesResponse.data.results ?? profilesResponse.data)
        setSavedJobs(savedJobsResponse.data.results ?? savedJobsResponse.data)
      } catch (error) {
        console.error('Failed to fetch alumni jobs page data', error)
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

  const jobsById = useMemo(
    () => Object.fromEntries(allJobs.map((job) => [Number(job.rawId), job])),
    [allJobs]
  )

  const profilesByUserId = useMemo(
    () =>
      Object.fromEntries((profiles || []).map((profile) => [Number(profile?.user?.id), profile])),
    [profiles]
  )

  const myPostedJobs = useMemo(
    () => allJobs.filter((job) => Number(job.postedById) === Number(user?.id)),
    [allJobs, user?.id]
  )

  const myPostedJobIds = useMemo(
    () => new Set(myPostedJobs.map((job) => Number(job.rawId))),
    [myPostedJobs]
  )
  const savedJobIds = useMemo(
    () => new Set((savedJobs || []).map((savedJob) => String(savedJob.job))),
    [savedJobs]
  )
  const savedJobRecordsByJobId = useMemo(
    () => Object.fromEntries((savedJobs || []).map((savedJob) => [String(savedJob.job), savedJob])),
    [savedJobs]
  )

  const referralRequests = useMemo(
    () =>
      (applications || [])
        .filter((application) => {
          const job = jobsById[Number(application.job)]
          return myPostedJobIds.has(Number(application.job)) && job?.canRefer
        })
        .map((application) => {
          const applicantProfile = profilesByUserId[Number(application.applicant)] || null
          const applicantName =
            applicantProfile?.user?.first_name || applicantProfile?.user?.last_name
              ? `${applicantProfile?.user?.first_name || ''} ${applicantProfile?.user?.last_name || ''}`.trim()
              : applicantProfile?.user?.username || `Applicant #${application.applicant}`
          const job = jobsById[Number(application.job)]

          return {
            ...application,
            applicantName,
            applicantHeadline: applicantProfile?.headline || '',
            applicantAvatar: applicantProfile?.avatar || '',
            applicantInitials: getInitials(applicantName),
            jobTitle: application.job_title || job?.title || 'Job',
            jobCompany: application.job_company || job?.company || '',
          }
        })
        .sort((firstApplication, secondApplication) => {
          return new Date(secondApplication.applied_at) - new Date(firstApplication.applied_at)
        }),
    [applications, jobsById, myPostedJobIds, profilesByUserId]
  )

  const pendingReferralRequests = useMemo(
    () => referralRequests.filter((application) => application.status === 'pending'),
    [referralRequests]
  )

  const filteredJobs = useMemo(() => {
    const baseList =
      activeTab === 'saved'
        ? allJobs.filter((job) => savedJobIds.has(job.id))
        : activeTab === 'myposts'
          ? myPostedJobs
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
        (expFilter === 'Entry Level' && job.experience_required?.toLowerCase().includes('entry')) ||
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
    locationFilter,
    myPostedJobs,
    savedJobIds,
    search,
    typeFilter,
  ])

  const toggleSaveJob = async (jobId) => {
    setActionError('')
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
      setActionError(
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

  const handlePost = async (payload) => {
    setIsPublishing(true)
    setActionError('')

    try {
      const response = await api.post('/jobs/', payload)
      setBackendJobs((previousJobs) => [response.data, ...previousJobs])
      setActiveTab('myposts')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleApproveRequest = async (applicationId) => {
    setUpdatingApplicationId(applicationId)
    setActionError('')

    try {
      const response = await api.patch(`/job-applications/${applicationId}/`, {
        status: 'accepted',
      })
      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          Number(application.id) === Number(applicationId) ? response.data : application
        )
      )
      if (selectedApplication && Number(selectedApplication.id) === Number(applicationId)) {
        setSelectedApplication((previousApplication) => ({
          ...previousApplication,
          ...response.data,
          status: response.data.status,
        }))
      }
    } catch (error) {
      const errorData = error?.response?.data
      setActionError(
        errorData?.detail ||
          errorData?.non_field_errors?.[0] ||
          'Unable to approve this request right now.'
      )
    } finally {
      setUpdatingApplicationId(null)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1500px] flex-col px-4 pb-8 font-sans sm:px-6 lg:px-8">
      <PostJobWizard
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handlePost}
        isSubmitting={isPublishing}
      />
      <JobDetailDrawer
        key={selectedJob?.id || 'alumni-job-drawer'}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        viewerRole="alumni"
      />

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Referral Request</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedApplication.applicantName} for {selectedApplication.jobTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                x
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {selectedApplication.applicantAvatar ? (
                    <img
                      src={selectedApplication.applicantAvatar}
                      alt={selectedApplication.applicantName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedApplication.applicantInitials
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedApplication.applicantName}</p>
                  <p className="text-sm text-slate-500">
                    {selectedApplication.applicantHeadline || 'No headline added'}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    {selectedApplication.status}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-2 text-sm font-bold text-slate-800">Applicant Message</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {selectedApplication.cover_letter?.trim() || 'No message was provided.'}
                </p>
              </div>

              {actionError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <button
                  onClick={() => handleApproveRequest(selectedApplication.id)}
                  disabled={updatingApplicationId === selectedApplication.id}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingApplicationId === selectedApplication.id ? 'Approving...' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 mt-4 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:mt-8 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Alumni Job Board
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Discover exclusive careers, post opportunities, and manage referrals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <span className="text-lg leading-none">+</span> Post a Job
          </button>
        </div>
      </div>

      {(pageError || actionError) && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {pageError || actionError}
        </div>
      )}

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

      <div className="mt-2 flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 scrollbar-hide">
            {[
              { id: 'all', label: `All Jobs (${allJobs.length})` },
              { id: 'saved', label: `Saved (${savedJobIds.size})` },
              { id: 'myposts', label: `My Posted Jobs (${myPostedJobs.length})` },
              { id: 'referrals', label: `Referral Requests (${pendingReferralRequests.length})` },
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

          {activeTab === 'referrals' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Pending Referral Requests</h2>
              {pendingReferralRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No pending referral requests yet. Student applications for your jobs will appear
                  here.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReferralRequests.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {application.applicantAvatar ? (
                            <img
                              src={application.applicantAvatar}
                              alt={application.applicantName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            application.applicantInitials
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            {application.applicantName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Requested referral for: {application.jobTitle}
                            {application.jobCompany ? ` at ${application.jobCompany}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          View Message
                        </button>
                        <button
                          onClick={() => handleApproveRequest(application.id)}
                          disabled={updatingApplicationId === application.id}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingApplicationId === application.id ? 'Approving...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isLoading ? (
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
                  actionLabel="View Details"
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

export default AlumniJobBoard
