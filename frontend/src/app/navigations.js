/**
 * Role-based navigation sections for the Alumni Portal.
 *
 * Roles: SA (Super Admin), University, Alumni, Student
 *
 * Structure per section:
 *   { heading, auth?, items: [{ name, path, icon, auth? }] }
 *
 * `auth` arrays list which roles can see that section / item.
 * Omitting `auth` means ALL authenticated users can see it.
 */
export const NAV_SECTIONS = [
  {
    heading: null,
    items: [
      {
        name: 'My feed',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        auth: ['Alumni', 'Student', 'SA'],
      },
      { name: 'Members', path: '/directory', icon: 'Users' },
      { name: 'Messages', path: '/chat', icon: 'MessageSquare', auth: ['Alumni', 'Student'] },
      { name: 'Clubs', path: '/clubs', icon: 'UsersRound' },
      { name: 'Events', path: '/events', icon: 'CalendarDays', auth: ['Alumni', 'Student', 'SA'] },
      { name: 'Jobs', path: '/jobs', icon: 'Briefcase', auth: ['Alumni', 'Student', 'SA'] },
      {
        name: 'Campaigns',
        path: '/campaigns',
        icon: 'HeartHandshake',
        auth: ['Alumni', 'Student', 'SA'],
      },
      { name: 'My Giving', path: '/giving', icon: 'Gift', auth: ['Alumni', 'Student', 'SA'] },
    ],
  },
  {
    heading: 'University Panel',
    auth: ['University', 'SA'],
    items: [
      { name: 'Dashboard', path: '/admin', icon: 'ShieldAlert', auth: ['University', 'SA'] },
      { name: 'Manage Users', path: '/admin/users', icon: 'UserCog', auth: ['University', 'SA'] },
      { name: 'Manage News', path: '/admin/news', icon: 'Newspaper', auth: ['University', 'SA'] },
      {
        name: 'Manage Events',
        path: '/admin/events',
        icon: 'CalendarDays',
        auth: ['University', 'SA'],
      },
      {
        name: 'Manage Campaigns',
        path: '/admin/campaigns',
        icon: 'Megaphone',
        auth: ['University', 'SA'],
      },
      { name: 'Manage Clubs', path: '/admin/clubs', icon: 'Building2', auth: ['University', 'SA'] },
    ],
  },
  {
    heading: 'My Account',
    items: [{ name: 'Settings', path: '/settings', icon: 'Settings' }],
  },
]
