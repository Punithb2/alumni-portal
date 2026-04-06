import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Filter,
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  TrendingUp,
  Activity,
  DollarSign,
  Settings2,
  Plus,
  GripHorizontal,
  Save,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableWidget } from './components/DraggableWidget'
import {
  EngagementWidget,
  DirectoryWidget,
  MentoringWidget,
  JobsWidget,
  EventsWidget,
  CampaignsWidget,
  ActionsWidget,
  HighlightsWidget,
} from './components/DashboardWidgets'
import { useAdminDashboardAnalytics } from '../../hooks/useAdminDashboardAnalytics'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

const defaultLayout = [
  'engagement',
  'directory',
  'actions',
  'mentoring',
  'jobs',
  'events',
  'campaigns',
  'highlights',
]

const buildKpiCards = (analytics) => {
  const kpis = analytics?.kpis || {}
  const campaignGoal = Number(kpis.campaign_goal || 0)
  const campaignRaised = Number(kpis.campaign_raised || 0)
  const campaignPercent = campaignGoal ? Math.round((campaignRaised / campaignGoal) * 100) : 0

  return [
    {
      id: 'kpi-1',
      title: 'Registered Members',
      icon: Activity,
      color: 'text-blue-500',
      value: `${kpis.total_users || 0}`,
      trend: `${(kpis.trend_percent || 0) > 0 ? '+' : ''}${kpis.trend_percent || 0}%`,
      trendText: 'vs last period',
      trendColor: (kpis.trend_percent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
      trendIcon: TrendingUp,
      route: '/admin/users',
    },
    {
      id: 'kpi-2',
      title: 'New Alumni',
      icon: UserCheck,
      color: 'text-emerald-500',
      value: `${kpis.new_alumni || 0}`,
      subText: `Total alumni: ${kpis.alumni_total || 0}`,
      route: '/admin/users',
    },
    {
      id: 'kpi-3',
      title: 'Mentorship Activity',
      icon: Users,
      color: 'text-purple-500',
      value: `${kpis.mentors_total || 0}`,
      subLeft: 'Active matches',
      subRightBold: `${kpis.active_matches || 0}`,
      badgeText: (kpis.mentoring_requests_pending || 0) > 0 ? 'Pending Requests' : 'Healthy',
      badgeColor:
        (kpis.mentoring_requests_pending || 0) > 0
          ? 'bg-rose-100 text-rose-700'
          : 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'kpi-4',
      title: 'Jobs & Internships',
      icon: Briefcase,
      color: 'text-indigo-500',
      value: `${kpis.jobs_posted || 0}`,
      valueSub: 'posted',
      subTextBold: `${kpis.applications || 0} applications`,
      subTextColor: 'text-indigo-600',
      route: '/jobs',
    },
    {
      id: 'kpi-5',
      title: 'Event Engagement',
      icon: Calendar,
      color: 'text-cyan-500',
      value: `${kpis.upcoming_events || 0}`,
      valueSub: 'upcoming',
      subLeft: 'Avg. RSVPs:',
      subRightBold: `${kpis.avg_rsvps || 0}`,
      route: '/admin/events',
    },
    {
      id: 'kpi-6',
      title: 'Campaign Performance',
      icon: DollarSign,
      color: 'text-amber-500',
      value: formatCurrency(campaignRaised),
      subTextBold: `${campaignPercent}% of active goals`,
      subTextColor: 'text-amber-600',
      route: '/admin/campaigns',
    },
  ]
}

const buildWidgetRegistry = (analytics) => ({
  engagement: {
    id: 'engagement',
    component: EngagementWidget,
    data: analytics?.charts?.engagement || [],
    colSpanClass: 'md:col-span-2',
    title: 'Community Engagement',
  },
  directory: {
    id: 'directory',
    component: DirectoryWidget,
    data: analytics?.charts?.directory || [],
    colSpanClass: 'col-span-1',
    title: 'Directory Coverage',
  },
  mentoring: {
    id: 'mentoring',
    component: MentoringWidget,
    data: analytics?.charts?.mentoring || [],
    colSpanClass: 'col-span-1',
    title: 'Mentoring Funnel',
  },
  jobs: {
    id: 'jobs',
    component: JobsWidget,
    data: analytics?.charts?.jobs || [],
    colSpanClass: 'col-span-1',
    title: 'Job Pipeline',
  },
  events: {
    id: 'events',
    component: EventsWidget,
    data: analytics?.charts?.events || [],
    colSpanClass: 'col-span-1',
    title: 'Event Check-ins',
  },
  campaigns: {
    id: 'campaigns',
    component: CampaignsWidget,
    data: analytics?.charts?.campaigns || [],
    colSpanClass: 'md:col-span-2',
    title: 'Top Active Campaigns',
  },
  actions: {
    id: 'actions',
    component: ActionsWidget,
    data: analytics?.actions || [],
    colSpanClass: 'col-span-1',
    title: 'Pending Actions',
  },
  highlights: {
    id: 'highlights',
    component: HighlightsWidget,
    data: analytics?.highlights || [],
    colSpanClass: 'col-span-1',
    title: 'Upcoming Highlights',
  },
})

const SortableKpiCard = ({ card, isEditing, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !isEditing,
  })
  const navigate = useNavigate()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  }

  const Icon = card.icon
  const TrendIcon = card.trendIcon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative w-full rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all ${
        isEditing ? 'cursor-default ring-2 ring-indigo-500' : 'cursor-pointer hover:border-slate-200 hover:shadow-md'
      } ${isDragging ? 'shadow-xl ring-indigo-500/30' : ''}`}
      onClick={() => {
        if (!isEditing && card.route) navigate(card.route)
      }}
    >
      {isEditing && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.(card.id)
            }}
            className="absolute left-2 top-2 z-50 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-600 shadow-sm hover:bg-rose-100"
          >
            Hide
          </button>
          <div
            {...attributes}
            {...listeners}
            className="absolute right-2 top-2 z-50 flex items-center justify-center rounded-md bg-indigo-50 p-1.5 text-indigo-600 shadow-sm transition-colors hover:bg-indigo-100"
          >
            <GripHorizontal size={16} />
          </div>
        </>
      )}

      <div className="mt-2 flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{card.title}</p>
        <div className={`rounded-lg bg-slate-50 p-2 ${card.color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 flex items-baseline text-2xl font-bold text-slate-900">
        {card.value}
        {card.valueSub && <span className="ml-1 text-sm font-normal text-slate-500">{card.valueSub}</span>}
      </p>
      <div className="mt-3 min-h-[20px] text-xs">
        {card.trend && (
          <div className={`flex items-center font-medium ${card.trendColor}`}>
            {TrendIcon && <TrendIcon size={14} className="mr-1" />}
            {card.trend}
            <span className="ml-1 font-normal text-slate-500">{card.trendText}</span>
          </div>
        )}
        {card.subText && <p className="font-medium text-slate-500">{card.subText}</p>}
        {card.subTextBold && <p className={`${card.subTextColor} font-semibold`}>{card.subTextBold}</p>}
        {card.subLeft || card.subRightBold ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-slate-500">{card.subLeft}</span>
            {card.badgeText && (
              <span className={`${card.badgeColor} rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`}>
                {card.badgeText}
              </span>
            )}
            {card.subRightBold && <span className="font-bold text-slate-900">{card.subRightBold}</span>}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('30d')
  const [segment, setSegment] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const { analytics, loading, error } = useAdminDashboardAnalytics(dateRange, segment)

  const currentKpis = buildKpiCards(analytics)
  const widgetRegistry = buildWidgetRegistry(analytics)

  const savedLayout = JSON.parse(localStorage.getItem('adminDashLayout') || 'null')
  const [widgetLayout, setWidgetLayout] = useState(savedLayout || defaultLayout)

  const savedKpiOrder = JSON.parse(localStorage.getItem('adminDashKpiOrder') || 'null')
  const [kpiCards, setKpiCards] = useState(() => {
    if (!savedKpiOrder) return currentKpis
    return savedKpiOrder.map((id) => currentKpis.find((card) => card.id === id)).filter(Boolean)
  })

  React.useEffect(() => {
    setKpiCards((prev) => {
      const nextMap = new Map(currentKpis.map((card) => [card.id, card]))
      const ordered = prev.map((card) => nextMap.get(card.id)).filter(Boolean)
      const missing = currentKpis.filter((card) => !ordered.some((item) => item.id === card.id))
      return [...ordered, ...missing]
    })
  }, [analytics])

  const availableKpiToAdd = currentKpis.filter(
    (baseCard) => !kpiCards.some((activeCard) => activeCard.id === baseCard.id)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleKpiDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setKpiCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleWidgetDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setWidgetLayout((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const removeKpiCard = (id) => setKpiCards((prev) => prev.filter((card) => card.id !== id))
  const addKpiCard = (id) => {
    const baseCard = currentKpis.find((card) => card.id === id)
    if (baseCard) {
      setKpiCards((prev) => [...prev, baseCard])
    }
  }

  const removeWidget = (id) => setWidgetLayout((prev) => prev.filter((widgetId) => widgetId !== id))
  const addWidget = (id) => setWidgetLayout((prev) => [...prev, id])

  const availableToAdd = Object.keys(widgetRegistry).filter((id) => !widgetLayout.includes(id))

  const saveLayout = () => {
    localStorage.setItem('adminDashLayout', JSON.stringify(widgetLayout))
    localStorage.setItem('adminDashKpiOrder', JSON.stringify(kpiCards.map((card) => card.id)))
    setIsEditing(false)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2 px-2 font-medium text-slate-700">
          {isEditing ? (
            <Settings2 size={20} className="text-amber-500" />
          ) : (
            <Filter size={18} className="text-indigo-500" />
          )}
          <span className="text-lg">
            {isEditing ? 'Customize Dashboard Layout' : 'Global Filters'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isEditing ? (
            <>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="quarter">This Quarter</option>
              </select>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Segments</option>
                <option value="alumni">Alumni</option>
                <option value="student">Students</option>
              </select>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                <Settings2 size={16} /> Customize
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) addWidget(e.target.value)
                  e.target.value = ''
                }}
                className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Widget
                </option>
                {availableToAdd.map((id) => (
                  <option key={id} value={id}>
                    {widgetRegistry[id].title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setWidgetLayout(defaultLayout)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                onClick={saveLayout}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          <Settings2 size={18} /> You are in Edit Mode. Drag and drop KPI cards and widgets to reorder them.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Loading admin analytics...
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKpiDragEnd}>
        <SortableContext items={kpiCards.map((card) => card.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpiCards.map((card) => (
              <SortableKpiCard key={card.id} card={card} isEditing={isEditing} onRemove={removeKpiCard} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isEditing && (
        <div className="-mt-1 flex flex-wrap items-center gap-3">
          <select
            onChange={(e) => {
              if (e.target.value) addKpiCard(e.target.value)
              e.target.value = ''
            }}
            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm outline-none sm:text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              + Add KPI Card
            </option>
            {availableKpiToAdd.map((card) => (
              <option key={card.id} value={card.id}>
                {card.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWidgetDragEnd}>
        <SortableContext items={widgetLayout} strategy={rectSortingStrategy}>
          <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {widgetLayout.map((widgetId) => {
              const widgetConfig = widgetRegistry[widgetId]
              if (!widgetConfig) return null
              const WidgetComponent = widgetConfig.component

              return (
                <div key={widgetId} className={`${widgetConfig.colSpanClass} flex h-full flex-col`}>
                  <DraggableWidget id={widgetId} isEditing={isEditing} onRemove={removeWidget}>
                    <WidgetComponent data={widgetConfig.data} />
                  </DraggableWidget>
                </div>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {widgetLayout.length === 0 && isEditing && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Plus size={32} className="mb-2 text-slate-400" />
          <p className="text-lg font-medium">Dashboard is empty</p>
          <p className="text-sm">Use the dropdown above to add widgets</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
