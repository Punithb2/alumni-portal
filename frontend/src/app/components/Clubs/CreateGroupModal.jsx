import React, { useState } from 'react'
import { X, Globe, Lock, EyeOff, Image as ImgIcon, Tag, ChevronDown } from 'lucide-react'
import { useClubs } from '../../hooks/useClubs'
import useAuth from '../../hooks/useAuth'

const DEFAULT_COVER_PHOTO =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400'

const CATEGORIES = [
  'Technology',
  'Business',
  'Arts',
  'Sports',
  'Geography',
  'Class Year',
  'Department',
  'Interest',
  'Alumni',
]

const TYPES = [
  { value: 'Interest Group', label: 'Interest Group', desc: 'Around a shared passion or industry' },
  { value: 'Chapter', label: 'Chapter (Regional)', desc: 'Alumni in a specific city or region' },
  {
    value: 'Cohort',
    label: 'Cohort / Class Year',
    desc: 'Classmates from a specific batch or department',
  },
]

const PRIVACY_OPTIONS = [
  {
    value: 'public',
    icon: <Globe size={16} className="text-emerald-600" />,
    label: 'Public',
    desc: 'Anyone in the network can view and join.',
  },
  {
    value: 'private',
    icon: <Lock size={16} className="text-indigo-600" />,
    label: 'Private',
    desc: 'Visible, but members must request to join.',
  },
  {
    value: 'invite_only',
    icon: <EyeOff size={16} className="text-slate-600" />,
    label: 'Hidden',
    desc: 'Invisible. Invitation required to join.',
  },
]

const getErrorMessage = (error) => {
  const detail = error?.response?.data
  if (!detail) return 'Unable to save this club right now.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.join(', ')
  if (typeof detail.detail === 'string') return detail.detail

  const firstEntry = Object.entries(detail)[0]
  if (!firstEntry) return 'Unable to save this club right now.'

  const [, value] = firstEntry
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value

  return 'Unable to save this club right now.'
}

const getInitialFormState = () => ({
  name: '',
  description: '',
  type: 'Interest Group',
  category: 'Technology',
  privacy: 'public',
  coverPhoto: DEFAULT_COVER_PHOTO,
  tags: '',
  invited: '',
})

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createClub } = useClubs()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState(getInitialFormState)

  if (!isOpen) return null

  const resetForm = () => {
    setStep(1)
    setSubmitError('')
    setForm(getInitialFormState())
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  const handle = (field) => (e) => {
    setSubmitError('')
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return

    setSubmitError('')
    setIsSubmitting(true)

    const creatorName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You'

    const invitedMembers = (form.invited || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value, idx) => ({
        id: `invited-${Date.now()}-${idx}`,
        name: value,
        role: 'Member',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
        title: 'Invited member',
        joinedAt: 'Just now',
        isOnline: false,
      }))

    try {
      await createClub({
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
        isPrivate: form.privacy !== 'public',
        coverPhoto: form.coverPhoto,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdByRole: user?.role || 'Alumni',
        createdByName: creatorName,
        initialMembers: form.privacy === 'public' ? [] : invitedMembers,
      })

      resetForm()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative flex h-full w-full max-w-[500px] flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-5 text-white">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2].map((currentStep) => (
                  <div
                    key={currentStep}
                    className={`h-1 w-8 rounded-full transition-all ${
                      step >= currentStep ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white/70">Step {step} of 2</span>
            </div>
            <h2 className="text-lg font-extrabold">
              {step === 1 ? 'Group Details' : 'Privacy & Visuals'}
            </h2>
            <p className="mt-0.5 text-xs text-indigo-100">
              {step === 1
                ? 'Tell us about your group community.'
                : 'Set access controls and a cover image.'}
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-2 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/40 p-6">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Group Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handle('name')}
                  placeholder="e.g. NYC Alumni Network"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Description</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={handle('description')}
                  placeholder="What is this group about? Who should join?"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Group Type</label>
                <div className="space-y-2">
                  {TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                        form.type === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={form.type === type.value}
                          onChange={handle('type')}
                          className="sr-only"
                        />
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                            form.type === type.value ? 'border-indigo-600' : 'border-slate-300'
                          }`}
                        >
                          {form.type === type.value && (
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            form.type === type.value ? 'text-indigo-700' : 'text-slate-800'
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs font-medium text-slate-500">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={handle('category')}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <Tag size={13} />
                  Tags
                  <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={handle('tags')}
                  placeholder="e.g. AI, Networking, Research"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <ImgIcon size={13} />
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  value={form.coverPhoto}
                  onChange={handle('coverPhoto')}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs font-medium text-slate-500">
                  Paste an image URL. Direct file uploads are not supported by the clubs API yet.
                </p>
                {form.coverPhoto && form.coverPhoto !== DEFAULT_COVER_PHOTO && (
                  <div className="h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={form.coverPhoto}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.opacity = 0
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Privacy Settings</label>
                <div className="space-y-2">
                  {PRIVACY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        form.privacy === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="radio"
                          name="privacy"
                          value={option.value}
                          checked={form.privacy === option.value}
                          onChange={handle('privacy')}
                          className="sr-only"
                        />
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                            form.privacy === option.value ? 'border-indigo-600' : 'border-slate-300'
                          }`}
                        >
                          {form.privacy === option.value && (
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        {option.icon}
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              form.privacy === option.value ? 'text-indigo-700' : 'text-slate-800'
                            }`}
                          >
                            {option.label}
                          </p>
                          <p className="text-xs font-medium text-slate-500">{option.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {form.privacy !== 'public' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    Add Members for Private Group
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (comma separated names or emails)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.invited}
                    onChange={handle('invited')}
                    placeholder="e.g. john@example.com, Jane Doe"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Group Preview
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img src={form.coverPhoto} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{form.name || 'Group Name'}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {form.type} · {form.category}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {form.privacy === 'public'
                        ? 'Public'
                        : form.privacy === 'private'
                          ? 'Private'
                          : 'Hidden'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white p-5">
          <button
            onClick={() => (step === 1 ? handleClose() : setStep(1))}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 1 ? (
            <button
              onClick={() => form.name.trim() && setStep(2)}
              disabled={!form.name.trim() || isSubmitting}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next: Privacy & Cover
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
