import React, { useState } from 'react'
import { X, CheckCircle2, DollarSign, MapPin, Building2, Briefcase, Handshake } from 'lucide-react'
import { JOB_TYPE_API_BY_LABEL, parseSalaryRange } from './jobUtils'

export const PostJobWizard = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    experience_required: 'Entry Level',
    application_deadline: '',
    can_refer: false,
  })

  const resetWizard = () => {
    setStep(1)
    setIsSubmitting(false)
    setSubmitError('')
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: '',
      experience_required: 'Entry Level',
      application_deadline: '',
      can_refer: false,
    })
  }

  if (!isOpen) return null

  const handleNext = () => setStep((previousStep) => Math.min(previousStep + 1, 3))
  const handleBack = () => setStep((previousStep) => Math.max(previousStep - 1, 1))

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    const { salaryMin, salaryMax } = parseSalaryRange(formData.salary)

    try {
      await onSave({
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        job_type: JOB_TYPE_API_BY_LABEL[formData.type] || 'full_time',
        is_remote: formData.location.trim().toLowerCase() === 'remote',
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        salary_min: salaryMin,
        salary_max: salaryMax,
        experience_required: formData.experience_required,
        application_deadline: formData.application_deadline || null,
        can_refer: Boolean(formData.can_refer),
        status: 'active',
      })
      resetWizard()
      onClose()
    } catch (error) {
      const errorData = error?.response?.data
      const firstFieldError = Object.values(errorData || {}).find(
        (value) => Array.isArray(value) && value.length > 0
      )

      setSubmitError(
        errorData?.detail ||
          errorData?.non_field_errors?.[0] ||
          firstFieldError?.[0] ||
          'Unable to publish this job right now.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Details' },
    { id: 3, title: 'Review' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Post an Opportunity</h2>
            <p className="mt-1 text-xs text-slate-500">
              Share an open role with your alumni network.
            </p>
          </div>
          <button
            onClick={() => {
              resetWizard()
              onClose()
            }}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-2 pt-6">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-slate-100" />
            <div
              className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2 bg-white px-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${step >= item.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 bg-white text-slate-400'}`}
                >
                  {step > item.id ? <CheckCircle2 size={16} /> : item.id}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${step >= item.id ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Senior PM"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.title}
                      onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Company
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.company}
                      onChange={(event) =>
                        setFormData({ ...formData, company: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="City or Remote"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.location}
                      onChange={(event) =>
                        setFormData({ ...formData, location: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Job Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.type}
                    onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.application_deadline}
                  onChange={(event) =>
                    setFormData({ ...formData, application_deadline: event.target.value })
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  Leave blank if the role can stay open without a fixed deadline.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Job Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({ ...formData, description: event.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="- 5+ years experience&#10;- Knowledge of React"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.requirements}
                  onChange={(event) =>
                    setFormData({ ...formData, requirements: event.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Salary Range
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="e.g. 1200000 - 1500000"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.salary}
                      onChange={(event) => setFormData({ ...formData, salary: event.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Experience Level
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.experience_required}
                    onChange={(event) =>
                      setFormData({ ...formData, experience_required: event.target.value })
                    }
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior</option>
                    <option>Director</option>
                  </select>
                </div>
              </div>

              <label className="block rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((previousData) => ({
                        ...previousData,
                        can_refer: !previousData.can_refer,
                      }))
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${formData.can_refer ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-300 bg-white text-transparent'}`}
                    aria-pressed={formData.can_refer}
                    aria-label="Can refer candidates"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                      <Handshake size={16} />
                      Can I refer candidates?
                    </div>
                    <p className="mt-1 text-xs font-medium text-indigo-700/80">
                      Turn this on if applicants for this role can request a referral from the
                      alumni who posted it.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="py-4 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-900">Ready to Publish</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Your job post for '{formData.title}' at {formData.company} will be visible to the
                  alumni and student community.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Preview Summary
                </h4>
                <div className="space-y-2 text-sm font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-bold text-slate-900">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company:</span>
                    <span className="font-bold text-slate-900">{formData.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span>{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deadline:</span>
                    <span>{formData.application_deadline || 'Open-ended'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Referral:</span>
                    <span>{formData.can_refer ? 'Enabled' : 'Not available'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          {submitError && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={
                step === 1
                  ? () => {
                      resetWizard()
                      onClose()
                    }
                  : handleBack
              }
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className={`flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 ${isSubmitting ? 'cursor-wait opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : step === 3 ? (
                'Publish Job'
              ) : (
                'Next Step'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export const SeekerProfileModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsDone(true)
      setTimeout(() => {
        setIsDone(false)
        onClose()
      }, 2000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-teal-500 p-5 text-white">
          <h2 className="text-xl font-bold tracking-tight">Create Seeker Profile</h2>
          {!isDone && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-teal-100 transition-colors hover:bg-teal-600 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          {!isDone ? (
            <div className="space-y-4">
              <p className="mb-4 text-sm text-slate-600">
                Let alumni know you are actively looking for opportunities to boost your visibility
                in the directory.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Looking for
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Internship</option>
                  <option>Full-time Role</option>
                  <option>Part-time Role</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Target Roles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Data Analyst"
                  className="mb-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-400">Comma separated</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Availability
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Immediately</option>
                  <option>Next 3 months</option>
                  <option>Next 6 months</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-500">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">Profile Updated!</h3>
              <p className="mx-auto max-w-xs text-sm text-slate-500">
                A "Seeking Opportunities" badge has been added to your profile in the directory.
              </p>
            </div>
          )}
        </div>

        {!isDone && (
          <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-5">
            <button
              onClick={onClose}
              className="shrink-0 rounded-xl px-5 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-teal-700 ${isSubmitting ? 'cursor-wait opacity-75' : ''}`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                'Enable Profile'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
