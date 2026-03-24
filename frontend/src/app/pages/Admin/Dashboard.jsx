import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Users, UserCheck, Calendar, Briefcase, TrendingUp, Activity, DollarSign, Settings2, Plus, GripHorizontal, Save } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Widgets & Wrappers
import { DraggableWidget } from './components/DraggableWidget';
import { 
  EngagementWidget, DirectoryWidget, MentoringWidget, 
  JobsWidget, EventsWidget, CampaignsWidget, ActionsWidget, HighlightsWidget 
} from './components/DashboardWidgets';

// --- Mock Data ---
const activeUsersData = [
  { name: 'Week 1', all: 400, alumni: 240, student: 160 },
  { name: 'Week 2', all: 300, alumni: 139, student: 161 },
  { name: 'Week 3', all: 450, alumni: 280, student: 170 },
  { name: 'Week 4', all: 500, alumni: 310, student: 190 },
];
const directoryCoverageData = [
  { name: 'Verified Alumni', value: 800, color: '#10b981' },
  { name: 'Unverified', value: 300, color: '#f59e0b' },
  { name: 'Students', value: 500, color: '#3b82f6' },
  { name: 'Admin', value: 20, color: '#6366f1' },
];
const mentoringFunnelData = [
  { name: 'Matches', value: 150, fill: 'url(#matchGrad)' },
  { name: 'Requests', value: 200, fill: 'url(#requestGrad)' },
  { name: 'Mentees', value: 450, fill: 'url(#menteeGrad)' },
  { name: 'Mentors', value: 300, fill: 'url(#mentorGrad)' },
].reverse();
const jobPipelineData = [
  { name: 'Week 1', posted: 20, applications: 80, referrals: 10 },
  { name: 'Week 2', posted: 35, applications: 120, referrals: 15 },
  { name: 'Week 3', posted: 25, applications: 90, referrals: 12 },
  { name: 'Week 4', posted: 40, applications: 150, referrals: 25 },
];
const eventPerformanceData = [
  { name: 'Tech Talk', RSVPs: 150, Attended: 120 },
  { name: 'Reunion', RSVPs: 300, Attended: 250 },
  { name: 'Workshop', RSVPs: 80, Attended: 50 },
  { name: 'Webinar', RSVPs: 200, Attended: 110 },
];
const campaignProgressData = [
  { id: 1, name: 'Scholarship Fund 2024', raised: 25000, goal: 50000, donors: 124, daysLeft: 14, status: 'amber', isParticipation: false },
  { id: 2, name: 'Blood Donation Camp', raised: 156, goal: 200, donors: 156, daysLeft: 5, status: 'green', isParticipation: true },
  { id: 3, name: 'Sports Complex', raised: 5000, goal: 100000, donors: 45, daysLeft: 30, status: 'red', isParticipation: false },
];

const initialKpiCards = [
  { id: 'kpi-1', title: 'Active Users', icon: Activity, color: 'text-blue-500', value: '1,245', trend: '+14%', trendText: 'vs last period', trendColor: 'text-emerald-600', trendIcon: TrendingUp, route: '/admin/users' },
  { id: 'kpi-2', title: 'New Verified Alumni', icon: UserCheck, color: 'text-emerald-500', value: '84', subText: 'Total: 800 verified', route: '/admin/users' },
  { id: 'kpi-3', title: 'Mentoring', icon: Users, color: 'text-purple-500', value: '150', subLeft: 'Active matches', badgeText: 'Low Engagement', badgeColor: 'bg-rose-100 text-rose-700' },
  { id: 'kpi-4', title: 'Jobs & Internships', icon: Briefcase, color: 'text-indigo-500', value: '120', valueSub: 'posted', subTextBold: '350 applications', subTextColor: 'text-indigo-600' },
  { id: 'kpi-5', title: 'Event Engagement', icon: Calendar, color: 'text-cyan-500', value: '12', valueSub: 'events', subLeft: 'Avg. Attendance:', subRightBold: '78%', route: '/admin/events' },
  { id: 'kpi-6', title: 'Campaign Performance', icon: DollarSign, color: 'text-amber-500', value: '₹75k', subTextBold: '68% of goal reached', subTextColor: 'text-amber-600', route: '/admin/campaigns' }
];

const WIDGET_REGISTRY = {
  'engagement': { id: 'engagement', component: EngagementWidget, data: activeUsersData, colSpanClass: 'md:col-span-2', title: 'Community Engagement' },
  'directory': { id: 'directory', component: DirectoryWidget, data: directoryCoverageData, colSpanClass: 'col-span-1', title: 'Directory Coverage' },
  'mentoring': { id: 'mentoring', component: MentoringWidget, data: mentoringFunnelData, colSpanClass: 'col-span-1', title: 'Mentoring Funnel' },
  'jobs': { id: 'jobs', component: JobsWidget, data: jobPipelineData, colSpanClass: 'col-span-1', title: 'Job Pipeline' },
  'events': { id: 'events', component: EventsWidget, data: eventPerformanceData, colSpanClass: 'col-span-1', title: 'Event Check-ins' },
  'campaigns': { id: 'campaigns', component: CampaignsWidget, data: campaignProgressData, colSpanClass: 'md:col-span-2', title: 'Top Active Campaigns' },
  'actions': { id: 'actions', component: ActionsWidget, data: null, colSpanClass: 'col-span-1', title: 'Pending Actions' },
  'highlights': { id: 'highlights', component: HighlightsWidget, data: null, colSpanClass: 'col-span-1', title: 'Upcoming Highlights' },
};

const defaultLayout = ['engagement', 'directory', 'actions', 'mentoring', 'jobs', 'events', 'campaigns', 'highlights'];

const SortableKpiCard = ({ card, isEditing, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, disabled: !isEditing });
  const navigate = useNavigate();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const Icon = card.icon;
  const TrendIcon = card.trendIcon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white p-5 rounded-xl shadow-sm border border-slate-100 transition-all w-full
        ${isEditing ? 'ring-2 ring-indigo-500 cursor-default' : 'cursor-pointer hover:shadow-md hover:border-slate-200'}
        ${isDragging ? 'shadow-xl ring-indigo-500/30' : ''}
      `}
      onClick={(e) => {
        if (!isEditing && card.route) navigate(card.route);
      }}
    >
      {isEditing && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(card.id);
            }}
            className="absolute top-2 left-2 z-50 px-1.5 py-0.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md text-[10px] font-semibold tracking-wide shadow-sm"
          >
            Hide
          </button>
          <div 
            {...attributes} 
            {...listeners} 
            className="absolute top-2 right-2 z-50 p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md cursor-grab active:cursor-grabbing shadow-sm flex items-center justify-center transition-colors"
          >
            <GripHorizontal size={16} />
          </div>
        </>
      )}

      <div className="flex justify-between items-start mt-2">
        <p className="text-sm font-medium text-slate-600">{card.title}</p>
        <div className={`p-2 rounded-lg bg-slate-50 ${card.color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-4 flex items-baseline">
        {card.value}
        {card.valueSub && <span className="text-sm font-normal text-slate-500 ml-1">{card.valueSub}</span>}
      </p>
      <div className="mt-3 text-xs min-h-[20px]">
        {card.trend && (
          <div className={`flex items-center font-medium ${card.trendColor}`}>
            {TrendIcon && <TrendIcon size={14} className="mr-1" />}
            {card.trend} <span className="text-slate-500 font-normal ml-1">{card.trendText}</span>
          </div>
        )}
        {card.subText && <p className="text-slate-500 font-medium">{card.subText}</p>}
        {card.subTextBold && <p className={`${card.subTextColor} font-semibold`}>{card.subTextBold}</p>}
        {(card.subLeft || card.subRightBold) ? (
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-500 font-medium">{card.subLeft}</span>
            {card.badgeText && <span className={`${card.badgeColor} px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase`}>{card.badgeText}</span>}
            {card.subRightBold && <span className="text-slate-900 font-bold">{card.subRightBold}</span>}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [segment, setSegment] = useState('all');
  const [isEditing, setIsEditing] = useState(false);

  // Load layout from localStorage or use default
  const savedLayout = JSON.parse(localStorage.getItem('adminDashLayout') || 'null');
  const [widgetLayout, setWidgetLayout] = useState(savedLayout || defaultLayout);
  
  const savedKpiOrder = JSON.parse(localStorage.getItem('adminDashKpiOrder') || 'null');
  const [kpiCards, setKpiCards] = useState(() => {
    if (!savedKpiOrder) return initialKpiCards;
    return savedKpiOrder.map(id => initialKpiCards.find(c => c.id === id)).filter(Boolean);
  });

  const availableKpiToAdd = initialKpiCards.filter(
    baseCard => !kpiCards.some(activeCard => activeCard.id === baseCard.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleKpiDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setKpiCards(items => {
        const oldI = items.findIndex(i => i.id === active.id);
        const newI = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldI, newI);
      });
    }
  };

  const handleWidgetDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetLayout(items => {
        const oldI = items.indexOf(active.id);
        const newI = items.indexOf(over.id);
        return arrayMove(items, oldI, newI);
      });
    }
  };

  const removeKpiCard = (id) => {
    setKpiCards(prev => prev.filter(card => card.id !== id));
  };

  const addKpiCard = (id) => {
    const baseCard = initialKpiCards.find(card => card.id === id);
    if (!baseCard) return;
    setKpiCards(prev => [...prev, baseCard]);
  };

  const removeWidget = (id) => setWidgetLayout(prev => prev.filter(w => w !== id));
  const addWidget = (id) => setWidgetLayout(prev => [...prev, id]);

  const availableToAdd = Object.keys(WIDGET_REGISTRY).filter(id => !widgetLayout.includes(id));

  const saveLayout = () => {
    localStorage.setItem('adminDashLayout', JSON.stringify(widgetLayout));
    localStorage.setItem('adminDashKpiOrder', JSON.stringify(kpiCards.map(c => c.id)));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium px-2">
          {isEditing ? <Settings2 size={20} className="text-amber-500" /> : <Filter size={18} className="text-indigo-500" />}
          <span className="text-lg">{isEditing ? 'Customize Dashboard Layout' : 'Global Filters'}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {!isEditing ? (
            <>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-sm border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-2 border font-medium text-slate-700">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="quarter">This Quarter</option>
              </select>
              <select value={segment} onChange={e => setSegment(e.target.value)} className="text-sm border-slate-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-2 border font-medium text-slate-700">
                <option value="all">All Segments</option>
                <option value="alumni">Alumni</option>
                <option value="student">Students</option>
              </select>
              <button onClick={() => setIsEditing(true)} className="ml-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Settings2 size={16} /> Customize
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <select 
                  onChange={(e) => { if(e.target.value) addWidget(e.target.value); e.target.value=''; }} 
                  className="text-sm border-indigo-200 rounded-lg shadow-sm bg-indigo-50 text-indigo-700 font-semibold px-3 py-2 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Widget</option>
                  {availableToAdd.map(id => (
                    <option key={id} value={id}>{WIDGET_REGISTRY[id].title}</option>
                  ))}
                </select>
                <button onClick={() => setWidgetLayout(defaultLayout)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                  Reset
                </button>
                <button onClick={saveLayout} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-2">
          <Settings2 size={18} /> You are in Edit Mode. Drag and drop KPI cards and widgets to reorder them, hide KPI cards you do not need, and click "Save Changes" when done. Your layout is saved for this browser.
        </div>
      )}

      {/* KPI Cards Row */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKpiDragEnd}>
        <SortableContext items={kpiCards.map(c => c.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map(card => (
              <SortableKpiCard
                key={card.id}
                card={card}
                isEditing={isEditing}
                onRemove={removeKpiCard}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isEditing && (
        <div className="flex flex-wrap items-center gap-3 -mt-1">
          <select
            onChange={(e) => {
              if (e.target.value) addKpiCard(e.target.value);
              e.target.value = '';
            }}
            className="text-xs sm:text-sm border-indigo-200 rounded-lg shadow-sm bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              + Add KPI Card
            </option>
            {availableKpiToAdd.map(card => (
              <option key={card.id} value={card.id}>
                {card.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content Widgets Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWidgetDragEnd}>
        <SortableContext items={widgetLayout} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {widgetLayout.map(widgetId => {
              const widgetConfig = WIDGET_REGISTRY[widgetId];
              if (!widgetConfig) return null;
              const WidgetComponent = widgetConfig.component;

              return (
                <div key={widgetId} className={`${widgetConfig.colSpanClass} flex flex-col h-full`}>
                  <DraggableWidget id={widgetId} isEditing={isEditing} onRemove={removeWidget}>
                    <WidgetComponent data={widgetConfig.data} />
                  </DraggableWidget>
                </div>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State when no widgets */}
      {widgetLayout.length === 0 && isEditing && (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
          <Plus size={32} className="mb-2 text-slate-400" />
          <p className="text-lg font-medium">Dashboard is empty</p>
          <p className="text-sm">Use the dropdown above to add widgets</p>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
