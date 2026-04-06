import React, { useState } from 'react'
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  UserCircle,
  ExternalLink,
  Handshake,
} from 'lucide-react'

const JobDetailDrawer = ({
  job,
  onClose,
  viewerRole = 'student',
  onSubmitApplication,
  applicationState = {},
}) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  if (!job) return null

  const requirements = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === 'string'
      ? job.requirements.split('\n').filter((requirement) => requirement.trim())
      : []

  const { isSubmitting = false, error = '', success = '', hasApplied = false } = applicationState
  const canApplyInternally = viewerRole === 'student' && !job.link
  const primaryLabel =
    viewerRole !== 'student'
      ? job.link
        ? 'Open Link'
        : null
      : hasApplied
        ? 'Applied'
        : job.link
          ? 'Apply Externally'
          : showApplicationForm
            ? job.canRefer
              ? 'Apply & Request Referral'
              : 'Submit Application'
            : job.canRefer
              ? 'Apply for Referral'
              : 'Apply Now'

  const handlePrimaryAction = () => {
    if (job.link) {
      window.open(job.link, '_blank', 'noopener,noreferrer')
      return
    }

    if (viewerRole !== 'student' || hasApplied) {
      return
    }

    if (!showApplicationForm) {
      setShowApplicationForm(true)
      return
    }

    onSubmitApplication?.(job, coverLetter)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 transition-opacity" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b border-slate-100 p-6">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="text-slate-400" size={24} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold leading-tight text-slate-900">{job.title}</h2>
            <p className="mt-0.5 text-sm font-semibold text-slate-600">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-2">
            {job.type && (
              <span className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Briefcase size={12} /> {job.type}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <MapPin size={12} /> {job.location}
              </span>
            )}
            {job.salary && job.salary !== 'Not specified' && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <DollarSign size={12} /> {job.salary}
              </span>
            )}
            {job.experience_required && job.experience_required !== 'Not specified' && (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {job.experience_required}
              </span>
            )}
          </div>

          {(job.postedBy || job.postedDate) && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              {job.postedBy && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserCircle size={16} className="shrink-0 text-slate-400" />
                  <span>
                    Posted by <span className="font-semibold text-slate-800">{job.postedBy}</span>
                    {job.postedByRole ? ` (${job.postedByRole})` : ''}
                  </span>
                </div>
              )}
              {job.postedDate && (
                <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={13} />
                  {typeof job.postedDate === 'string' ? job.postedDate : 'Recently'}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(job.alumniPosted || job.alumniRecommended) && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-amber-800">Alumni Posted</span>
              </div>
            )}
            {(job.canRefer || job.referralAvailable) && (
              <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5">
                <Handshake size={13} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">Referral Available</span>
              </div>
            )}
          </div>

          {job.description && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-800">
                Job Description
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {job.description}
              </p>
            </div>
          )}

          {requirements.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-800">
                Requirements
              </h3>
              <ul className="space-y-2">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.applicationDeadline && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-1 text-sm font-bold text-slate-800">Application Deadline</h3>
              <p className="text-sm text-slate-600">
                {new Date(job.applicationDeadline).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {canApplyInternally && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {job.canRefer ? 'Referral Request Message' : 'Application Message'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {job.canRefer
                    ? 'Explain why you are a good fit and why you are requesting a referral.'
                    : 'Send a short cover letter with your application.'}
                </p>
              </div>

              {(showApplicationForm || error || success || hasApplied) && (
                <>
                  <textarea
                    rows={5}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    disabled={hasApplied || isSubmitting}
                    placeholder={
                      job.canRefer
                        ? "Tell them why you're a strong fit and why you'd like a referral."
                        : "Tell them why you're a strong fit for this role."
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
                  />
                  {error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-white p-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
          {primaryLabel && (
            <button
              onClick={handlePrimaryAction}
              disabled={hasApplied || isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {primaryLabel} {job.link && <ExternalLink size={14} />}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default JobDetailDrawer
