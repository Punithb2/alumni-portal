import React, { useState } from 'react'
import { X, CheckCircle2, DollarSign, MapPin, Building2, Briefcase } from 'lucide-react'

// Mock User Data for Auth Fallback
const MOCK_USER = {
    name: 'Alex Johnson',
    role: 'Alumni',
    company: 'Tech Corp'
}

/* ─── Post Job Wizard (Alumni/Admin) ─── */
export const PostJobWizard = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: '',
        experience_required: 'Entry Level',
        link: '',
        canRefer: false
    })

    if (!isOpen) return null

    const handleNext = () => setStep(p => Math.min(p + 1, 3))
    const handleBack = () => setStep(p => Math.max(p - 1, 1))

    const handleSubmit = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            onSave({
                ...formData,
                id: Math.random().toString(),
                postedDate: 'Just now',
                applicants: 0,
                alumniPosted: true,
                postedBy: MOCK_USER.name, // Mocking auth user
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
            })
            onClose()
            setStep(1)
        }, 1500)
    }

    const steps = [
        { id: 1, title: 'Basics' },
        { id: 2, title: 'Details' },
        { id: 3, title: 'Review' }
    ]

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Post an Opportunity</h2>
                        <p className="text-xs text-slate-500 mt-1">Share an open role with your alumni network.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Wizard Steps indicator */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full -z-10 transition-all duration-300" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="e.g. Senior PM" className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="e.g. Google" className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="City or Remote" className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Type</label>
                                    <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Internship</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">External Application Link</label>
                                <input type="url" placeholder="https://careers.company.com/job..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                                <p className="text-xs text-slate-500 mt-1">Leave blank to use platform applications.</p>
                            </div>

                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description</label>
                                <textarea rows={4} placeholder="Describe the role and responsibilities..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Requirements (One per line)</label>
                                <textarea rows={3} placeholder="- 5+ years experience&#10;- Knowledge of React" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salary Range</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="e.g. ₹12L - ₹15L" className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience Level</label>
                                    <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.experience_required} onChange={e => setFormData({ ...formData, experience_required: e.target.value })}>
                                        <option>Entry Level</option>
                                        <option>Mid Level</option>
                                        <option>Senior</option>
                                        <option>Director</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="mt-0.5">
                                        <input type="checkbox" className="hidden" checked={formData.canRefer} onChange={() => setFormData({ ...formData, canRefer: !formData.canRefer })} />
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.canRefer ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-300'}`}>
                                            {formData.canRefer && <CheckCircle2 size={14} />}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900 group-hover:text-indigo-700">I can refer candidates to this role</p>
                                        <p className="text-xs text-indigo-700/70 mt-0.5 font-medium">Adds a 'Can Refer' badge to your post. Candidates will be encouraged to message you.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="text-center py-4">
                                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900">Ready to Publish</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                                    Your job post for '{formData.title}' at {formData.company} will be visible to the alumni and student community.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Preview Summary</h4>
                                <div className="space-y-2 text-sm text-slate-700 font-medium">
                                    <div className="flex justify-between"><span className="text-slate-500">Role:</span> <span className="text-slate-900 font-bold">{formData.title}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Company:</span> <span className="text-slate-900 font-bold">{formData.company}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Location:</span> <span>{formData.location}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span>{formData.type}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Referral:</span> <span>{formData.canRefer ? 'Yes' : 'No'}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button onClick={step === 1 ? onClose : handleBack} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={step === 3 ? handleSubmit : handleNext}
                        disabled={isSubmitting}
                        className={`px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : step === 3 ? (
                            'Publish Job'
                        ) : (
                            'Next Step'
                        )}
                    </button>
                </div>
            </div>
        </>
    )
}

/* ─── Seeker Profile Wizard (Student/Young Alumni) ─── */
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-teal-500 text-white">
                    <h2 className="text-xl font-bold tracking-tight">Create Seeker Profile</h2>
                    {!isDone && (
                        <button onClick={onClose} className="p-2 text-teal-100 hover:bg-teal-600 hover:text-white rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {!isDone ? (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <p className="text-sm text-slate-600 mb-4">Let alumni know you are actively looking for opportunities to boost your visibility in the directory.</p>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Looking for</label>
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                                    <option>Internship</option>
                                    <option>Full-time Role</option>
                                    <option>Part-time Role</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Roles</label>
                                <input type="text" placeholder="e.g. Software Engineer, Data Analyst" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none mb-1" />
                                <p className="text-[10px] text-slate-400">Comma separated</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Availability</label>
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                                    <option>Immediately</option>
                                    <option>Next 3 months</option>
                                    <option>Next 6 months</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 mx-auto bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} className="animate-in slide-in-from-bottom-2 fade-in" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Profile Updated!</h3>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm">
                                A "Seeking Opportunities" badge has been added to your profile in the directory.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isDone && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors shrink-0">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex-1 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-sm transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Enable Profile'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
