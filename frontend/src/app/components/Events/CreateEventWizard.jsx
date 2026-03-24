import React, { useState } from 'react'
import { X, UploadCloud, MapPin, Calendar, Clock, DollarSign, Globe, CheckCircle2 } from 'lucide-react'

const CreateEventWizard = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1) // 1: Basic Info, 2: Time & Location, 3: Ticketing/Advanced
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Networking',
        description: '',
        date: '',
        time: '',
        format: 'In-person', // Online, In-person, Hybrid
        location: '',
        isPaid: false,
        price: '',
        capacity: '',
        requireApproval: false,
        sendReminders: true,
    })

    if (!isOpen) return null

    const handleNext = () => setStep((p) => Math.min(p + 1, 3))
    const handleBack = () => setStep((p) => Math.max(p - 1, 1))

    const handleSubmit = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            onSave({
                ...formData,
                id: Math.random().toString(),
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
                attendees: 0,
                price: formData.isPaid ? Number(formData.price) || 0 : 0,
            })
            onClose()
            setStep(1) // reset
        }, 1500)
    }

    const steps = [
        { id: 1, title: 'Basics' },
        { id: 2, title: 'When & Where' },
        { id: 3, title: 'Ticketing' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Host an Event</h2>
                        <p className="text-xs text-slate-500 mt-1">Fill out the details below to publish your event.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Wizard Steps indicator */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full -z-10 transition-all duration-300"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s.id
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-white border-slate-200 text-slate-400'
                                        }`}
                                >
                                    {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4">
                            {/* Banner Upload Mock */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl h-40 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Upload Event Banner</p>
                                <p className="text-xs text-slate-400 mt-1">1200 x 600px recommended</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Annual Alumni Gala 2026"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Networking</option>
                                            <option>Webinar</option>
                                            <option>Reunion</option>
                                            <option>Career</option>
                                            <option>Gala</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Format</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                            value={formData.format}
                                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                        >
                                            <option>In-person</option>
                                            <option>Online</option>
                                            <option>Hybrid</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="What is this event about?"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="time"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {formData.format !== 'Online' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="e.g. University Grand Hall"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.format !== 'In-person' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meeting Link</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="url"
                                            placeholder="e.g. Teams, Zoom link"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-slate-800">Paid Event</p>
                                        <p className="text-xs text-slate-500">Charge attendees for tickets</p>
                                    </div>
                                    <div
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPaid ? 'bg-indigo-600' : 'bg-slate-300'
                                            }`}
                                        onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPaid ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </div>
                                </label>
                            </div>

                            {formData.isPaid && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ticket Price (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Capacity</label>
                                        <input
                                            type="number"
                                            placeholder="Max attendees"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-800">Advanced Settings</h4>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="mt-0.5">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.requireApproval}
                                            onChange={() => setFormData({ ...formData, requireApproval: !formData.requireApproval })}
                                        />
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.requireApproval ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                            {formData.requireApproval && <CheckCircle2 size={14} />}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">Require Host Approval</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Manually approve attendees before they receive tickets.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="mt-0.5">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.sendReminders}
                                            onChange={() => setFormData({ ...formData, sendReminders: !formData.sendReminders })}
                                        />
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.sendReminders ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                            {formData.sendReminders && <CheckCircle2 size={14} />}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">Automated Email Reminders</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Send reminders 1 week, 1 day, and 1 hour before the event.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
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
                            'Publish Event'
                        ) : (
                            'Next Step'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateEventWizard
