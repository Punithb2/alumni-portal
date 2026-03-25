import React, { useState } from 'react'
import { UserCheck, Users, UserPlus, Check, X } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from 'recharts'

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  padding: '12px',
  backgroundColor: '#ffffff',
}
const widgetClasses =
  'bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col w-full relative overflow-hidden transition-all duration-300'

export const EngagementWidget = ({ data }) => (
  <div className={`${widgetClasses} h-[360px]`}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 cursor-pointer">Community Engagement</h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0.3} />
            </linearGradient>
            <filter id="glowAlumni" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
          <Legend
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '15px',
              fontWeight: 500,
              color: '#475569',
            }}
          />

          <Bar
            dataKey="all"
            name="Total Audience"
            fill="url(#barGrad)"
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
          <Line
            type="monotone"
            dataKey="alumni"
            name="Alumni Active"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            filter="url(#glowAlumni)"
          />
          <Line
            type="monotone"
            dataKey="student"
            name="Students Active"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const DirectoryWidget = ({ data }) => (
  <div className={`${widgetClasses} h-[360px]`}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 cursor-pointer">Directory Coverage</h3>
    <div className="flex-1 min-h-0 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))' }}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 500 }} />
          <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const MentoringWidget = ({ data }) => (
  <div className={`${widgetClasses} h-[340px]`}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 cursor-pointer">Mentoring Funnel</h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
          barSize={24}
        >
          <defs>
            <linearGradient id="mentorGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="menteeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="requestGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
          />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const JobsWidget = ({ data }) => (
  <div className={`${widgetClasses} h-[340px]`}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 cursor-pointer">Job Pipeline</h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="jobPostedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="jobAppGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 500 }}
          />

          <Area
            type="monotone"
            dataKey="applications"
            stackId="1"
            stroke="#8b5cf6"
            fill="url(#jobAppGrad)"
            strokeWidth={3}
            name="Applications"
          />
          <Area
            type="monotone"
            dataKey="posted"
            stackId="2"
            stroke="#6366f1"
            fill="url(#jobPostedGrad)"
            strokeWidth={3}
            name="Posted Jobs"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const EventsWidget = ({ data }) => (
  <div className={`${widgetClasses} h-[340px]`}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 cursor-pointer">Event Check-ins</h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
          <defs>
            <linearGradient id="rsvpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
          />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 500 }}
          />
          <Bar dataKey="RSVPs" fill="url(#rsvpGrad)" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="Attended" fill="url(#attGrad)" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export const CampaignsWidget = ({ data }) => (
  <div className={`${widgetClasses}`}>
    <h3 className="text-lg font-bold text-slate-800 mb-5 cursor-pointer">Top Active Campaigns</h3>
    <div className="space-y-6">
      {data.map((campaign) => {
        const percent = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
        return (
          <div key={campaign.id} className="group flex-1">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[15px] font-bold text-slate-800">{campaign.name}</p>
                <p className="text-[13px] font-medium text-slate-500 mt-1">
                  {campaign.donors} donors � {campaign.daysLeft} days left
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold text-slate-800">
                  ?{(campaign.raised / 1000).toFixed(1)}k{' '}
                  <span className="text-slate-400 font-medium">
                    / ?{(campaign.goal / 1000).toFixed(1)}k
                  </span>
                </p>
                <p className="text-[13px] font-bold text-slate-500 mt-1">{percent}%</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                  campaign.status === 'green'
                    ? 'from-emerald-400 to-emerald-500'
                    : campaign.status === 'amber'
                      ? 'from-amber-400 to-amber-500'
                      : 'from-rose-400 to-rose-500'
                }`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export const ActionsWidget = () => {
  const [actions, setActions] = useState([
    {
      id: 1,
      type: 'Alumni Verification',
      desc: 'Suresh K. expected approval',
      icon: UserCheck,
      colorClasses: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      id: 2,
      type: 'Club Approval',
      desc: 'Robotics Alumni by Amit',
      icon: Users,
      colorClasses: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: 3,
      type: 'Mentee Rematch',
      desc: 'Priya requested new mentor',
      icon: UserPlus,
      colorClasses: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ])

  const handleAction = (id) => {
    setActions(actions.filter((action) => action.id !== id))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 cursor-pointer">Pending Actions</h3>
        {actions.length > 0 && (
          <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-xs font-bold">
            {actions.length}
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center h-full justify-center min-h-[200px]">
            <Check size={32} className="text-emerald-400 mb-3" />
            <p className="font-medium text-slate-700">All caught up!</p>
            <p className="text-sm mt-1 text-slate-500">No pending actions left.</p>
          </div>
        ) : (
          actions.map((action) => {
            const Icon = action.icon
            return (
              <div
                key={action.id}
                className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border ${action.colorClasses}`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{action.type}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{action.desc}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(action.id)}
                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                    title="Accept"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(action.id)}
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export const HighlightsWidget = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full flex flex-col h-full">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-lg font-bold text-slate-800 cursor-pointer">Upcoming Highlights</h3>
    </div>
    <div className="p-5 space-y-5 flex-1">
      <div className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors">
        <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
          <span className="text-[10px] uppercase font-bold tracking-wider mb-0.5 opacity-80">
            Aug
          </span>
          <span className="text-lg font-bold leading-none">12</span>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[14px] font-bold text-slate-800">Annual Reunion</p>
          <p className="text-[12px] text-emerald-600 font-medium mt-1">300 RSVPs expected</p>
        </div>
      </div>
      <div className="flex gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors">
        <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
          <span className="text-[10px] uppercase font-bold tracking-wider mb-0.5 opacity-80">
            Aug
          </span>
          <span className="text-lg font-bold leading-none">15</span>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[14px] font-bold text-slate-800">Campaign Closes</p>
          <p className="text-[12px] text-slate-500 font-medium mt-1">Scholarship Fund</p>
        </div>
      </div>
    </div>
  </div>
)
