/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

import Loadable from './components/Loadable'
import AuthGuard from './auth/AuthGuard'
import RoleGuard from './auth/RoleGuard'
import { ShellLayout } from './layouts/ShellLayout'
import useAuth from './hooks/useAuth'

// ─── Auth pages (public) ──────────────────────────────────────────────────────
const Login = Loadable(lazy(() => import('./pages/Auth/Auth').then((m) => ({ default: m.Login }))))
const Register = Loadable(
  lazy(() => import('./pages/Auth/Auth').then((m) => ({ default: m.Register })))
)

// ─── Shared pages ─────────────────────────────────────────────────────────────
const Directory = Loadable(lazy(() => import('./pages/Shared/Directory')))
const ProfileDetail = Loadable(lazy(() => import('./pages/Shared/ProfileDetail')))
const Chat = Loadable(lazy(() => import('./pages/Shared/Chat')))
const Events = Loadable(lazy(() => import('./pages/Shared/Events')))
const EventDetail = Loadable(lazy(() => import('./pages/Shared/EventDetail')))
const Settings = Loadable(lazy(() => import('./pages/Shared/Settings')))
const Clubs = Loadable(lazy(() => import('./pages/Shared/Clubs')))

// ─── Dashboards ──────────────────────────────────────────────────────────
const AlumniDashboard = Loadable(lazy(() => import('./pages/Alumni/Dashboard')))
const StudentDashboard = Loadable(lazy(() => import('./pages/Student/Dashboard')))

// ─── Alumni & Member pages ──────────────────────────────────────────────────
const AlumniJobBoard = Loadable(lazy(() => import('./pages/Alumni/JobBoard')))

// ─── Student pages ────────────────────────────────────────────────────────────
const StudentJobBoard = Loadable(lazy(() => import('./pages/Student/JobBoard')))

// ─── Campaign pages ───────────────────────────────────────────────────────────
const CampaignList = Loadable(lazy(() => import('./pages/Campaigns/CampaignList')))
const CampaignDetail = Loadable(lazy(() => import('./pages/Campaigns/CampaignDetail')))
const MyGiving = Loadable(lazy(() => import('./pages/Campaigns/MyGiving')))

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboard = Loadable(lazy(() => import('./pages/Admin/Dashboard')))
const AdminUsers = Loadable(lazy(() => import('./pages/Admin/Users')))
const AdminNews = Loadable(lazy(() => import('./pages/Admin/News')))
const AdminCampaigns = Loadable(lazy(() => import('./pages/Admin/CampaignManager')))
const AdminEvents = Loadable(lazy(() => import('./pages/Admin/EventManager')))
const AdminClubs = Loadable(lazy(() => import('./pages/Admin/ClubsManager')))

// ─── Smart Dashboard Router ───────────────────────────────────────────────────
// Routes to the correct dashboard based on the logged-in user's role.
const DashboardRouter = () => {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'admin') return <Navigate to="/admin" replace />

  if (role === 'student') return <StudentDashboard />
  return <AlumniDashboard />
}

// ─── Smart Jobs Router ────────────────────────────────────────────────────────
// Alumni can post + browse jobs; Students can only browse / apply.
const JobsRouter = () => {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'student') return <StudentJobBoard />
  return <AlumniJobBoard />
}

// ─── Not Found page ───────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <p className="text-lg text-slate-600 mb-6">Page not found</p>
      <a href="/dashboard" className="text-indigo-600 font-semibold hover:text-indigo-500">
        Go to Dashboard
      </a>
    </div>
  </div>
)

const routes = [
  // Public auth routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/session/signin', element: <Navigate to="/login" replace /> },
  { path: '/session/signup', element: <Navigate to="/register" replace /> },

  // Protected app routes (inside ShellLayout with AuthGuard)
  {
    element: (
      <AuthGuard>
        <ShellLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },

      // ── Dashboard (role-aware) ──
      { path: '/dashboard', element: <DashboardRouter /> },

      // ── Directory & Profiles ──
      { path: '/directory', element: <Directory /> },
      { path: '/profile/:id', element: <ProfileDetail /> },
      // legacy alias kept for backwards-compat
      { path: '/profiles/:id', element: <ProfileDetail /> },

      // ── Chat ──
      { path: '/chat', element: <Chat /> },

      // ── Events (Alumni + Student only) ──
      {
        path: '/events',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <Events />
          </RoleGuard>
        ),
      },
      {
        path: '/events/:id',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <EventDetail />
          </RoleGuard>
        ),
      },

      // ── Clubs / Groups ──
      { path: '/clubs', element: <Clubs /> },

      // ── Campaigns & Giving (Alumni + Student only) ──
      {
        path: '/campaigns',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <CampaignList />
          </RoleGuard>
        ),
      },
      {
        path: '/campaigns/:id',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <CampaignDetail />
          </RoleGuard>
        ),
      },
      {
        path: '/giving',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <MyGiving />
          </RoleGuard>
        ),
      },

      // ── Jobs (Alumni + Student + admin only; Admin has no job board) ──
      {
        path: '/jobs',
        element: (
          <RoleGuard allowedRoles={['alumni', 'student', 'admin']}>
            <JobsRouter />
          </RoleGuard>
        ),
      },

      // ── Settings ──
      { path: '/settings', element: <Settings /> },

      // ── Admin (role-guarded) ──
      {
        path: '/admin',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminUsers />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/news',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminNews />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/campaigns',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminCampaigns />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/events',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminEvents />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/clubs',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminClubs />
          </RoleGuard>
        ),
      },
    ],
  },

  // 404 fallback
  { path: '/404', element: <NotFound /> },
  { path: '*', element: <NotFound /> },
]

export default routes
