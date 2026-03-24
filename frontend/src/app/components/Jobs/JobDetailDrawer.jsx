import React from 'react'
import { X, Building2, MapPin, DollarSign, Briefcase, Clock, UserCircle, ExternalLink, Handshake } from 'lucide-react'

const JobDetailDrawer = ({ job, onClose }) => {
    if (!job) return null

    const requirements = Array.isArray(job.requirements)
        ? job.requirements
        : typeof job.requirements === 'string'
        ? job.requirements.split('\n').filter(r => r.trim())
        : []

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 p-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="text-slate-400" size={24} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{job.title}</h2>
                        <p className="text-sm font-semibold text-slate-600 mt-0.5">{job.company}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2">
                        {job.type && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                <Briefcase size={12} /> {job.type}
                            </span>
                        )}
                        {job.location && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200">
                                <MapPin size={12} /> {job.location}
                            </span>
                        )}
                        {job.salary && job.salary !== 'Not specified' && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                <DollarSign size={12} /> {job.salary}
                            </span>
                        )}
                        {job.experience_required && job.experience_required !== 'Not specified' && (
                            <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                {job.experience_required}
                            </span>
                        )}
                    </div>

                    {/* Posted by */}
                    {(job.postedBy || job.postedDate) && (
                        <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                            {job.postedBy && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <UserCircle size={16} className="text-slate-400 shrink-0" />
                                    <span>Posted by <span className="font-semibold text-slate-800">{job.postedBy}</span>
                                        {job.postedByRole ? ` (${job.postedByRole})` : ''}
                                    </span>
                                </div>
                            )}
                            {job.postedDate && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto shrink-0">
                                    <Clock size={13} />
                                    {typeof job.postedDate === 'string' ? job.postedDate : 'Recently'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alumni / Referral badges */}
                    <div className="flex flex-wrap gap-2">
                        {(job.alumniPosted || job.alumniRecommended) && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-xs font-bold text-amber-800">Alumni Posted</span>
                            </div>
                        )}
                        {(job.canRefer || job.referralAvailable) && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
                                <Handshake size={13} className="text-indigo-600" />
                                <span className="text-xs font-bold text-indigo-700">Referral Available</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {job.description && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Job Description</h3>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>
                    )}

                    {/* Requirements */}
                    {requirements.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Requirements</h3>
                            <ul className="space-y-2">
                                {requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            if (job.link) window.open(job.link, '_blank')
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        Apply Now {job.link && <ExternalLink size={14} />}
                    </button>
                </div>
            </div>
        </>
    )
}

export default JobDetailDrawer
