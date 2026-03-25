// src/app/data/clubsStore.js
// Central mock data store for the Clubs / Groups feature

const MEMBER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
]

export const INITIAL_CLUBS = [
  {
    id: 1,
    name: 'AI Enthusiasts & Founders',
    coverPhoto:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'A community for alumni and students building or researching Artificial Intelligence. Share papers, startup ideas, and collaborate on projects.',
    isPrivate: false,
    membersCount: 1240,
    category: 'Technology',
    type: 'Interest Group',
    tags: ['AI', 'ML', 'Startups', 'Research'],
    status: 'active',
    createdAt: '2024-01-15',
    rules: [
      'Be respectful and professional at all times.',
      'No spam or unauthorized promotional content.',
      'Keep posts relevant to AI, ML, and technology.',
      'Credit original authors when sharing research.',
    ],
    admins: [
      { id: 'a1', name: 'Dr. Alan Turing', role: 'Owner', avatar: MEMBER_AVATARS[5] },
      { id: 'a2', name: 'Sarah Jenkins', role: 'Moderator', avatar: MEMBER_AVATARS[0] },
    ],
    memberAvatars: MEMBER_AVATARS.slice(0, 5),
  },
  {
    id: 2,
    name: 'Class of 2026',
    coverPhoto:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Official group for alumni graduating in 2026. Stay connected, plan reunions, and network with your batchmates across the globe.',
    isPrivate: true,
    membersCount: 845,
    category: 'Class Year',
    type: 'Cohort',
    tags: ['Class2026', 'Reunion', 'Networking'],
    status: 'active',
    createdAt: '2023-08-01',
    rules: [
      'Only for Class of 2026 graduates and current students.',
      'Keep conversations supportive and inclusive.',
    ],
    admins: [{ id: 'a3', name: 'Marcus Rivera', role: 'Owner', avatar: MEMBER_AVATARS[1] }],
    memberAvatars: MEMBER_AVATARS.slice(1, 5),
  },
  {
    id: 3,
    name: 'Design & UX Creatives',
    coverPhoto:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Share portfolios, critique designs, and find creative partners. From Figma to branding — all things design.',
    isPrivate: false,
    membersCount: 320,
    category: 'Interest',
    type: 'Interest Group',
    tags: ['Design', 'UX', 'Figma', 'Branding'],
    status: 'active',
    createdAt: '2024-03-10',
    rules: [
      'Constructive feedback only — be kind.',
      'Showcase original work or properly credit sources.',
    ],
    admins: [{ id: 'a4', name: 'Emily Davis', role: 'Owner', avatar: MEMBER_AVATARS[2] }],
    memberAvatars: MEMBER_AVATARS.slice(2, 5),
  },
  {
    id: 4,
    name: 'NYC Alumni Network',
    coverPhoto:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Meetups, happy hours, and networking for alumni living in the Tri-State area. Monthly events in Manhattan.',
    isPrivate: false,
    membersCount: 2100,
    category: 'Geography',
    type: 'Chapter',
    tags: ['NYC', 'Networking', 'Meetups'],
    status: 'active',
    createdAt: '2022-06-01',
    rules: [
      'Must be located in the Tri-State area or nearby.',
      'Promote events courteously — no repetitive posts.',
    ],
    admins: [
      { id: 'a5', name: 'David Chen', role: 'Owner', avatar: MEMBER_AVATARS[1] },
      { id: 'a6', name: 'Priya Nair', role: 'Moderator', avatar: MEMBER_AVATARS[6] },
    ],
    memberAvatars: MEMBER_AVATARS,
  },
  {
    id: 5,
    name: 'London Chapter',
    coverPhoto:
      'https://images.unsplash.com/photo-1513635269975-59693e0cd1ce?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Connecting our growing alumni base across the UK and Europe. Monthly virtual calls and London meetups.',
    isPrivate: false,
    membersCount: 1540,
    category: 'Geography',
    type: 'Chapter',
    tags: ['London', 'UK', 'Europe', 'Networking'],
    status: 'active',
    createdAt: '2022-09-15',
    rules: ['English is the primary language.', 'Be inclusive and welcoming to all regions.'],
    admins: [{ id: 'a7', name: 'James Fletcher', role: 'Owner', avatar: MEMBER_AVATARS[7] }],
    memberAvatars: MEMBER_AVATARS.slice(3, 7),
  },
  {
    id: 6,
    name: 'CSE 2023 Batch',
    coverPhoto:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Computer Science graduates from the class of 2023. Reconnect, share opportunities, and celebrate wins together.',
    isPrivate: true,
    membersCount: 412,
    category: 'Department',
    type: 'Cohort',
    tags: ['CSE', 'Class2023', 'Tech'],
    status: 'active',
    createdAt: '2023-05-20',
    rules: ['Only for CSE 2023 batch members.', "Respect each other's professional journey."],
    admins: [{ id: 'a8', name: 'Rahul Mehta', role: 'Owner', avatar: MEMBER_AVATARS[3] }],
    memberAvatars: MEMBER_AVATARS.slice(0, 3),
  },
  {
    id: 7,
    name: 'FinTech Founders Circle',
    coverPhoto:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Alumni building or investing in Financial Technology. Deal flow, co-founder matching, and regulatory insights.',
    isPrivate: false,
    membersCount: 680,
    category: 'Technology',
    type: 'Interest Group',
    tags: ['FinTech', 'Startups', 'Investing'],
    status: 'pending',
    createdAt: '2025-12-01',
    rules: [
      'Verified alumni and industry professionals only.',
      'No cold pitching — build relationships first.',
    ],
    admins: [{ id: 'a9', name: 'Aisha Kamara', role: 'Owner', avatar: MEMBER_AVATARS[6] }],
    memberAvatars: MEMBER_AVATARS.slice(4, 7),
  },
  {
    id: 8,
    name: 'Women in Leadership',
    coverPhoto:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200&h=400',
    description:
      'Empowering women alumni to lead, inspire, and break barriers. Mentorship, panels, and community support.',
    isPrivate: false,
    membersCount: 920,
    category: 'Interest',
    type: 'Interest Group',
    tags: ['WomenInTech', 'Leadership', 'Mentorship'],
    status: 'active',
    createdAt: '2023-03-08',
    rules: ['Inclusive and supportive environment for all.', 'Constructive discussion only.'],
    admins: [{ id: 'a10', name: 'Dr. Maya Patel', role: 'Owner', avatar: MEMBER_AVATARS[0] }],
    memberAvatars: MEMBER_AVATARS.slice(0, 4),
  },
]

export const INITIAL_POSTS = {
  1: [
    {
      id: 101,
      author: 'Sarah Jenkins',
      authorId: 'a2',
      avatar: MEMBER_AVATARS[0],
      time: '2 hours ago',
      content:
        'Just published a new paper on lightweight LLMs for edge devices. Would love to get feedback from this brilliant community. Link in comments.',
      likes: 24,
      comments: [
        {
          id: 1012,
          author: 'Emily Davis',
          avatar: MEMBER_AVATARS[2],
          text: 'Shared with my team. Really impressive results on the edge deployment!',
          time: '45m ago',
          replies: [],
        },
        {
          id: 1011,
          author: 'David Chen',
          avatar: MEMBER_AVATARS[1],
          text: 'This is phenomenal work, Sarah! The benchmarking methodology is solid.',
          time: '1h ago',
          replies: [
            {
              id: 10111,
              author: 'Sarah Jenkins',
              avatar: MEMBER_AVATARS[0],
              text: 'Thanks David! Let me know if your team implements any of it.',
              time: '30m ago',
            },
          ],
        },
      ],
      isPinned: true,
      image: null,
    },
    {
      id: 102,
      author: 'David Chen',
      authorId: 'u1',
      avatar: MEMBER_AVATARS[1],
      time: '5 hours ago',
      content:
        "Is anyone attending the AI Summit in SF next week? Let's organize an alumni meetup. Drop your name below.",
      likes: 12,
      comments: [
        {
          id: 1021,
          author: 'Priya Nair',
          avatar: MEMBER_AVATARS[6],
          text: "I'll be there! Would love to connect.",
          time: '4h ago',
          replies: [],
        },
      ],
      isPinned: false,
      image: null,
    },
    {
      id: 103,
      author: 'Dr. Alan Turing',
      authorId: 'a1',
      avatar: MEMBER_AVATARS[5],
      time: '1 day ago',
      content:
        "Announcement: We're hosting a virtual paper reading session this Saturday at 4 PM EST. Topic: Transformer Architectures for Vision Tasks. DM me to join the call.",
      likes: 35,
      comments: [],
      isPinned: false,
      image:
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=800',
    },
  ],
}

export const INITIAL_MEMBERS = {
  1: [
    {
      id: 'a1',
      name: 'Dr. Alan Turing',
      role: 'Owner',
      avatar: MEMBER_AVATARS[5],
      title: 'Professor of CS',
      joinedAt: 'Jan 2024',
      isOnline: true,
    },
    {
      id: 'a2',
      name: 'Sarah Jenkins',
      role: 'Moderator',
      avatar: MEMBER_AVATARS[0],
      title: 'ML Research Engineer',
      joinedAt: 'Jan 2024',
      isOnline: true,
    },
    {
      id: 'm1',
      name: 'David Chen',
      role: 'Member',
      avatar: MEMBER_AVATARS[1],
      title: 'Software Engineer @ Meta',
      joinedAt: 'Feb 2024',
      isOnline: false,
    },
    {
      id: 'm2',
      name: 'Emily Davis',
      role: 'Member',
      avatar: MEMBER_AVATARS[2],
      title: 'UX Designer',
      joinedAt: 'Feb 2024',
      isOnline: true,
    },
    {
      id: 'm3',
      name: 'Michael Park',
      role: 'Member',
      avatar: MEMBER_AVATARS[3],
      title: 'AI Product Manager',
      joinedAt: 'Mar 2024',
      isOnline: false,
    },
    {
      id: 'm4',
      name: 'Priya Nair',
      role: 'Member',
      avatar: MEMBER_AVATARS[6],
      title: 'Data Scientist @ Google',
      joinedAt: 'Mar 2024',
      isOnline: true,
    },
    {
      id: 'm5',
      name: 'James Fletcher',
      role: 'Member',
      avatar: MEMBER_AVATARS[7],
      title: 'Startup Founder',
      joinedAt: 'Apr 2024',
      isOnline: false,
    },
    {
      id: 'm6',
      name: 'Aisha Kamara',
      role: 'Member',
      avatar: MEMBER_AVATARS[4],
      title: 'VC Analyst',
      joinedAt: 'Apr 2024',
      isOnline: false,
    },
  ],
}

export const INITIAL_JOIN_REQUESTS = {
  1: [
    {
      id: 'jr1',
      userId: 'req1',
      name: 'Lena Kovacs',
      avatar: MEMBER_AVATARS[4],
      title: 'PhD Candidate in NLP',
      requestedAt: '3 hours ago',
      message: 'Huge fan of AI research. Would love to contribute.',
    },
    {
      id: 'jr2',
      userId: 'req2',
      name: 'Omar Hassan',
      avatar: MEMBER_AVATARS[7],
      title: 'AI Engineer @ OpenAI',
      requestedAt: '1 day ago',
      message: 'Working on multimodal models — great fit for this community.',
    },
  ],
}

export const CLUB_EVENTS = {
  1: [
    {
      id: 'e1',
      title: 'AI Paper Reading Circle',
      date: 'Sat, Mar 15 · 4:00 PM EST',
      type: 'Virtual',
      attendees: 28,
      cover:
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'e2',
      title: 'Founders Happy Hour — SF',
      date: 'Fri, Mar 21 · 6:00 PM PST',
      type: 'In-Person',
      attendees: 54,
      cover:
        'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=600',
    },
  ],
  4: [
    {
      id: 'e3',
      title: 'NYC Monthly Mixer',
      date: 'Thu, Mar 27 · 7:00 PM EST',
      type: 'In-Person',
      attendees: 120,
      cover:
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600',
    },
  ],
}

export const CLUB_JOBS = {
  1: [
    {
      id: 'j1',
      title: 'Senior ML Engineer',
      company: 'DeepMind',
      location: 'London / Remote',
      type: 'Full-time',
      postedBy: 'Sarah Jenkins',
      postedAt: '2 days ago',
      logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=60&h=60',
    },
    {
      id: 'j2',
      title: 'AI Product Lead',
      company: 'Scale AI',
      location: 'San Francisco, CA',
      type: 'Full-time',
      postedBy: 'Dr. Alan Turing',
      postedAt: '5 days ago',
      logo: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=60&h=60',
    },
    {
      id: 'j3',
      title: 'Research Scientist Intern',
      company: 'Anthropic',
      location: 'Remote',
      type: 'Internship',
      postedBy: 'David Chen',
      postedAt: '1 week ago',
      logo: 'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80&w=60&h=60',
    },
  ],
}

export const INITIAL_MESSAGES = {
  1: [
    {
      id: 1,
      senderId: 'a1',
      sender: 'Dr. Alan Turing',
      initials: 'AT',
      avatar: MEMBER_AVATARS[5],
      isMe: false,
      text: "Welcome everyone to the AI Enthusiasts group chat! Let's keep this an open exchange of ideas.",
      time: '9:00 AM',
    },
    {
      id: 2,
      senderId: 'a2',
      sender: 'Sarah Jenkins',
      initials: 'SJ',
      avatar: MEMBER_AVATARS[0],
      isMe: false,
      text: 'Thanks for the invite! Excited to collaborate here. Just posted my latest research in the Feed.',
      time: '9:15 AM',
    },
    {
      id: 3,
      senderId: 'me',
      sender: 'You',
      initials: 'ME',
      avatar: MEMBER_AVATARS[5],
      isMe: true,
      text: 'Great to be here! Looking forward to the paper reading sessions.',
      time: '9:20 AM',
      status: 'Seen',
    },
    {
      id: 4,
      senderId: 'm1',
      sender: 'David Chen',
      initials: 'DC',
      avatar: MEMBER_AVATARS[1],
      isMe: false,
      text: 'Anyone going to SF AI Summit next week? Would love to meet up in person!',
      time: '10:31 AM',
    },
    {
      id: 5,
      senderId: 'me',
      sender: 'You',
      initials: 'ME',
      avatar: MEMBER_AVATARS[5],
      isMe: true,
      text: "I'm in! Let's organize a meetup — maybe dinner after the keynote?",
      time: '10:35 AM',
      status: 'Seen',
    },
  ],
}

// User's joined groups (mock — simulate "current user" has joined groups 1, 3, 4)
export const USER_JOINED_GROUP_IDS = new Set([1, 3, 4])

// User's pending request group IDs
export const USER_PENDING_GROUP_IDS = new Set([2])
