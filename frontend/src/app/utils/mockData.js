/**
 * Centralized mock data for frontend development.
 * TODO: Remove this file when backend API is connected.
 */
import { nanoid } from 'nanoid'

// ─── Profile / Directory ──────────────────────────────────────────────────────
export const MOCK_PROFILES = [
  {
    id: 1,
    first_name: 'Alex',
    last_name: 'Johnson',
    avatar: '',
    headline: 'Software Engineer at Google',
    bio: 'Passionate about building scalable systems and mentoring young engineers.',
    city: 'Bengaluru',
    country: 'India',
    department: 'Computer Science',
    graduation_year: 2020,
    current_company: 'Google',
    current_position: 'Senior SWE',
    linkedin_url: 'https://linkedin.com/in/alexjohnson',
    github_url: 'https://github.com/alexj',
    phone: '+1-555-0100',
    website: 'https://alexjohnson.dev',
    student_id: 'CS2020001',
    skills: ['React', 'Python', 'System Design', 'Cloud Architecture', 'TypeScript'],
    willing_to_mentor: true,
    willing_to_hire: false,
    visibility: 'public', // 'public', 'alumni_only', 'connections_only'
    user: { id: 1, email: 'alex@alumni.com' },
    work_experiences: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Google',
        start_date: '2022-01',
        end_date: '',
        description: 'Leading frontend team for Cloud Console.',
      },
      {
        id: 2,
        title: 'Software Engineer',
        company: 'Meta',
        start_date: '2020-06',
        end_date: '2022-01',
        description: 'Built React components for News Feed.',
      },
    ],
    education: [
      {
        id: 1,
        institution: 'MIT',
        degree: 'B.S.',
        field_of_study: 'Computer Science',
        start_year: 2016,
        end_year: 2020,
      },
    ],
  },
  {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Williams',
    avatar: '',
    headline: 'Product Manager at Amazon',
    bio: 'Driving product innovation in e-commerce.',
    city: 'Mumbai',
    country: 'India',
    department: 'Business',
    graduation_year: 2019,
    current_company: 'Amazon',
    current_position: 'Senior PM',
    linkedin_url: 'https://linkedin.com/in/sarahw',
    skills: ['Product Strategy', 'Agile', 'Data Analytics', 'User Research'],
    willing_to_mentor: true,
    willing_to_hire: true,
    visibility: 'alumni_only',
    user: { id: 2, email: 'sarah@alumni.com' },
    work_experiences: [
      { id: 3, title: 'Senior PM', company: 'Amazon', start_date: '2021-03', end_date: '' },
    ],
    education: [
      {
        id: 2,
        institution: 'Stanford',
        degree: 'MBA',
        field_of_study: 'Business',
        start_year: 2017,
        end_year: 2019,
      },
    ],
  },
  {
    id: 3,
    first_name: 'Raj',
    last_name: 'Patel',
    avatar: '',
    headline: 'Data Scientist at Netflix',
    bio: 'Machine learning enthusiast focused on recommendation systems.',
    city: 'Delhi',
    country: 'India',
    department: 'Data Science',
    graduation_year: 2021,
    current_company: 'Netflix',
    current_position: 'ML Engineer',
    linkedin_url: 'https://linkedin.com/in/rajp',
    github_url: 'https://github.com/rajp',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'SQL', 'Statistics'],
    willing_to_mentor: false,
    willing_to_hire: false,
    visibility: 'public',
    user: { id: 3, email: 'raj@alumni.com' },
    work_experiences: [
      { id: 4, title: 'ML Engineer', company: 'Netflix', start_date: '2021-07', end_date: '' },
    ],
    education: [
      {
        id: 3,
        institution: 'MIT',
        degree: 'M.S.',
        field_of_study: 'Data Science',
        start_year: 2019,
        end_year: 2021,
      },
    ],
  },
  {
    id: 4,
    first_name: 'Emily',
    last_name: 'Chen',
    avatar: '',
    headline: 'UX Designer at Apple',
    bio: 'Creating intuitive user experiences.',
    city: 'Hyderabad',
    country: 'India',
    department: 'Design',
    graduation_year: 2018,
    current_company: 'Apple',
    current_position: 'Lead Designer',
    linkedin_url: 'https://linkedin.com/in/emilyc',
    website: 'https://emilychen.design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    willing_to_mentor: true,
    willing_to_hire: false,
    visibility: 'public',
    user: { id: 4, email: 'emily@alumni.com' },
    work_experiences: [
      { id: 5, title: 'Lead Designer', company: 'Apple', start_date: '2020-01', end_date: '' },
    ],
    education: [
      {
        id: 4,
        institution: 'RISD',
        degree: 'BFA',
        field_of_study: 'Industrial Design',
        start_year: 2014,
        end_year: 2018,
      },
    ],
  },
  {
    id: 5,
    first_name: 'Michael',
    last_name: 'Brown',
    avatar: '',
    headline: 'CTO at TechStartup',
    bio: 'Building the next generation of fintech solutions.',
    city: 'Pune',
    country: 'India',
    department: 'Computer Science',
    graduation_year: 2015,
    current_company: 'FinFlow',
    current_position: 'CTO',
    linkedin_url: 'https://linkedin.com/in/michaelb',
    github_url: 'https://github.com/mbrown',
    skills: ['Leadership', 'Architecture', 'Go', 'Kubernetes', 'AWS'],
    willing_to_mentor: true,
    willing_to_hire: true,
    visibility: 'connections_only',
    user: { id: 5, email: 'michael@alumni.com' },
    work_experiences: [{ id: 6, title: 'CTO', company: 'FinFlow', start_date: '2019-01', end_date: '' }],
    education: [
      {
        id: 5,
        institution: 'MIT',
        degree: 'B.S.',
        field_of_study: 'CS',
        start_year: 2011,
        end_year: 2015,
      },
    ],
  },
  {
    id: 6,
    first_name: 'Priya',
    last_name: 'Sharma',
    avatar: '',
    headline: 'AI Research Scientist at DeepMind',
    bio: 'Researching reinforcement learning for robotics.',
    city: 'Chennai',
    country: 'India',
    department: 'AI',
    graduation_year: 2022,
    current_company: 'DeepMind',
    current_position: 'Research Scientist',
    linkedin_url: 'https://linkedin.com/in/priyas',
    github_url: 'https://github.com/psharma',
    skills: ['PyTorch', 'Reinforcement Learning', 'Robotics', 'C++'],
    willing_to_mentor: false,
    willing_to_hire: false,
    visibility: 'public',
    user: { id: 6, email: 'priya@alumni.com' },
    work_experiences: [
      { id: 7, title: 'Research Scientist', company: 'DeepMind', start_date: '2022-09', end_date: '' },
    ],
    education: [
      {
        id: 6,
        institution: 'MIT',
        degree: 'Ph.D.',
        field_of_study: 'AI',
        start_year: 2018,
        end_year: 2022,
      },
    ],
  },
]

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    job_type: 'full_time',
    status: 'active',
    is_remote: true,
    description:
      "Join our team building the next generation of web applications using React and TypeScript. You'll work on Cloud Console, one of the most complex SPA applications at Google.",
    requirements:
      '5+ years of experience with React\nFamiliarity with TypeScript and state management\nExperience with large-scale applications',
    salary_min: 180000,
    salary_max: 280000,
    experience_required: '5+ years',
    application_deadline: '2026-04-01',
    posted_by: 5,
    posted_by_id: 5,
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Amazon',
    location: 'Seattle, WA',
    job_type: 'full_time',
    status: 'active',
    is_remote: false,
    description:
      'Lead product development for AWS services. Work with engineering teams to define product roadmap and deliver customer value.',
    requirements:
      '3+ years PM experience\nTechnical background preferred\nExperience with cloud services',
    salary_min: 150000,
    salary_max: 220000,
    experience_required: '3+ years',
    application_deadline: '2026-03-15',
    posted_by: 2,
    posted_by_id: 2,
  },
  {
    id: 3,
    title: 'ML Engineering Intern',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    job_type: 'internship',
    status: 'active',
    is_remote: true,
    description:
      "12-week internship working on recommendation algorithms. You'll have the opportunity to work with real production data.",
    salary_min: 8000,
    salary_max: 10000,
    experience_required: 'Enrolled in CS/ML program',
    application_deadline: '2026-05-01',
    posted_by: 3,
    posted_by_id: 3,
  },
  {
    id: 4,
    title: 'UX Design Lead',
    company: 'Apple',
    location: 'Cupertino, CA',
    job_type: 'full_time',
    status: 'closed',
    is_remote: false,
    description: 'Lead the design team for Apple Health.',
    salary_min: 160000,
    salary_max: 240000,
    posted_by: 4,
    posted_by_id: 4,
  },
]

// ─── Job Applications ─────────────────────────────────────────────────────────
export const MOCK_APPLICATIONS = [
  {
    id: 1,
    job_title: 'Senior Frontend Engineer',
    job_company: 'Google',
    status: 'pending',
    applied_at: '2026-02-10T10:00:00Z',
    cover_letter: 'I am excited to apply for this position...',
  },
  {
    id: 2,
    job_title: 'ML Engineering Intern',
    job_company: 'Netflix',
    status: 'accepted',
    applied_at: '2026-01-20T09:00:00Z',
    cover_letter: 'As an ML enthusiast, I would love...',
  },
  {
    id: 3,
    job_title: 'Product Manager',
    job_company: 'Amazon',
    status: 'rejected',
    applied_at: '2026-01-05T14:30:00Z',
  },
]

// ─── Hiring Drives ────────────────────────────────────────────────────────────
export const MOCK_HIRING_DRIVES = [
  {
    id: 1,
    title: 'Spring 2026 Campus Drive',
    company: 'Google',
    description: 'Annual campus hiring for engineering roles.',
    status: 'open',
    drive_date: '2026-03-20T09:00:00Z',
    location: 'Campus Main Hall',
    registration_deadline: '2026-03-10T23:59:00Z',
    registered: false,
  },
  {
    id: 2,
    title: 'TechConnect Hiring Fair',
    company: 'Multiple Companies',
    description: 'Meet recruiters from 20+ top tech companies.',
    status: 'upcoming',
    drive_date: '2026-04-15T10:00:00Z',
    location: 'Convention Center',
    registration_deadline: '2026-04-10T23:59:00Z',
    registered: false,
  },
  {
    id: 3,
    title: 'Fall 2025 Intern Drive',
    company: 'Amazon',
    description: 'Internship hiring for summer 2026.',
    status: 'completed',
    drive_date: '2025-11-10T09:00:00Z',
    location: 'Online',
    registered: true,
  },
]

// ─── Mentoring Module Data ───────────────────────────────────────────────────
export const MOCK_MENTOR_PROFILES = [
  {
    id: 1,
    user: MOCK_PROFILES[0], // Alex Johnson
    headline: 'Software Engineering & Career Growth',
    about: 'I have 6 years of experience building scalable applications. I love helping junior engineers level up their system design and React skills.',
    topics: ['System Design', 'Frontend Architecture', 'Career Growth', 'Interview Prep'],
    languages: ['English', 'Spanish'],
    mentoring_type: ['1:1 long-term', 'Flash mentoring'],
    availability: {
      timezone: 'America/Los_Angeles',
      slots: [
        { day: 'Monday', start: '10:00', end: '12:00' },
        { day: 'Wednesday', start: '14:00', end: '16:00' },
      ]
    },
    rating: 4.9,
    reviews_count: 12,
    active_mentees: 2,
    max_mentees: 3,
    status: 'accepting', // accepting, full, paused
  },
  {
    id: 2,
    user: MOCK_PROFILES[3], // Emily Chen
    headline: 'UX Design & Portfolio Reviews',
    about: 'Passionate about crafting intuitive user experiences. I can help you refine your portfolio and prepare for design interviews.',
    topics: ['UX Research', 'Portfolio Review', 'Design Systems', 'Figma'],
    languages: ['English', 'Mandarin'],
    mentoring_type: ['Flash mentoring'],
    availability: {
      timezone: 'America/Los_Angeles',
      slots: [
        { day: 'Friday', start: '09:00', end: '11:00' }
      ]
    },
    rating: 4.8,
    reviews_count: 8,
    active_mentees: 0,
    max_mentees: 5,
    status: 'accepting',
  },
  {
    id: 3,
    user: MOCK_PROFILES[4], // Michael Brown
    headline: 'Tech Leadership & Startups',
    about: 'Sharing lessons from building companies from scratch. Happy to advise early-stage founders or aspiring engineering managers.',
    topics: ['Leadership', 'Startups', 'Architecture', 'Fundraising'],
    languages: ['English'],
    mentoring_type: ['1:1 long-term'],
    availability: {
      timezone: 'America/New_York',
      slots: [
        { day: 'Tuesday', start: '17:00', end: '18:00' }
      ]
    },
    rating: 5.0,
    reviews_count: 24,
    active_mentees: 2,
    max_mentees: 2,
    status: 'full',
  }
]

export const MOCK_SESSIONS = [
  {
    id: 1,
    mentor_id: 1,
    mentee_id: 99, // Current user fake id
    mentor: MOCK_PROFILES[0],
    mentee: { first_name: 'Current', last_name: 'Student', avatar: '' },
    status: 'upcoming', // upcoming, completed, canceled
    scheduled_at: '2026-03-10T14:00:00Z',
    duration: 60,
    meeting_link: 'https://meet.jit.si/AluminiMentoring1',
    topic: 'System Design Interview Prep',
    notes: 'Please bring a problem you want to whiteboard.',
    agenda: '1. Introductions\n2. Mock Interview\n3. Feedback',
  },
  {
    id: 2,
    mentor_id: 2,
    mentee_id: 99,
    mentor: MOCK_PROFILES[3],
    mentee: { first_name: 'Current', last_name: 'Student', avatar: '' },
    status: 'completed',
    scheduled_at: '2026-02-25T10:00:00Z',
    duration: 30,
    meeting_link: 'https://meet.jit.si/AluminiMentoring2',
    topic: 'Portfolio Review',
    notes: 'Reviewed the case study on fintech app.',
    feedback: {
      rating: 5,
      comment: 'Emily gave fantastic and actionable feedback!'
    }
  }
]

export const MOCK_MENTOR_GOALS = [
  {
    id: 1,
    session_id: 1,
    title: 'Master System Design Basics',
    description: 'Read the first 5 chapters of Designing Data-Intensive Applications.',
    status: 'in_progress', // pending, in_progress, completed
    due_date: '2026-03-15T00:00:00Z',
  },
  {
    id: 2,
    session_id: 1,
    title: 'Complete 3 Mock Interviews',
    description: 'Do 3 mock interviews on standard platforms.',
    status: 'pending',
    due_date: '2026-03-30T00:00:00Z',
  }
]

export const MOCK_MENTORING_REQUESTS = [
  {
    id: 1,
    mentor_id: 1, // Alex Johnson
    mentee_id: 99,
    mentor: MOCK_PROFILES[0],
    mentee: { id: 99, first_name: 'Current', last_name: 'Student', avatar: '' },
    status: 'pending', // pending, accepted, declined
    requested_at: '2026-03-05T10:00:00Z',
    message: 'Hi Alex, I would love to learn more about System Design from you.',
    mentoring_type: '1:1 long-term',
    requested_slot: 'Wednesday 14:00 - 16:00'
  },
  {
    id: 2,
    mentor_id: 2, // Emily Chen
    mentee_id: 99,
    mentor: MOCK_PROFILES[3],
    mentee: { id: 99, first_name: 'Current', last_name: 'Student' },
    status: 'accepted',
    requested_at: '2026-02-15T09:00:00Z',
    message: 'I am preparing for a UX portfolio review and need your guidance.',
    mentoring_type: 'Flash mentoring'
  },
  {
    id: 3,
    mentor_id: 99, // Current user as mentor
    mentee_id: 101,
    mentor: { id: 99, first_name: 'Current', last_name: 'User' },
    mentee: { id: 101, first_name: 'Jane', last_name: 'Doe', headline: 'Sophomore CS Student', avatar: '' },
    status: 'pending',
    requested_at: '2026-03-06T10:00:00Z',
    message: 'I saw your profile and I would love some guidance on my resume!',
    mentoring_type: 'Resume Review',
    requested_slot: 'Friday 09:00 - 10:00'
  },
  {
    id: 4,
    mentor_id: 3,
    mentee_id: 99,
    mentor: MOCK_PROFILES[4],
    mentee: { id: 99, first_name: 'Current', last_name: 'Student' },
    status: 'completed',
    requested_at: '2025-08-10T10:00:00Z',
    message: 'Looking to learn about tech leadership.',
    mentoring_type: '1:1 long-term',
    summary: 'Completed a successful 6-month mentorship covering architecture and leadership basics.'
  }
]

// ─── Messages ─────────────────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    title: 'Sarah Williams',
    current_user_id: 1,
    unread_count: 2,
    participants: [
      { user: 1, first_name: 'Alex', last_name: 'Johnson' },
      { user: 2, first_name: 'Sarah', last_name: 'Williams' },
    ],
    last_message: { content: 'Sounds great! Let me know the details.' },
  },
  {
    id: 2,
    title: 'Raj Patel',
    current_user_id: 1,
    unread_count: 0,
    participants: [
      { user: 1, first_name: 'Alex', last_name: 'Johnson' },
      { user: 3, first_name: 'Raj', last_name: 'Patel' },
    ],
    last_message: { content: 'Thanks for the recommendation!' },
  },
]

export const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      sender: 2,
      sender_name: 'Sarah Williams',
      content: "Hey Alex! How's it going?",
      sent_at: '2026-02-20T10:00:00Z',
    },
    {
      id: 2,
      sender: 1,
      sender_name: 'Alex Johnson',
      content: 'Great! Working on an interesting project.',
      sent_at: '2026-02-20T10:05:00Z',
    },
    {
      id: 3,
      sender: 2,
      sender_name: 'Sarah Williams',
      content: 'Sounds great! Let me know the details.',
      sent_at: '2026-02-20T10:10:00Z',
    },
  ],
  2: [
    {
      id: 4,
      sender: 3,
      sender_name: 'Raj Patel',
      content: 'Can you recommend some system design resources?',
      sent_at: '2026-02-19T15:00:00Z',
    },
    {
      id: 5,
      sender: 1,
      sender_name: 'Alex Johnson',
      content: "Sure! I'd recommend Designing Data-Intensive Applications.",
      sent_at: '2026-02-19T15:30:00Z',
    },
    {
      id: 6,
      sender: 3,
      sender_name: 'Raj Patel',
      content: 'Thanks for the recommendation!',
      sent_at: '2026-02-19T16:00:00Z',
    },
  ],
}

// ─── Forums ───────────────────────────────────────────────────────────────────
export const MOCK_FORUM_CATEGORIES = [
  { id: 1, name: 'General Discussion' },
  { id: 2, name: 'Career Advice' },
  { id: 3, name: 'Technical' },
  { id: 4, name: 'Events' },
]

export const MOCK_FORUM_TOPICS = [
  {
    id: 1,
    title: 'Tips for FAANG Interviews',
    category: 2,
    category_name: 'Career Advice',
    author_name: 'Alex Johnson',
    created_at: '2026-02-15T08:00:00Z',
    reply_count: 12,
    views: 342,
    is_pinned: true,
    is_locked: false,
    content:
      'Here are my top tips for cracking FAANG interviews...\n\n1. Practice data structures daily\n2. Focus on system design\n3. Prepare behavioral stories',
  },
  {
    id: 2,
    title: 'Alumni Reunion 2026',
    category: 4,
    category_name: 'Events',
    author_name: 'Sarah Williams',
    created_at: '2026-02-10T14:00:00Z',
    reply_count: 8,
    views: 156,
    is_pinned: false,
    is_locked: false,
    content: 'Exciting news! The 2026 Alumni Reunion is coming up. Save the date: April 20, 2026.',
  },
  {
    id: 3,
    title: 'Best resources for learning Rust?',
    category: 3,
    category_name: 'Technical',
    author_name: 'Raj Patel',
    created_at: '2026-02-08T11:00:00Z',
    reply_count: 5,
    views: 89,
    is_pinned: false,
    is_locked: false,
    content: 'I want to learn Rust. What are the best free resources?',
  },
  {
    id: 4,
    title: 'Welcome to the Forums!',
    category: 1,
    category_name: 'General Discussion',
    author_name: 'Admin',
    created_at: '2026-01-01T00:00:00Z',
    reply_count: 25,
    views: 1024,
    is_pinned: true,
    is_locked: true,
    content: 'Welcome everyone! Please follow the community guidelines.',
  },
]

export const MOCK_FORUM_REPLIES = [
  {
    id: 1,
    author_name: 'Michael Brown',
    content: "Great tips! I'd also add: don't neglect behavioral questions.",
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 2,
    author_name: 'Emily Chen',
    content: 'Totally agree with the system design focus. So important at senior levels.',
    created_at: '2026-02-15T10:30:00Z',
  },
]

// ─── Social Feed ──────────────────────────────────────────────────────────────
export const MOCK_POSTS = [
  {
    id: 1,
    author_id: 1,
    author_name: 'Alex Johnson',
    author_avatar: '/assets/images/face-6.jpg',
    content:
      "Excited to announce that I've just been promoted to Senior Engineer! 🎉 Thank you to everyone who supported me on this journey.",
    created_at: '2026-02-20T10:00:00Z',
    reaction_counts: { like: 24, love: 8, celebrate: 15, support: 3 },
    comment_count: 5,
    attachments: [],
  },
  {
    id: 2,
    author_id: 2,
    author_name: 'Sarah Williams',
    author_avatar: '/assets/images/face-6.jpg',
    content:
      'Just published a new article on product management best practices. Check it out at my blog! #ProductManagement #Innovation',
    created_at: '2026-02-19T14:00:00Z',
    reaction_counts: { like: 12, love: 3, support: 2 },
    comment_count: 3,
    attachments: [],
  },
  {
    id: 3,
    author_id: 3,
    author_name: 'Raj Patel',
    author_avatar: '/assets/images/face-6.jpg',
    content:
      'Our latest paper on recommendation systems just got accepted at NeurIPS! Big milestone for our team. 🏆',
    created_at: '2026-02-18T09:00:00Z',
    reaction_counts: { like: 42, love: 15, celebrate: 28 },
    comment_count: 8,
    attachments: [],
  },
]

export const MOCK_COMMENTS = [
  {
    id: 1,
    author_name: 'Emily Chen',
    content: 'Congratulations! Well deserved! 🎊',
    created_at: '2026-02-20T11:00:00Z',
  },
  {
    id: 2,
    author_name: 'Michael Brown',
    content: 'Amazing work, keep it up!',
    created_at: '2026-02-20T12:00:00Z',
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS_PAGE = [
  {
    id: nanoid(),
    title: 'New mentorship request',
    message: 'Jane Smith wants you to be their mentor.',
    status: 'unread',
    created_at: '2026-02-20T10:00:00Z',
    notification_type: 'mentorship_request',
  },
  {
    id: nanoid(),
    title: 'Job application update',
    message: 'Your application for ML Intern at Netflix has been accepted!',
    status: 'unread',
    created_at: '2026-02-19T15:00:00Z',
    notification_type: 'job_update',
  },
  {
    id: nanoid(),
    title: 'New comment on your post',
    message: 'Emily Chen commented on your promotion announcement.',
    status: 'read',
    created_at: '2026-02-18T12:00:00Z',
    notification_type: 'comment',
  },
  {
    id: nanoid(),
    title: 'Forum reply',
    message: "Michael Brown replied to your topic 'Tips for FAANG Interviews'.",
    status: 'read',
    created_at: '2026-02-17T09:00:00Z',
    notification_type: 'forum_reply',
  },
]

// ─── Content ──────────────────────────────────────────────────────────────────
export const MOCK_NEWS = [
  {
    id: 1,
    title: 'Alumni Association Launches New Mentorship Program',
    content:
      'We are thrilled to announce a brand new mentorship program connecting alumni with current students. The program will offer one-on-one mentoring, group sessions, and career workshops.',
    category_name: 'Announcement',
    published_at: '2026-02-15T08:00:00Z',
  },
  {
    id: 2,
    title: 'Annual Fundraiser Raises ₹2M for Scholarships',
    content:
      "This year's annual fundraiser was a tremendous success, raising over ₹2 million to support student scholarships and campus development.",
    category_name: 'News',
    published_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 3,
    title: 'Campus Tech Hub Opening in March',
    content:
      'A new state-of-the-art technology hub will open on campus in March 2026, providing co-working spaces and innovation labs for alumni entrepreneurs.',
    category_name: 'Campus',
    published_at: '2026-02-05T12:00:00Z',
  },
]

export const MOCK_SUCCESS_STORIES = [
  {
    id: 1,
    title: 'From Intern to CEO',
    content:
      'Michael Brown shares his journey from a college intern to founding and leading FinFlow, a fintech startup valued at ₹50M.',
    company: 'FinFlow',
    role: 'CEO',
    graduation_year: 2015,
  },
  {
    id: 2,
    title: 'Breaking into AI Research',
    content:
      'Priya Sharma discusses her path to becoming a research scientist at DeepMind and tips for aspiring AI researchers.',
    company: 'DeepMind',
    role: 'Research Scientist',
    graduation_year: 2022,
  },
  {
    id: 3,
    title: 'Design Thinking at Scale',
    content:
      'Emily Chen talks about leading design at Apple and how the skills she learned in school apply to real products used by millions.',
    company: 'Apple',
    role: 'Lead Designer',
    graduation_year: 2018,
  },
]

export const MOCK_BLOG_POSTS = [
  {
    id: 1,
    title: 'The Future of Remote Work in Tech',
    content:
      'Remote work has transformed how we build software. In this article, I explore the trends, challenges, and opportunities that lie ahead for distributed teams...\n\nThe pandemic accelerated remote work adoption by a decade. Now, companies are settling into hybrid models that balance flexibility with collaboration.',
    author_name: 'Alex Johnson',
    tags: ['Remote Work', 'Tech', 'Culture'],
    published_at: '2026-02-18T10:00:00Z',
  },
  {
    id: 2,
    title: 'How to Build a Strong Professional Network',
    content:
      'Networking is one of the most valuable skills for career growth. Here are actionable strategies that have worked for me throughout my career...\n\n1. Be genuinely curious about others\n2. Give before you ask\n3. Follow up consistently',
    author_name: 'Sarah Williams',
    tags: ['Career', 'Networking'],
    published_at: '2026-02-12T14:00:00Z',
  },
  {
    id: 3,
    title: 'Machine Learning Explained Simply',
    content:
      "Machine learning doesn't have to be intimidating. Let me break down the core concepts in plain language...\n\nAt its core, machine learning is about teaching computers to learn from data rather than being explicitly programmed.",
    author_name: 'Raj Patel',
    tags: ['ML', 'AI', 'Tutorial'],
    published_at: '2026-02-05T09:00:00Z',
  },
]

// ─── Admin ────────────────────────────────────────────────────────────────────
export const MOCK_ANALYTICS = {
  latest: {
    total_users: 1247,
    active_users: 342,
    total_posts: 856,
    total_jobs: 45,
    total_mentorships: 23,
    total_messages: 4521,
  },
  last_30_days: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    total_users: 1200 + Math.floor(Math.random() * 50) + i,
    active_users: 300 + Math.floor(Math.random() * 50),
  })),
}

export const MOCK_FLAGS = [
  {
    id: 1,
    content_type: 'Post',
    reason: 'Spam',
    reporter_name: 'Emily Chen',
    status: 'pending',
    created_at: '2026-02-19T14:00:00Z',
  },
  {
    id: 2,
    content_type: 'Comment',
    reason: 'Inappropriate language',
    reporter_name: 'Raj Patel',
    status: 'resolved',
    created_at: '2026-02-15T10:00:00Z',
  },
]

export const MOCK_AUDIT_LOG = [
  {
    id: 1,
    actor_name: 'Alex Johnson',
    action: 'user_login',
    description: 'Logged in from 192.168.1.1',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 2,
    actor_name: 'System',
    action: 'job_expired',
    description: "Job 'UX Design Lead' auto-expired",
    created_at: '2026-02-19T00:00:00Z',
  },
  {
    id: 3,
    actor_name: 'Sarah Williams',
    action: 'content_flagged',
    description: 'Flagged post #42 for review',
    created_at: '2026-02-18T16:00:00Z',
  },
]

export const MOCK_HEALTH = {
  status: 'healthy',
  database: { status: 'ok' },
  db: 'ok',
  cache: { status: 'ok' },
  redis: 'ok',
}
