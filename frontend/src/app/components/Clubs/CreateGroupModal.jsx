import React, { useState } from 'react'
import { X, Globe, Lock, EyeOff, Image as ImgIcon, Tag, ChevronDown } from 'lucide-react'
import { useClubs } from '../../hooks/useClubs'
import useAuth from '../../hooks/useAuth'

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

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createClub } = useClubs()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Interest Group',
    category: 'Technology',
    privacy: 'public',
    coverPhoto:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400',
    tags: '',
    invited: '',
  })

  if (!isOpen) return null

  const handle = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const creatorName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You'

    const invitedMembers = (form.invited || '')
      .split(',')
      .map((v) => v.trim())
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

    createClub({
      name: form.name,
      description: form.description,
      type: form.type,
      category: form.category,
      isPrivate: form.privacy !== 'public',
      coverPhoto: form.coverPhoto,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdByRole: user?.role || 'Alumni',
      createdByName: creatorName,
      initialMembers: form.privacy === 'public' ? [] : invitedMembers,
    })
    onClose()
    setStep(1)
    setForm({
      name: '',
      description: '',
      type: 'Interest Group',
      category: 'Technology',
      privacy: 'public',
      coverPhoto:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400',
      tags: '',
      invited: '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white shadow-2xl w-full max-w-[500px] flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-1">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1 w-8 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-white/70 text-xs font-bold">Step {step} of 2</span>
            </div>
            <h2 className="text-lg font-extrabold">
              {step === 1 ? 'Group Details' : 'Privacy & Visuals'}
            </h2>
            <p className="text-indigo-100 text-xs mt-0.5">
              {step === 1
                ? 'Tell us about your group community.'
                : 'Set access controls and a cover image.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Group Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handle('name')}
                  placeholder="e.g. NYC Alumni Network"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Description</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={handle('description')}
                  placeholder="What is this group about? Who should join?"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none resize-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800">Group Type</label>
                <div className="space-y-2">
                  {TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.type === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="radio"
                          name="type"
                          value={t.value}
                          checked={form.type === t.value}
                          onChange={handle('type')}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${form.type === t.value ? 'border-indigo-600' : 'border-slate-300'}`}
                        >
                          {form.type === t.value && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${form.type === t.value ? 'text-indigo-700' : 'text-slate-800'}`}
                        >
                          {t.label}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{t.desc}</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium appearance-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag size={13} /> Tags{' '}
                  <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={handle('tags')}
                  placeholder="e.g. AI, Networking, Research"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                />
              </div>
              {form.privacy !== 'public' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    Add Members for Private Group
                    <span className="text-slate-400 font-normal ml-1 text-xs">
                      (comma separated names or emails)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.invited}
                    onChange={handle('invited')}
                    placeholder="e.g. john@example.com, Jane Doe"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                  />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Cover Photo */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ImgIcon size={13} /> Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setForm((prev) => ({ ...prev, coverPhoto: url }))
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {form.coverPhoto &&
                  form.coverPhoto !==
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200&h=400' && (
                    <div className="rounded-xl overflow-hidden h-32 bg-slate-100 border border-slate-200">
                      <img
                        src={form.coverPhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.opacity = 0)}
                      />
                    </div>
                  )}
              </div>

              {/* Privacy */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">Privacy Settings</label>
                <div className="space-y-2">
                  {PRIVACY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.privacy === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="radio"
                          name="privacy"
                          value={opt.value}
                          checked={form.privacy === opt.value}
                          onChange={handle('privacy')}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${form.privacy === opt.value ? 'border-indigo-600' : 'border-slate-300'}`}
                        >
                          {form.privacy === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        {opt.icon}
                        <div>
                          <p
                            className={`text-sm font-bold ${form.privacy === opt.value ? 'text-indigo-700' : 'text-slate-800'}`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Group Preview
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={form.coverPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => {}}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{form.name || 'Group Name'}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {form.type} · {form.category}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {form.privacy === 'public'
                        ? '🌐 Public'
                        : form.privacy === 'private'
                          ? '🔒 Private'
                          : '👁️ Hidden'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(1))}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step === 1 ? (
            <button
              onClick={() => form.name.trim() && setStep(2)}
              disabled={!form.name.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Privacy & Cover →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
            >
              ✓ Create Group
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
