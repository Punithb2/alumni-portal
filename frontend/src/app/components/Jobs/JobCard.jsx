import React from 'react'
import { Building2 } from 'lucide-react'

const JobCard = ({ job, isSaved, onSave, onApply }) => {
    // Determine badge styling based on job type or location
    const typeLower = job.type?.toLowerCase() || ''
    const locationLower = job.location?.toLowerCase() || ''
    
    let typeBadge = { bg: 'bg-indigo-50', text: 'text-indigo-600', label: job.type || 'Remote' }
    
    if (typeLower.includes('full') || typeLower.includes('full time')) {
        typeBadge = { bg: 'bg-green-50', text: 'text-green-600', label: 'Full time' }
    } else if (typeLower.includes('part') || typeLower.includes('part time')) {
        typeBadge = { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Part time' }
    } else if (locationLower.includes('remote') || typeLower.includes('remote')) {
        typeBadge = { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Remote' }
    }

    return (
        <div className="bg-white border-b hover:bg-slate-50 border-slate-100 p-5 flex items-center justify-between transition-all w-full">
            <div className="flex items-center gap-5">
                {/* Logo */}
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 className="text-slate-400" size={24} />
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col items-start">
                    <h3 className="font-bold text-slate-800 text-lg">{job.title}</h3>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">{job.company}</p>
                    <p className="text-xs text-slate-500 mt-1">{typeof job.postedDate === 'string' ? job.postedDate : '2 hours ago'}</p>
                    
                    <div className="mt-2.5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}>
                            {typeBadge.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply(job); }}
                    className="px-6 py-1.5 border-2 border-blue-200 text-blue-500 font-semibold text-sm rounded-full hover:bg-blue-50 transition-colors"
                >
                    Apply
                </button>
            </div>
        </div>
    )
}

export default JobCard
