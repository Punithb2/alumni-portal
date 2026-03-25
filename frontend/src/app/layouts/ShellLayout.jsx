import React, { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  Settings,
  Menu,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  UserCog,
  Newspaper,
  GraduationCap,
  Handshake,
  Briefcase,
  SlidersHorizontal,
  ShieldCheck,
  User2,
  FileText,
  Store,
  BarChart,
  HeartHandshake,
  Vote,
  Activity,
  ShieldAlert,
  Building2,
  Megaphone,
  UsersRound,
  Gift,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Drawer } from '../components/Drawer'
import { AvatarWithStatus } from '../components/GenericComponents'
import { NAV_SECTIONS } from '../navigations'

// ─── Icon lookup map ───────────────────────────────────────────────────────────
const ICON_MAP = {
  FileText: FileText,
  Users: Users,
  Handshake: Handshake,
  Briefcase: Briefcase,
  Store: Store,
  BarChart: BarChart,
  CalendarDays: CalendarDays,
  HeartHandshake: HeartHandshake,
  ShieldCheck: ShieldCheck,
  Vote: Vote,
  Activity: Activity,
  ShieldAlert: ShieldAlert,
  Settings: Settings,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  UserCog,
  Newspaper,
  GraduationCap,
  SlidersHorizontal,
  Building2,
  Megaphone,
  UsersRound,
  Gift,
}

// ─── Role styling (badge color + label) ───────────────────────────────────────
const ROLE_META = {
  SA: { label: 'Super Admin', color: 'bg-violet-50 text-violet-700 ring-violet-600/20' },
  University: { label: 'University', color: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  Alumni: { label: 'Alumni', color: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  Student: { label: 'Student', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
}

// ─── Filter helpers ────────────────────────────────────────────────────────────
const canAccess = (authArr, role) => !authArr || authArr.includes(role)

const filterSections = (role) =>
  NAV_SECTIONS.filter((section) => canAccess(section.auth, role))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccess(item.auth, role)),
    }))
    .filter((section) => section.items.length > 0)

// ─── SidebarContent ────────────────────────────────────────────────────────────
const SidebarContent = ({ collapsed, setCollapsed, onClose }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || 'Alumni'
  const sections = filterSections(role)
  const roleMeta = ROLE_META[role] || ROLE_META.Alumni

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 overflow-hidden">
      {/* ── Logo ── */}
      <div className="h-16 flex items-center px-4 justify-between flex-shrink-0 mt-4 mb-2">
        <div className="flex items-center gap-3 overflow-hidden ml-2 flex-shrink-0">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="w-12 h-12 object-contain select-none shadow-sm rounded-lg"
            onError={(e) => (e.target.src = '/vite.svg')}
          />
          {!collapsed && (
            <span className="font-bold text-2xl text-slate-900 whitespace-nowrap tracking-tight">
              AlumniPortal
            </span>
          )}
        </div>
        <button
          className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Role Pill ── */}
      {!collapsed && (
        <div className="px-6 py-4 flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md ring-1 ring-inset ${roleMeta.color}`}
          >
            <ShieldCheck size={12} />
            {roleMeta.label}
          </span>
        </div>
      )}

      {/* ── Nav Sections ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-none">
        {sections.map((section, si) => (
          <div key={si}>
            {section.heading && !collapsed && (
              <p className="px-3 mt-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.heading}
              </p>
            )}
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || User2
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin' || item.path === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-full px-4 py-2.5 text-[15px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#eef5fe] text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon size={18} className={`shrink-0`} aria-hidden="true" />
                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Footer ── */}
      <div
        className={`p-4 border-t border-slate-100 flex-shrink-0 flex items-center bg-white
                ${collapsed ? 'flex-col gap-3' : 'gap-3'}`}
      >
        <AvatarWithStatus src={user?.avatar} status="online" size="sm" className="flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate font-medium">{user?.email || ''}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── All nav items flattened (for TopBar title lookup) ────────────────────────
const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

// ─── TopBar ────────────────────────────────────────────────────────────────────
const TopBar = ({ onMenuClick }) => {
  const location = useLocation()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const routeName =
    ALL_ITEMS.find(
      (n) =>
        location.pathname === n.path ||
        (n.path !== '/dashboard' && location.pathname.startsWith(n.path))
    )?.name || 'Dashboard'

  const role = user?.role || 'Alumni'
  const roleMeta = ROLE_META[role] || ROLE_META.Alumni

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center flex-1 gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">{routeName}</h1>

        <div className="ml-2 flex-1 max-w-sm hidden md:flex items-center relative">
          <Search
            className="pointer-events-none absolute left-3 text-slate-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search alumni, events…"
            className="block w-full rounded-md border-0 bg-slate-50 pl-9 pr-4 py-1.5 text-slate-900
                                   shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400
                                   focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 transition-shadow outline-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative -m-1 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </span>
        </button>

        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2">
          <AvatarWithStatus src={user?.avatar} status="online" size="sm" />
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">
              {user?.name || 'User'}
            </p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${roleMeta.color}`}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors ml-1 px-2 py-1.5 rounded-lg hover:bg-rose-50"
        >
          <span className="hidden sm:block text-sm font-medium">Logout</span>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}

// ─── ShellLayout ───────────────────────────────────────────────────────────────
export const ShellLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-20
                ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <SidebarContent
          collapsed={false}
          setCollapsed={setCollapsed}
          onClose={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
