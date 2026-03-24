import React from 'react'
import { Calendar, ChevronRight } from 'lucide-react'

const EventsRightSidebar = ({ upcomingEvents, pastRecaps, onEventClick }) => {
    const formatDate = (date) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date))

    return (
        <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Upcoming Now</h3>
                    <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} onClick={() => onEventClick && onEventClick(event)} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center shrink-0 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold uppercase leading-none">
                                        {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(event.date))}
                                    </span>
                                    <span className="text-lg font-black leading-none mt-0.5">
                                        {new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(new Date(event.date))}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {event.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 truncate">{event.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-sm">No upcoming events right now.</div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Past Recaps</h3>
                </div>
                <div className="p-4 space-y-4">
                    {pastRecaps.slice(0, 2).map((recap, i) => (
                        <div key={i} onClick={() => onEventClick && onEventClick(recap)} className="group cursor-pointer">
                            <div className="h-24 rounded-xl overflow-hidden mb-2 relative">
                                <img
                                    src={recap.image}
                                    alt={recap.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <h4 className="text-white text-sm font-semibold truncate shadow-sm">{recap.title}</h4>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {formatDate(recap.date)}
                                </span>
                                <span className="text-indigo-600 font-medium group-hover:underline flex items-center">
                                    Read <ChevronRight size={12} />
                                </span>
                            </div>
                        </div>
                    ))}
                    {pastRecaps.length === 0 && (
                        <div className="text-center text-slate-500 text-sm py-4">No recaps yet.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EventsRightSidebar
