import React, { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, Check, Database, AlertTriangle, Paperclip } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { getAvatarDataUrl } from '../../utils/avatar'
import api from '../../utils/api'
import { useNavigate } from 'react-router-dom'

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
      ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
        transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
)

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, id, type = 'text', value, onChange, placeholder, readOnly }) => {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={isPass && !show ? 'password' : 'text'}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`block w-full rounded-md border-0 py-2 pl-3 pr-10 text-sm text-gray-900
            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
            focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none transition-shadow
            ${readOnly ? 'bg-gray-50 text-gray-500 cursor-default' : 'bg-white'}`}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── SelectField ──────────────────────────────────────────────────────────────
const SelectField = ({ label, id, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
      {label}
    </label>
    <div className="mt-2">
      <select
        id={id}
        value={value ?? ''}
        onChange={onChange}
        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-sm text-gray-900
          shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
          outline-none transition-shadow bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  </div>
)

// ─── TextArea ─────────────────────────────────────────────────────────────────
const TextArea = ({ label, id, value, onChange, rows = 3, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
      {label}
    </label>
    <div className="mt-2">
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-md border-0 py-2 px-3 text-sm text-gray-900
          shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
          focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none transition-shadow resize-none bg-white"
      />
    </div>
  </div>
)

// ─── ToggleItem ───────────────────────────────────────────────────────────────
const ToggleItem = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
)

// ─── FormSection ──────────────────────────────────────────────────────────────
const FormSection = ({
  title,
  description,
  children,
  onSave,
  saveLabel = 'Save changes',
  noBorder,
}) => (
  <div
    className={`md:grid md:grid-cols-3 md:gap-8 ${noBorder ? '' : 'border-t border-gray-200 pt-8'}`}
  >
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
    </div>
    <div className="mt-6 md:col-span-2 md:mt-0">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-6 space-y-5">{children}</div>
        {onSave && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSave}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
                hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)

// ─── CheckboxCard ─────────────────────────────────────────────────────────────
const CheckboxCard = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
)

// ─── SavedBadge ───────────────────────────────────────────────────────────────
const SavedBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
    <Check size={11} /> Saved
  </span>
)

// ─── Role nav config ───────────────────────────────────────────────────────────
const ROLE_NAV = {
  Alumni: [
    { id: 'profile', label: 'Account' },
    { id: 'professional', label: 'Professional' },
    { id: 'mentorship', label: 'Mentorship' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'security', label: 'Security' },
  ],
  Student: [
    { id: 'profile', label: 'Account' },
    { id: 'professional', label: 'Professional' },
    { id: 'mentorship', label: 'Mentorship' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'security', label: 'Security' },
  ],
  Admin: [
    { id: 'profile', label: 'Account' },
    { id: 'portal', label: 'Portal' },
    { id: 'users', label: 'User Access' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ],
  SA: [
    { id: 'profile', label: 'Account' },
    { id: 'portal', label: 'Portal' },
    { id: 'users', label: 'User Access' },
    { id: 'admins', label: 'Admins' },
    { id: 'data', label: 'Data & Audit' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ],
}

const ROLE_BADGE = {
  Alumni: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-600/20' },
  Student: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Admin: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-600/20' },
  SA: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const normalizeSettingsRole = (rawRole) => {
  const role = String(rawRole || '').toLowerCase()
  if (role === 'student') return 'Student'
  if (role === 'alumni') return 'Alumni'
  if (role === 'admin' || role === 'university') return 'Admin'
  if (role === 'sa' || role === 'super_admin') return 'SA'
  return 'Alumni'
}

const SUPPLEMENTAL_PROFILE_FIELDS = ['industry', 'degree', 'timezone', 'program', 'currentYear', 'advisor', 'cgpa']

const DEFAULT_PORTAL_SETTINGS = {
  siteName: 'Alumni Portal',
  maintenanceMode: false,
  registrationOpen: true,
  emailApproval: true,
  publicDirectory: true,
  allowStudentMessages: true,
  jobPostingEnabled: true,
  eventsEnabled: true,
}

const DEFAULT_NOTIFICATIONS = {
  emailDigest: true,
  push: false,
  messages: true,
  eventReminders: true,
  newConnections: true,
  jobAlerts: false,
  mentoringRequests: true,
  mentorMatchAlerts: true,
  applicationUpdates: true,
  deadlineReminders: true,
  newRegistrations: true,
  pendingApprovals: true,
  weeklyReport: true,
  securityAlerts: true,
  contentReports: true,
  systemUpdates: false,
  adminActionLog: true,
  systemHealthAlerts: true,
}

const DEFAULT_PRIVACY = {
  showEmail: false,
  showPhone: false,
  showInDirectory: true,
  allowMessages: true,
  openToMentoring: true,
  showCurrentCompany: true,
  showCareerInterests: true,
  allowAlumniContact: true,
}

const DEFAULT_PROFESSIONAL = {
  openToJobs: false,
  showCompany: false,
}

const DEFAULT_MENTORSHIP_PREFS = {
  openToMentoring: true,
  areas: ['Career Advice', 'Resume Review', 'Interview Prep'],
  menteeTypes: ['Undergraduates', 'Recent Grads'],
  availabilitySlots: ['Weekends only', 'Evenings PST'],
  mode: ['Online Video Calls'],
  maxMentees: 2,
}

const DEFAULT_CAREER_INTERESTS = ['Internships', 'Networking']
const DEFAULT_STUDENT_MENTORING_TOPICS = ['Resume Review', 'Career Path Planning']

const DEFAULT_USER_ACCESS = {
  alumniCanPostJobListings: true,
  alumniCanSendConnectionInvites: false,
  studentsCanViewJobBoard: true,
  studentsCanRequestMentors: true,
  studentsCanMessageAlumni: true,
  adminsCanExportUserData: true,
  autoVerifyInstituteEmailDomain: false,
}

const DEFAULT_MODERATION = {
  autoApproveAlumniJobPosts: true,
  autoApproveEventListings: false,
  allowAnonymousDirectoryBrowsing: false,
}

const DEFAULT_ADMIN_PERMISSIONS = {
  adminsCanApproveRegistrations: true,
  adminsCanPostAnnouncements: true,
  adminsCanExportReports: false,
}

const DEFAULT_DATA_PREFERENCES = {
  retention: '12 months',
  automatedDailyBackups: true,
  anonymiseDeletedAccounts: true,
}

// ═══════════════════════════════════════════════════════════════════════════════
// Settings Component
// ═══════════════════════════════════════════════════════════════════════════════
const Settings = () => {
  const { user, updateProfileInSession, logout } = useAuth()
  const navigate = useNavigate()
  const role = normalizeSettingsRole(user?.role)
  const backendProfile = user?.profile || {}
  const backendUser = backendProfile.user || {}
  const backendSupplemental = backendProfile.supplemental_profile || {}
  const backendProfessional = backendProfile.professional_preferences || {}
  const backendMentorship = backendProfile.mentorship_preferences || {}
  const backendNotifications = backendProfile.notification_preferences || {}
  const backendPrivacy = backendProfile.privacy_preferences || {}
  const nameFromBackend = `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim()
  const currentUser = {
    name: nameFromBackend || user?.name || '',
    avatar: backendProfile.avatar || user?.avatar || '',
    email: backendUser.email || user?.email || '',
  }

  const navItems = ROLE_NAV[role] || ROLE_NAV.Alumni
  const badge = ROLE_BADGE[role] || ROLE_BADGE.Alumni
  const [activeSection, setActiveSection] = useState(navItems[0].id)
  const [savedSection, setSavedSection] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [sectionSaving, setSectionSaving] = useState('')
  const [activeSessions, setActiveSessions] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [adminAccounts, setAdminAccounts] = useState([])
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser.avatar || getAvatarDataUrl(currentUser.name || 'User')
  )
  const fileInputRef = useRef(null)

  const markSaved = (key) => {
    setSavedSection(key)
    setTimeout(() => setSavedSection(null), 2500)
  }

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: backendProfile.phone || '',
    location: [backendProfile.city, backendProfile.country].filter(Boolean).join(', '),
    bio: backendProfile.bio || '',
    headline: backendProfile.headline || '',
    company: backendProfile.current_company || '',
    linkedin: backendProfile.linkedin_url || '',
    industry: backendSupplemental.industry || '',
    graduationYear: backendProfile.graduation_year ? String(backendProfile.graduation_year) : '',
    department: backendProfile.department || '',
    degree: backendSupplemental.degree || '',
    timezone: backendSupplemental.timezone || '',
    program: backendSupplemental.program || '',
    studentId: backendProfile.student_id || '',
    currentYear: backendSupplemental.currentYear || '',
    advisor: backendSupplemental.advisor || '',
    cgpa: backendSupplemental.cgpa || '',
    adminRole: role === 'SA' ? 'Super Admin' : 'Portal Admin',
    instituteEmail: currentUser.email || '',
    department_admin: backendProfile.department || '',
  })
  const sp = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }))

  // ── Portal state ──────────────────────────────────────────────────────────
  const [portal, setPortal] = useState(DEFAULT_PORTAL_SETTINGS)
  const [userAccess, setUserAccess] = useState(DEFAULT_USER_ACCESS)
  const [moderation, setModeration] = useState(DEFAULT_MODERATION)
  const [adminPermissions, setAdminPermissions] = useState(DEFAULT_ADMIN_PERMISSIONS)
  const [dataPreferences, setDataPreferences] = useState(DEFAULT_DATA_PREFERENCES)
  const tp = (field) => () => setPortal((p) => ({ ...p, [field]: !p[field] }))

  // ── Notifications state ───────────────────────────────────────────────────
  const [notif, setNotif] = useState({ ...DEFAULT_NOTIFICATIONS, ...backendNotifications })
  const tn = (field) => () => setNotif((n) => ({ ...n, [field]: !n[field] }))

  // ── Privacy state ─────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({ ...DEFAULT_PRIVACY, ...backendPrivacy })
  const tpv = (field) => () => setPrivacy((p) => ({ ...p, [field]: !p[field] }))

  // ── Professional state ────────────────────────────────────────────────────
  const [pro, setPro] = useState({
    openToJobs: Boolean(backendProfessional.openToJobs || backendProfile.willing_to_hire),
    showCompany: Boolean(backendProfessional.showCompany ?? backendProfile.current_company),
    skills: Array.isArray(backendProfile.skills)
      ? backendProfile.skills.join(', ')
      : (backendProfile.skills ?? ''),
  })

  // ── Mentorship state ──────────────────────────────────────────────────────
  const [mentorshipPrefs, setMentorshipPrefs] = useState({
    ...DEFAULT_MENTORSHIP_PREFS,
    ...backendMentorship,
    openToMentoring: Boolean(
      backendMentorship.openToMentoring ?? backendProfile.willing_to_mentor ?? true
    ),
  })

  // ── Password state ────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })

  // ── Academic interest state (Student) ─────────────────────────────────────
  const [careerInterests, setCareerInterests] = useState(
    backendSupplemental.careerInterests || DEFAULT_CAREER_INTERESTS
  )
  const [mentoringPrefs, setMentoringPrefs] = useState(
    backendSupplemental.mentoringTopics || DEFAULT_STUDENT_MENTORING_TOPICS
  )
  const toggleList = (list, setList, item) =>
    setList((l) => (l.includes(item) ? l.filter((i) => i !== item) : [...l, item]))

  useEffect(() => {
    setAvatarUrl(currentUser.avatar || getAvatarDataUrl(currentUser.name || 'User'))
  }, [currentUser.avatar, currentUser.name])

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const [sessionsResponse, portalResponse, auditResponse, profilesResponse] = await Promise.all([
          api.get('/auth/sessions/'),
          role === 'Admin' || role === 'SA' ? api.get('/portal-settings/') : Promise.resolve(null),
          role === 'Admin' || role === 'SA' ? api.get('/audit-logs/') : Promise.resolve(null),
          role === 'Admin' || role === 'SA' ? api.get('/profiles/') : Promise.resolve(null),
        ])

        setActiveSessions(
          (Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : []).map((session) => ({
            ...session,
            time: session.current
              ? 'Active now'
              : new Date(session.last_active_at).toLocaleString(),
          }))
        )

        if (portalResponse?.data) {
          const portalData = Array.isArray(portalResponse.data)
            ? portalResponse.data[0]
            : portalResponse.data
          if (portalData) {
            setPortal({
              siteName: portalData.site_name ?? DEFAULT_PORTAL_SETTINGS.siteName,
              maintenanceMode: Boolean(portalData.maintenance_mode),
              registrationOpen: Boolean(portalData.registration_open),
              emailApproval: Boolean(portalData.email_approval),
              publicDirectory: Boolean(portalData.public_directory),
              allowStudentMessages: Boolean(portalData.allow_student_messages),
              jobPostingEnabled: Boolean(portalData.job_posting_enabled),
              eventsEnabled: Boolean(portalData.events_enabled),
            })
            setUserAccess({ ...DEFAULT_USER_ACCESS, ...(portalData.role_permissions || {}) })
            setModeration({ ...DEFAULT_MODERATION, ...(portalData.moderation_settings || {}) })
            setAdminPermissions({
              ...DEFAULT_ADMIN_PERMISSIONS,
              ...(portalData.admin_permissions || {}),
            })
            setDataPreferences({
              ...DEFAULT_DATA_PREFERENCES,
              ...(portalData.data_preferences || {}),
            })
          }
        }

        if (auditResponse?.data) {
          setAuditLog(Array.isArray(auditResponse.data) ? auditResponse.data : auditResponse.data.results || [])
        }

        if (profilesResponse?.data) {
          const allProfiles = Array.isArray(profilesResponse.data)
            ? profilesResponse.data
            : profilesResponse.data.results || []
          setAdminAccounts(
            allProfiles.filter((item) => item.role === 'admin').map((item) => ({
              id: item.id,
              name:
                `${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim() ||
                item.user?.email ||
                'Admin',
              email: item.user?.email || '',
              avatar: item.avatar || getAvatarDataUrl(item.user?.email || 'Admin'),
              active: true,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to load settings data', error)
        setSaveError('Failed to load some settings data from the backend.')
      }
    }

    fetchSettingsData()
  }, [role])

  const refreshProfileSession = async () => {
    const refreshed = await api.get('/auth/me/')
    updateProfileInSession?.(refreshed.data)
    return refreshed.data
  }

  const saveProfileSection = async (saveKey, overrides = {}) => {
    if (!backendProfile.id) return

    setSaveError('')
    setSectionSaving(saveKey)
    try {
      const locationParts = String(profile.location || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
      const city = locationParts[0] || ''
      const country = locationParts.slice(1).join(', ')
      const nameParts = String(profile.name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ')
      const parsedGradYear = Number.parseInt(profile.graduationYear, 10)

      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: String((role === 'Admin' || role === 'SA' ? profile.instituteEmail : profile.email) || '').trim(),
        phone: String(profile.phone || '').trim(),
        city,
        country,
        bio: String(profile.bio || '').trim(),
        headline: String(profile.headline || '').trim(),
        current_company: String(profile.company || '').trim(),
        linkedin_url: String(profile.linkedin || '').trim(),
        department: String(
          (role === 'Admin' || role === 'SA' ? profile.department_admin : profile.department) || ''
        ).trim(),
        graduation_year: Number.isNaN(parsedGradYear) ? null : parsedGradYear,
        student_id: String(profile.studentId || '').trim(),
        avatar: avatarUrl || '',
        skills: String(pro.skills || '')
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        willing_to_hire: Boolean(pro.openToJobs),
        willing_to_mentor: Boolean(mentorshipPrefs.openToMentoring),
        supplemental_profile: {
          industry: String(profile.industry || '').trim(),
          degree: String(profile.degree || '').trim(),
          timezone: String(profile.timezone || '').trim(),
          program: String(profile.program || '').trim(),
          currentYear: String(profile.currentYear || '').trim(),
          advisor: String(profile.advisor || '').trim(),
          cgpa: String(profile.cgpa || '').trim(),
          careerInterests,
          mentoringTopics: mentoringPrefs,
        },
        professional_preferences: {
          openToJobs: Boolean(pro.openToJobs),
          showCompany: Boolean(pro.showCompany),
        },
        mentorship_preferences: {
          ...mentorshipPrefs,
          openToMentoring: Boolean(mentorshipPrefs.openToMentoring),
        },
        notification_preferences: notif,
        privacy_preferences: privacy,
        ...overrides,
      }

      await api.patch(`/profiles/${backendProfile.id}/`, payload)
      await refreshProfileSession()
      markSaved(saveKey)
    } catch (error) {
      console.error('Failed to save settings section', error)
      setSaveError(error.response?.data?.detail || 'Failed to save settings changes.')
    } finally {
      setSectionSaving('')
    }
  }

  const savePortalSection = async (saveKey, extraPayload = {}) => {
    setSaveError('')
    setSectionSaving(saveKey)
    try {
      await api.patch('/portal-settings/1/', {
        site_name: portal.siteName,
        maintenance_mode: portal.maintenanceMode,
        registration_open: portal.registrationOpen,
        email_approval: portal.emailApproval,
        public_directory: portal.publicDirectory,
        allow_student_messages: portal.allowStudentMessages,
        job_posting_enabled: portal.jobPostingEnabled,
        events_enabled: portal.eventsEnabled,
        role_permissions: userAccess,
        moderation_settings: moderation,
        admin_permissions: adminPermissions,
        data_preferences: dataPreferences,
        notification_preferences: notif,
        ...extraPayload,
      })
      const auditResponse = await api.get('/audit-logs/')
      setAuditLog(Array.isArray(auditResponse.data) ? auditResponse.data : auditResponse.data.results || [])
      markSaved(saveKey)
    } catch (error) {
      console.error('Failed to save portal settings', error)
      setSaveError(error.response?.data?.detail || 'Failed to save portal settings.')
    } finally {
      setSectionSaving('')
    }
  }

  const handlePasswordChange = async () => {
    setSaveError('')
    setSectionSaving('password')
    try {
      await api.post('/auth/change-password/', {
        current_password: pw.current,
        new_password: pw.newPw,
        confirm_password: pw.confirm,
      })
      setPw({ current: '', newPw: '', confirm: '' })
      markSaved('password')
    } catch (error) {
      console.error('Failed to change password', error)
      const backendErrors = error.response?.data
      const firstError = typeof backendErrors === 'object'
        ? Object.values(backendErrors)[0]?.[0]
        : null
      setSaveError(firstError || 'Failed to change password.')
    } finally {
      setSectionSaving('')
    }
  }

  const handleDeleteAccount = async () => {
    setSaveError('')
    setSectionSaving('delete')
    try {
      await api.delete('/auth/delete-account/')
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to delete account', error)
      setSaveError('Failed to delete account.')
    } finally {
      setSectionSaving('')
    }
  }

  const flashSave = async (key) => {
    const portalKeys = new Set(['portal', 'features', 'moderation', 'admin_permissions', 'data'])
    const profileKeys = new Set([
      'notif_general',
      'notif_alumni',
      'notif_student',
      'notif_admin',
      'notif_sa',
      'privacy_vis',
      'privacy_comm',
      'mentorshipGeneral',
      'mentorshipAreas',
      'mentorshipTypes',
      'careerInterests',
      'mentoringTopics',
      'professional_visibility',
      'professional_skills',
    ])

    if (key === 'password') {
      await handlePasswordChange()
      return
    }
    if (portalKeys.has(key)) {
      await savePortalSection(key)
      return
    }
    if (profileKeys.has(key)) {
      await saveProfileSection(key)
      return
    }

    markSaved(key)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      setUploadError('File size must be under 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const nextAvatar = typeof reader.result === 'string' ? reader.result : ''
      if (!nextAvatar) {
        setUploadError('Unable to read that image. Please try another file.')
        return
      }
      setUploadError('')
      setAvatarUrl(nextAvatar)
      updateProfileInSession?.({ ...backendProfile, avatar: nextAvatar })
    }
    reader.onerror = () => {
      setUploadError('Unable to read that image. Please try another file.')
    }
    reader.readAsDataURL(file)
  }

  const persistProfileChanges = async (saveKey) => {
    await saveProfileSection(saveKey)
  }

  // ── Avatar block (shared) ─────────────────────────────────────────────────
  const AvatarBlock = () => (
    <div className="flex items-center gap-6">
      <img
        src={avatarUrl}
        alt={profile.name}
        className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
      />
      <div>
        {uploadError && (
          <p className="mb-2 text-xs font-medium text-rose-600">{uploadError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
        >
          Change avatar
        </button>
        <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
      </div>
    </div>
  )

  const TIMEZONES = [
    { value: '', label: 'Select timezone' },
    'Pacific Standard Time',
    'Mountain Standard Time',
    'Central Standard Time',
    'Eastern Standard Time',
    'UTC',
    'GMT+5:30 India',
  ]

  // ──────────────────────────────────────────────────────────────────────────
  // PROFILE renderers
  // ──────────────────────────────────────────────────────────────────────────
  const renderProfileAlumni = () => (
    <div className="space-y-8">
      <FormSection
        noBorder
        title="Personal Information"
        description="Use a permanent address where you can receive mail."
        onSave={() => persistProfileChanges('profile')}
      >
        <AvatarBlock />
        {savedSection === 'profile' && <SavedBadge />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" id="name" value={profile.name} onChange={sp('name')} />
          <Field
            label="Headline"
            id="headline"
            value={profile.headline}
            onChange={sp('headline')}
            placeholder="e.g. Senior Engineer"
          />
        </div>
        <Field label="Email address" id="email" value={profile.email} onChange={sp('email')} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone" id="phone" value={profile.phone} onChange={sp('phone')} />
          <Field
            label="Location"
            id="location"
            value={profile.location}
            onChange={sp('location')}
            placeholder="City, Country"
          />
        </div>
        <TextArea
          label="About"
          id="bio"
          value={profile.bio}
          onChange={sp('bio')}
          placeholder="Write a few sentences about yourself."
        />
        <SelectField
          label="Timezone"
          id="timezone"
          value={profile.timezone}
          onChange={sp('timezone')}
          options={TIMEZONES}
        />
      </FormSection>

      <FormSection
        title="Professional Details"
        description="Your career information visible on your alumni profile."
        onSave={() => persistProfileChanges('professional_profile')}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Current company"
            id="company"
            value={profile.company}
            onChange={sp('company')}
          />
          <Field
            label="Industry"
            id="industry"
            value={profile.industry}
            onChange={sp('industry')}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Graduation year"
            id="gradYear"
            value={profile.graduationYear}
            onChange={sp('graduationYear')}
          />
          <Field
            label="Department"
            id="dept"
            value={profile.department}
            onChange={sp('department')}
          />
        </div>
        <Field label="Degree" id="degree" value={profile.degree} onChange={sp('degree')} />
        <Field
          label="LinkedIn URL"
          id="linkedin"
          value={profile.linkedin}
          onChange={sp('linkedin')}
          placeholder="linkedin.com/in/username"
        />
      </FormSection>

      <FormSection title="Documents" description="Your uploaded resumes and cover letters.">
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center">
          <Paperclip className="h-4 w-4 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No documents uploaded yet.</p>
        </div>
      </FormSection>
    </div>
  )

  const renderProfileStudent = () => (
    <div className="space-y-8">
      <FormSection
        noBorder
        title="Personal Information"
        description="Your details visible to alumni mentors and platform staff."
        onSave={() => persistProfileChanges('profile')}
      >
        <AvatarBlock />
        {savedSection === 'profile' && <SavedBadge />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" id="name" value={profile.name} onChange={sp('name')} />
          <Field label="Student ID" id="studentId" value={profile.studentId} readOnly />
        </div>
        <Field label="Email address" id="email" value={profile.email} onChange={sp('email')} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone" id="phone" value={profile.phone} onChange={sp('phone')} />
          <Field
            label="Location"
            id="location"
            value={profile.location}
            onChange={sp('location')}
          />
        </div>
        <TextArea label="About" id="bio" value={profile.bio} onChange={sp('bio')} />
        <SelectField
          label="Timezone"
          id="timezone"
          value={profile.timezone}
          onChange={sp('timezone')}
          options={TIMEZONES}
        />
      </FormSection>

      <FormSection
        title="Academic Information"
        description="Your current academic details shown on your profile."
        onSave={() => persistProfileChanges('academic_profile')}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Program / Degree"
            id="program"
            value={profile.program}
            onChange={sp('program')}
          />
          <Field
            label="Department"
            id="dept"
            value={profile.department}
            onChange={sp('department')}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            label="Current year"
            id="currentYear"
            value={profile.currentYear}
            onChange={sp('currentYear')}
            options={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']}
          />
          <Field
            label="CGPA"
            id="cgpa"
            value={profile.cgpa}
            onChange={sp('cgpa')}
            placeholder="e.g. 3.7"
          />
        </div>
        <Field
          label="Academic advisor"
          id="advisor"
          value={profile.advisor}
          onChange={sp('advisor')}
        />
      </FormSection>

      <FormSection title="Documents" description="Your uploaded academic documents.">
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center">
          <Paperclip className="h-4 w-4 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No documents uploaded yet.</p>
        </div>
      </FormSection>
    </div>
  )

  const renderProfileAdmin = () => (
    <div className="space-y-8">
      <FormSection
        noBorder
        title={role === 'SA' ? 'Super Admin Profile' : 'Admin Profile'}
        description={
          role === 'SA'
            ? 'Your top-level administrator account details.'
            : 'Your administrator account. Contact a Super Admin to change your role.'
        }
        onSave={() => persistProfileChanges('profile')}
      >
        <AvatarBlock />
        {savedSection === 'profile' && <SavedBadge />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" id="name" value={profile.name} onChange={sp('name')} />
          <Field label="Admin role" id="adminRole" value={profile.adminRole} readOnly />
        </div>
        <Field
          label="Institute email"
          id="instituteEmail"
          value={profile.instituteEmail}
          onChange={sp('instituteEmail')}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone" id="phone" value={profile.phone} onChange={sp('phone')} />
          <Field
            label="Department"
            id="dept"
            value={profile.department_admin}
            onChange={sp('department_admin')}
          />
        </div>
        <TextArea label="About" id="bio" value={profile.bio} onChange={sp('bio')} />
      </FormSection>
    </div>
  )

  const renderProfile = () => {
    if (role === 'Student') return renderProfileStudent()
    if (role === 'Admin' || role === 'SA') return renderProfileAdmin()
    return renderProfileAlumni()
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PROFESSIONAL — Alumni only
  // ──────────────────────────────────────────────────────────────────────────
  const renderProfessional = () => {
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Career Visibility"
          description="Control how your professional presence appears to students and recruiters."
          onSave={() => flashSave('professional_visibility')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Open to new roles"
              description="Signal to recruiters you're exploring opportunities."
              checked={pro.openToJobs}
              onChange={() => setPro((p) => ({ ...p, openToJobs: !p.openToJobs }))}
            />
            <ToggleItem
              label="Show current company"
              description="Display your employer on your alumni profile."
              checked={pro.showCompany}
              onChange={() => setPro((p) => ({ ...p, showCompany: !p.showCompany }))}
            />
          </div>
          <Field
            label="Skills / Expertise"
            id="skills"
            value={pro.skills}
            onChange={(e) => setPro((p) => ({ ...p, skills: e.target.value }))}
            placeholder="e.g. React, Python, SQL"
          />
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MENTORSHIP — Alumni only
  // ──────────────────────────────────────────────────────────────────────────
  const renderMentorship = () => {
    const areas = [
      'Networking',
      'Career Advice',
      'Internships',
      'Job Referrals',
      'Resume Review',
      'Interview Prep',
      'Entrepreneurship',
      'Higher Education',
    ]
    const menteeTypes = [
      'Incoming Freshmen',
      'Undergraduates',
      'Grad Students',
      'Recent Grads',
      'Career Switchers',
    ]

    const toggleArrayItem = (field, item) =>
      setMentorshipPrefs((p) => ({
        ...p,
        [field]: p[field].includes(item) ? p[field].filter((i) => i !== item) : [...p[field], item],
      }))

    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Mentorship Program"
          description="Control your participation in the alumni-student mentorship initiatives."
          onSave={() => flashSave('mentorshipGeneral')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Currently accepting mentees"
              description="Allow students to request mentorship from you."
              checked={mentorshipPrefs.openToMentoring}
              onChange={() =>
                setMentorshipPrefs((p) => ({ ...p, openToMentoring: !p.openToMentoring }))
              }
            />
          </div>
          <div className="mt-4">
            <Field
              label="Maximum active mentees"
              id="maxMentees"
              type="number"
              value={mentorshipPrefs.maxMentees}
              onChange={(e) => setMentorshipPrefs((p) => ({ ...p, maxMentees: e.target.value }))}
            />
          </div>
        </FormSection>

        <FormSection
          title="Areas of Expertise"
          description="What topics can you help your mentees with?"
          onSave={() => flashSave('mentorshipAreas')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {areas.map((item) => (
              <CheckboxCard
                key={item}
                label={item}
                checked={mentorshipPrefs.areas.includes(item)}
                onChange={() => toggleArrayItem('areas', item)}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Mentee Preferences"
          description="Which groups of students are you best equipped to help?"
          onSave={() => flashSave('mentorshipTypes')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {menteeTypes.map((item) => (
              <CheckboxCard
                key={item}
                label={item}
                checked={mentorshipPrefs.menteeTypes.includes(item)}
                onChange={() => toggleArrayItem('menteeTypes', item)}
              />
            ))}
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ACADEMIC — Student only
  // ──────────────────────────────────────────────────────────────────────────
  const renderAcademic = () => {
    const careerItems = [
      'Internships',
      'Full-time Jobs',
      'Research',
      'Entrepreneurship',
      'Further Study',
      'Networking',
      'Freelancing',
      'Government / Public Sector',
    ]
    const mentoringTopics = [
      'Resume Review',
      'Mock Interviews',
      'Career Path Planning',
      'Industry Insights',
      'Scholarship Guidance',
      'Study Abroad',
    ]
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Academic Details"
          description="Your current academic information shown on your profile."
          onSave={() => persistProfileChanges('academic')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Program / Degree"
              id="program"
              value={profile.program}
              onChange={sp('program')}
            />
            <Field
              label="Department"
              id="dept"
              value={profile.department}
              onChange={sp('department')}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Current year"
              id="currentYear"
              value={profile.currentYear}
              onChange={sp('currentYear')}
              options={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']}
            />
            <Field label="CGPA" id="cgpa" value={profile.cgpa} onChange={sp('cgpa')} />
          </div>
          <Field
            label="Academic advisor"
            id="advisor"
            value={profile.advisor}
            onChange={sp('advisor')}
          />
        </FormSection>
        <FormSection
          title="Career Interests"
          description="Help alumni mentors understand what guidance you're seeking."
          onSave={() => flashSave('careerInterests')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {careerItems.map((item) => (
              <CheckboxCard
                key={item}
                label={item}
                checked={careerInterests.includes(item)}
                onChange={() => toggleList(careerInterests, setCareerInterests, item)}
              />
            ))}
          </div>
        </FormSection>
        <FormSection
          title="Preferred Mentoring Topics"
          description="Select topics you'd like to discuss with alumni mentors."
          onSave={() => flashSave('mentoringTopics')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mentoringTopics.map((item) => (
              <CheckboxCard
                key={item}
                label={item}
                checked={mentoringPrefs.includes(item)}
                onChange={() => toggleList(mentoringPrefs, setMentoringPrefs, item)}
              />
            ))}
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PORTAL — Admin & SA
  // ──────────────────────────────────────────────────────────────────────────
  const renderPortal = () => (
    <div className="space-y-8">
      <FormSection
        noBorder
        title="Portal Configuration"
        description="Global settings that apply to all users."
        onSave={() => savePortalSection('portal')}
      >
        <Field
          label="Portal name"
          id="siteName"
          value={portal.siteName}
          onChange={(e) => setPortal((p) => ({ ...p, siteName: e.target.value }))}
        />
        <div className="divide-y divide-gray-100">
          <ToggleItem
            label="Maintenance mode"
            description="Show a maintenance notice to non-admin users."
            checked={portal.maintenanceMode}
            onChange={tp('maintenanceMode')}
          />
          <ToggleItem
            label="Open registration"
            description="Allow new alumni and students to self-register."
            checked={portal.registrationOpen}
            onChange={tp('registrationOpen')}
          />
          <ToggleItem
            label="Require email approval"
            description="New accounts must be approved before access."
            checked={portal.emailApproval}
            onChange={tp('emailApproval')}
          />
        </div>
      </FormSection>
      <FormSection
        title="Feature Controls"
        description="Enable or disable platform features for all users."
        onSave={() => savePortalSection('features')}
      >
        <div className="divide-y divide-gray-100">
          <ToggleItem
            label="Public alumni directory"
            description="Allow guests to browse profiles without logging in."
            checked={portal.publicDirectory}
            onChange={tp('publicDirectory')}
          />
          <ToggleItem
            label="Student–alumni messaging"
            description="Let students initiate conversations with alumni."
            checked={portal.allowStudentMessages}
            onChange={tp('allowStudentMessages')}
          />
          <ToggleItem
            label="Job board posting"
            description="Allow verified alumni to post job listings."
            checked={portal.jobPostingEnabled}
            onChange={tp('jobPostingEnabled')}
          />
          <ToggleItem
            label="Events module"
            description="Show the events section across all roles."
            checked={portal.eventsEnabled}
            onChange={tp('eventsEnabled')}
          />
        </div>
      </FormSection>
      {role === 'SA' && (
        <FormSection
          title="Danger Zone"
          description="Irreversible portal-level actions. Use with extreme caution."
        >
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-4">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Reset portal to defaults</p>
              <p className="mt-1 text-sm text-red-700">
                Resets all portal configuration to factory defaults. Active users are not affected.
              </p>
              <button className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors">
                Reset configuration
              </button>
            </div>
          </div>
        </FormSection>
      )}
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // USER ACCESS — Admin & SA
  // ──────────────────────────────────────────────────────────────────────────
  const renderUsers = () => {
    const permissions = [
      {
        key: 'alumniCanPostJobListings',
        label: 'Alumni can post job listings',
        desc: 'Verified alumni may submit jobs to the board.',
      },
      {
        key: 'alumniCanSendConnectionInvites',
        label: 'Alumni can send connection invites',
        desc: 'Alumni can invite contacts to the portal.',
      },
      {
        key: 'studentsCanViewJobBoard',
        label: 'Students can view job board',
        desc: 'Students have read access to all job listings.',
      },
      {
        key: 'studentsCanRequestMentors',
        label: 'Students can request mentors',
        desc: 'Students may initiate mentor pairing requests.',
      },
      {
        key: 'studentsCanMessageAlumni',
        label: 'Students can message alumni',
        desc: 'Students can start direct conversations.',
      },
      {
        key: 'adminsCanExportUserData',
        label: 'Admins can export user data',
        desc: 'Admins may download CSV exports of member data.',
      },
      {
        key: 'autoVerifyInstituteEmailDomain',
        label: 'Auto-verify institute email domain',
        desc: 'Accounts with matching domain are auto-approved.',
      },
    ]
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Role Permissions"
          description="Set default capabilities for each user role."
          onSave={() => savePortalSection('role_permissions')}
        >
          <div className="divide-y divide-gray-100">
            {permissions.map((item) => (
              <ToggleItem
                key={item.label}
                label={item.label}
                description={item.desc}
                checked={Boolean(userAccess[item.key])}
                onChange={() =>
                  setUserAccess((current) => ({ ...current, [item.key]: !current[item.key] }))
                }
              />
            ))}
          </div>
        </FormSection>
        <FormSection
          title="Content Moderation"
          description="Control who can publish content without admin review."
          onSave={() => flashSave('moderation')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Auto-approve alumni job posts"
              description="Skip manual review for verified alumni postings."
              checked={moderation.autoApproveAlumniJobPosts}
              onChange={() =>
                setModeration((current) => ({
                  ...current,
                  autoApproveAlumniJobPosts: !current.autoApproveAlumniJobPosts,
                }))
              }
            />
            <ToggleItem
              label="Auto-approve event listings"
              description="Admins can post events without secondary review."
              checked={moderation.autoApproveEventListings}
              onChange={() =>
                setModeration((current) => ({
                  ...current,
                  autoApproveEventListings: !current.autoApproveEventListings,
                }))
              }
            />
            <ToggleItem
              label="Allow anonymous directory browsing"
              description="Non-logged-in visitors can view alumni directory."
              checked={moderation.allowAnonymousDirectoryBrowsing}
              onChange={() =>
                setModeration((current) => ({
                  ...current,
                  allowAnonymousDirectoryBrowsing: !current.allowAnonymousDirectoryBrowsing,
                }))
              }
            />
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADMINS — SA only
  // ──────────────────────────────────────────────────────────────────────────
  const renderAdmins = () => {
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Administrator Accounts"
          description="Manage who has administrative access to the portal."
        >
          <ul role="list" className="divide-y divide-gray-100">
            {adminAccounts.map((admin) => (
              <li key={admin.email} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <img src={admin.avatar} alt={admin.name} className="h-9 w-9 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${admin.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}
                  >
                    {admin.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {!adminAccounts.length && (
            <p className="text-sm text-gray-500">No administrator accounts found in the database.</p>
          )}
        </FormSection>
        <FormSection
          title="Admin Permissions"
          description="Set what actions administrators can perform."
          onSave={() => savePortalSection('admin_permissions')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Admins can approve registrations"
              description="Allow admins to approve or reject new member sign-ups."
              checked={adminPermissions.adminsCanApproveRegistrations}
              onChange={() =>
                setAdminPermissions((current) => ({
                  ...current,
                  adminsCanApproveRegistrations: !current.adminsCanApproveRegistrations,
                }))
              }
            />
            <ToggleItem
              label="Admins can post announcements"
              description="Allow admins to post platform-wide announcements."
              checked={adminPermissions.adminsCanPostAnnouncements}
              onChange={() =>
                setAdminPermissions((current) => ({
                  ...current,
                  adminsCanPostAnnouncements: !current.adminsCanPostAnnouncements,
                }))
              }
            />
            <ToggleItem
              label="Admins can export reports"
              description="Allow admins to download platform usage reports."
              checked={adminPermissions.adminsCanExportReports}
              onChange={() =>
                setAdminPermissions((current) => ({
                  ...current,
                  adminsCanExportReports: !current.adminsCanExportReports,
                }))
              }
            />
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DATA & AUDIT — SA only
  // ──────────────────────────────────────────────────────────────────────────
  const renderData = () => {
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Data Management"
          description="Control how platform data is stored and retained."
          onSave={() => flashSave('data')}
        >
          <SelectField
            label="Data retention period"
            id="retention"
            value={dataPreferences.retention}
            onChange={(e) =>
              setDataPreferences((current) => ({ ...current, retention: e.target.value }))
            }
            options={['3 months', '6 months', '12 months', '24 months', 'Indefinite']}
          />
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Automated daily backups"
              description="Back up the database every 24 hours automatically."
              checked={dataPreferences.automatedDailyBackups}
              onChange={() =>
                setDataPreferences((current) => ({
                  ...current,
                  automatedDailyBackups: !current.automatedDailyBackups,
                }))
              }
            />
            <ToggleItem
              label="Anonymise deleted accounts"
              description="Replace PII with anonymised data on account deletion."
              checked={dataPreferences.anonymiseDeletedAccounts}
              onChange={() =>
                setDataPreferences((current) => ({
                  ...current,
                  anonymiseDeletedAccounts: !current.anonymiseDeletedAccounts,
                }))
              }
            />
          </div>
        </FormSection>
        <FormSection
          title="Audit Log"
          description="Recent administrative actions across the platform."
        >
          <ul role="list" className="divide-y divide-gray-100">
            {auditLog.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <Database size={15} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                    <p className="text-xs text-gray-500">{entry.actor_name || 'System'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Unknown'}
                </span>
              </li>
            ))}
          </ul>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            View full audit log →
          </button>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────────────────
  const renderNotifications = () => {
    if (role === 'Alumni') {
      return (
        <div className="space-y-8">
          <FormSection
            noBorder
            title="Email & Push"
            description="Choose how you receive platform updates."
            onSave={() => flashSave('notif_general')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="Weekly email digest"
                description="A summary of activity sent every Monday."
                checked={notif.emailDigest}
                onChange={tn('emailDigest')}
              />
              <ToggleItem
                label="Push notifications"
                description="Browser or mobile push alerts."
                checked={notif.push}
                onChange={tn('push')}
              />
              <ToggleItem
                label="Direct messages"
                description="Notify when someone sends you a message."
                checked={notif.messages}
                onChange={tn('messages')}
              />
              <ToggleItem
                label="Event reminders"
                description="Alerts 24 hours before events you've joined."
                checked={notif.eventReminders}
                onChange={tn('eventReminders')}
              />
            </div>
          </FormSection>
          <FormSection
            title="Alumni Alerts"
            description="Notifications specific to your alumni activity."
            onSave={() => flashSave('notif_alumni')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="New connections"
                description="When someone connects with your profile."
                checked={notif.newConnections}
                onChange={tn('newConnections')}
              />
              <ToggleItem
                label="Job alerts"
                description="New job postings matching your interests."
                checked={notif.jobAlerts}
                onChange={tn('jobAlerts')}
              />
              <ToggleItem
                label="Mentoring requests"
                description="When a student requests you as a mentor."
                checked={notif.mentoringRequests}
                onChange={tn('mentoringRequests')}
              />
            </div>
          </FormSection>
        </div>
      )
    }
    if (role === 'Student') {
      return (
        <div className="space-y-8">
          <FormSection
            noBorder
            title="Email & Push"
            description="Choose how you receive platform updates."
            onSave={() => flashSave('notif_general')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="Weekly email digest"
                checked={notif.emailDigest}
                onChange={tn('emailDigest')}
              />
              <ToggleItem label="Push notifications" checked={notif.push} onChange={tn('push')} />
              <ToggleItem
                label="Direct messages"
                checked={notif.messages}
                onChange={tn('messages')}
              />
              <ToggleItem
                label="Event reminders"
                checked={notif.eventReminders}
                onChange={tn('eventReminders')}
              />
            </div>
          </FormSection>
          <FormSection
            title="Student Alerts"
            description="Notifications related to your academic and career activities."
            onSave={() => flashSave('notif_student')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="Mentor match alerts"
                description="When you're matched with an alumni mentor."
                checked={notif.mentorMatchAlerts}
                onChange={tn('mentorMatchAlerts')}
              />
              <ToggleItem
                label="Application updates"
                description="Status changes on job or internship applications."
                checked={notif.applicationUpdates}
                onChange={tn('applicationUpdates')}
              />
              <ToggleItem
                label="Deadline reminders"
                description="Application and event deadline alerts."
                checked={notif.deadlineReminders}
                onChange={tn('deadlineReminders')}
              />
              <ToggleItem
                label="Job alerts"
                description="New postings matching your career interests."
                checked={notif.jobAlerts}
                onChange={tn('jobAlerts')}
              />
            </div>
          </FormSection>
        </div>
      )
    }
    if (role === 'Admin' || role === 'SA') {
      return (
        <div className="space-y-8">
          <FormSection
            noBorder
            title="Admin Notifications"
            description="Alerts for platform events requiring your attention."
            onSave={() => flashSave('notif_admin')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="New registrations"
                description="When a new user signs up."
                checked={notif.newRegistrations}
                onChange={tn('newRegistrations')}
              />
              <ToggleItem
                label="Pending approvals"
                description="Accounts awaiting your review."
                checked={notif.pendingApprovals}
                onChange={tn('pendingApprovals')}
              />
              <ToggleItem
                label="Weekly report"
                description="Summary of platform activity."
                checked={notif.weeklyReport}
                onChange={tn('weeklyReport')}
              />
              <ToggleItem
                label="Security alerts"
                description="Suspicious activity or login anomalies."
                checked={notif.securityAlerts}
                onChange={tn('securityAlerts')}
              />
              <ToggleItem
                label="Content reports"
                description="User-reported posts or profiles."
                checked={notif.contentReports}
                onChange={tn('contentReports')}
              />
            </div>
          </FormSection>
        </div>
      )
    }
    // SA
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Admin Notifications"
          description="Alerts for platform events requiring attention."
          onSave={() => flashSave('notif_admin')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="New registrations"
              checked={notif.newRegistrations}
              onChange={tn('newRegistrations')}
            />
            <ToggleItem
              label="Pending approvals"
              checked={notif.pendingApprovals}
              onChange={tn('pendingApprovals')}
            />
            <ToggleItem
              label="Weekly report"
              checked={notif.weeklyReport}
              onChange={tn('weeklyReport')}
            />
            <ToggleItem
              label="Security alerts"
              checked={notif.securityAlerts}
              onChange={tn('securityAlerts')}
            />
            <ToggleItem
              label="Content reports"
              checked={notif.contentReports}
              onChange={tn('contentReports')}
            />
          </div>
        </FormSection>
        <FormSection
          title="Super Admin Alerts"
          description="Elevated alerts for platform-wide system events."
          onSave={() => flashSave('notif_sa')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Admin action log"
              description="Notify when any admin takes a significant action."
              checked={notif.adminActionLog}
              onChange={tn('adminActionLog')}
            />
            <ToggleItem
              label="System health alerts"
              description="Database, uptime, and error rate alerts."
              checked={notif.systemHealthAlerts}
              onChange={tn('systemHealthAlerts')}
            />
            <ToggleItem
              label="System updates available"
              description="Notify when a new platform version is ready."
              checked={notif.systemUpdates}
              onChange={tn('systemUpdates')}
            />
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVACY
  // ──────────────────────────────────────────────────────────────────────────
  const renderPrivacy = () => {
    if (role === 'Alumni') {
      return (
        <div className="space-y-8">
          <FormSection
            noBorder
            title="Profile Visibility"
            description="Control what other users can see on your public profile."
            onSave={() => flashSave('privacy_vis')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="Show email address"
                description="Your email is visible to logged-in users."
                checked={privacy.showEmail}
                onChange={tpv('showEmail')}
              />
              <ToggleItem
                label="Show phone number"
                description="Your phone is visible to logged-in users."
                checked={privacy.showPhone}
                onChange={tpv('showPhone')}
              />
              <ToggleItem
                label="Appear in directory"
                description="Your profile is listed in the alumni directory."
                checked={privacy.showInDirectory}
                onChange={tpv('showInDirectory')}
              />
              <ToggleItem
                label="Show current company"
                description="Display your employer on your public profile."
                checked={privacy.showCurrentCompany}
                onChange={tpv('showCurrentCompany')}
              />
            </div>
          </FormSection>
          <FormSection
            title="Communication"
            description="Manage who can contact or approach you."
            onSave={() => flashSave('privacy_comm')}
          >
            <div className="divide-y divide-gray-100">
              <ToggleItem
                label="Allow direct messages"
                description="Other members can send you messages."
                checked={privacy.allowMessages}
                onChange={tpv('allowMessages')}
              />
              <ToggleItem
                label="Open to mentoring students"
                description="Students can send you mentor requests."
                checked={privacy.openToMentoring}
                onChange={tpv('openToMentoring')}
              />
            </div>
          </FormSection>
        </div>
      )
    }
    return (
      <div className="space-y-8">
        <FormSection
          noBorder
          title="Profile Visibility"
          description="Control what alumni and staff can see on your profile."
          onSave={() => flashSave('privacy_vis')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Show email address"
              checked={privacy.showEmail}
              onChange={tpv('showEmail')}
            />
            <ToggleItem
              label="Show phone number"
              checked={privacy.showPhone}
              onChange={tpv('showPhone')}
            />
            <ToggleItem
              label="Appear in directory"
              checked={privacy.showInDirectory}
              onChange={tpv('showInDirectory')}
            />
            <ToggleItem
              label="Show career interests"
              description="Display your career goals to alumni mentors."
              checked={privacy.showCareerInterests}
              onChange={tpv('showCareerInterests')}
            />
          </div>
        </FormSection>
        <FormSection
          title="Communication"
          description="Manage who can contact you."
          onSave={() => flashSave('privacy_comm')}
        >
          <div className="divide-y divide-gray-100">
            <ToggleItem
              label="Allow alumni to contact me"
              description="Alumni can initiate conversations with you."
              checked={privacy.allowAlumniContact}
              onChange={tpv('allowAlumniContact')}
            />
            <ToggleItem
              label="Allow direct messages"
              checked={privacy.allowMessages}
              onChange={tpv('allowMessages')}
            />
          </div>
        </FormSection>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SECURITY
  // ──────────────────────────────────────────────────────────────────────────
  const renderSecurity = () => (
    <div className="space-y-8">
      <FormSection
        noBorder
        title="Change Password"
        description="Update your password to keep your account secure."
        onSave={handlePasswordChange}
      >
        <Field
          label="Current password"
          id="currentPw"
          type="password"
          value={pw.current}
          onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
        />
        <Field
          label="New password"
          id="newPw"
          type="password"
          value={pw.newPw}
          onChange={(e) => setPw((p) => ({ ...p, newPw: e.target.value }))}
        />
        <Field
          label="Confirm new password"
          id="confirmPw"
          type="password"
          value={pw.confirm}
          onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
        />
        {savedSection === 'password' && <SavedBadge />}
      </FormSection>

      <FormSection
        title="Active Sessions"
        description="Devices currently signed in to your account."
      >
        {activeSessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{s.device}</p>
              <p className="text-xs text-gray-500">
                {s.ip} · {s.time}
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-600">
              {s.current ? 'Current session' : 'Recorded'}
            </span>
          </div>
        ))}
        {!activeSessions.length && <p className="text-sm text-gray-500">No active sessions found.</p>}
      </FormSection>

      {(role === 'Alumni' || role === 'Student') && (
        <FormSection
          title="Delete account"
          description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
        >
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
            >
              Yes, delete my account
            </button>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <p className="text-sm font-medium text-red-800">
                Are you absolutely sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                >
                  Confirm deletion
                </button>
              </div>
            </div>
          )}
        </FormSection>
      )}
      {(role === 'Admin' || role === 'SA') && (
        <FormSection
          title="Administrator Access"
          description="Administrator role changes are tracked through central user management."
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Use the admin user management workflow for role changes and account access reviews.
            </p>
          </div>
        </FormSection>
      )}
      {role === 'SA' && (
        <FormSection
          title="Super Admin Control"
          description="Super admin changes should be performed directly in the admin user management flow."
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              There must always be at least one privileged administrator assigned to the portal.
            </p>
          </div>
        </FormSection>
      )}
    </div>
  )

  // ─── Panel map ─────────────────────────────────────────────────────────────
  const PANELS = {
    profile: renderProfile,
    professional: renderProfessional,
    mentorship: renderMentorship,
    academic: renderAcademic,
    portal: renderPortal,
    users: renderUsers,
    admins: renderAdmins,
    data: renderData,
    notifications: renderNotifications,
    privacy: renderPrivacy,
    security: renderSecurity,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header + Tab Navigation ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset
                ${badge.bg} ${badge.text} ${badge.ring}`}
            >
              {role}
            </span>
          </div>
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Settings tabs">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`whitespace-nowrap border-b-2 pb-4 text-sm font-medium transition-colors
                  ${
                    activeSection === item.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {saveError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {saveError}
          </div>
        )}
        {sectionSaving && (
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            Saving changes...
          </div>
        )}
        {PANELS[activeSection]?.()}
      </main>
    </div>
  )
}

export default Settings
