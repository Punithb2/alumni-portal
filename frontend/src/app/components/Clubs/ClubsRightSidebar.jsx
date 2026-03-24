import React from 'react'
import { ShieldCheck, Mail, Users, TrendingUp, Calendar, Briefcase, Crown, Shield, Star } from 'lucide-react'

const SUGGESTED = [
    { id: 101, name: "AI in Healthcare", members: 420, avatar: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150&h=150", type: "Interest Group" },
    { id: 102, name: "FinTech Innovators", members: 855, avatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=150&h=150", type: "Interest Group" },
    { id: 103, name: "Startup Founders 2025", members: 120, avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=150&h=150", type: "Interest Group" },
]

const ROLE_ICONS = {
    Owner: <Crown size={12} className="text-amber-500" />,
    Moderator: <Shield size={12} className="text-indigo-500" />,
    Member: <Star size={12} className="text-slate-400" />,
}

const ClubsRightSidebar = ({ groupDetails, stats }) => {
    // Inside a specific group detail
    if (groupDetails) {
        return (
            <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5">

                {/* About Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-extrabold text-slate-900 text-sm">About This Group</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                <Users size={18} className="text-indigo-600 mx-auto mb-1" />
                                <p className="text-lg font-black text-slate-900">{groupDetails.membersCount?.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Members</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                <TrendingUp size={18} className="text-emerald-600 mx-auto mb-1" />
                                <p className="text-lg font-black text-slate-900">Active</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 font-medium space-y-1 pt-1">
                            <p>📅 Created: <span className="text-slate-700 font-bold">{groupDetails.createdAt}</span></p>
                            <p>🏷️ Type: <span className="text-slate-700 font-bold">{groupDetails.type}</span></p>
                            <p>🔖 Category: <span className="text-slate-700 font-bold">{groupDetails.category}</span></p>
                        </div>
                        {groupDetails.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {groupDetails.tags.map(t => (
                                    <span key={t} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">#{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Group Admins */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600" />
                        <h2 className="font-extrabold text-slate-900 text-sm">Group Admins</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {(groupDetails.admins || []).map(admin => (
                            <div key={admin.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={admin.avatar} alt={admin.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-50" />
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                            {ROLE_ICONS[admin.role] || ROLE_ICONS.Member}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{admin.name}</p>
                                        <p className="text-[11px] text-slate-500 font-medium">{admin.role}</p>
                                    </div>
                                </div>
                                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Mail size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group Rules */}
                {groupDetails.rules?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h2 className="font-extrabold text-slate-900 text-sm">Community Rules</h2>
                        </div>
                        <div className="p-4">
                            <ol className="space-y-2.5">
                                {groupDetails.rules.map((rule, i) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-slate-600 font-medium">
                                        <span className="text-indigo-500 font-black shrink-0">{i + 1}.</span>
                                        {rule}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Discover / My Groups view
    return (
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5">

            {/* Global stats banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-2xl shadow-md border border-indigo-700 overflow-hidden text-white">
                <div className="p-5">
                    <h2 className="font-extrabold text-base mb-1">Clubs & Communities</h2>
                    <p className="text-indigo-200 text-xs font-medium mb-5">Join chapters, cohorts, and groups to grow your network.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Active Groups', value: stats?.active ?? 7 },
                            { label: 'Total Members', value: stats?.members ? `${stats.members / 1000 | 0}k+` : '12k+' },
                        ].map(s => (
                            <div key={s.label} className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-xl font-black mb-0.5">{s.value}</p>
                                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-600" />
                    <h2 className="font-extrabold text-slate-900 text-sm">Trending Groups</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {SUGGESTED.map(group => (
                        <div key={group.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <img src={group.avatar} alt={group.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{group.name}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">{group.members.toLocaleString()} members</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors">
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="font-extrabold text-slate-900 text-sm">Browse by Category</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                    {[
                        { label: 'Technology', icon: '💻', color: 'bg-blue-50 text-blue-700' },
                        { label: 'Business', icon: '📊', color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Geography', icon: '🌍', color: 'bg-purple-50 text-purple-700' },
                        { label: 'Class Year', icon: '🎓', color: 'bg-amber-50 text-amber-700' },
                        { label: 'Department', icon: '🏛️', color: 'bg-rose-50 text-rose-700' },
                        { label: 'Interest', icon: '⚡', color: 'bg-indigo-50 text-indigo-700' },
                    ].map(cat => (
                        <button key={cat.label} className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 ${cat.color}`}>
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ClubsRightSidebar
