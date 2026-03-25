// src/app/data/dummyData.js
import { subDays, subHours } from 'date-fns'

const now = new Date()

export const dummyProfiles = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    company: 'TechFlow Inc.',
    graduationYear: 2018,
    major: 'Computer Science',
    location: 'San Francisco, CA',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    status: 'online',
    skills: ['React', 'Node.js', 'System Design'],
    about:
      'Passionate about building scalable web applications and mentoring junior developers. Always open to discussing tech and career growth!',
    isMentor: true,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Product Manager',
    company: 'InnovateX',
    graduationYear: 2019,
    major: 'Business Administration',
    location: 'New York, NY',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    status: 'offline',
    skills: ['Agile', 'Product Strategy', 'UX Research'],
    about:
      'Bridging the gap between engineering and user needs. Love connecting with fellow alumni working in the startup space.',
    isMentor: false,
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'UX Designer',
    company: 'Creative Solutions',
    graduationYear: 2021,
    major: 'Graphic Design',
    location: 'Austin, TX',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    status: 'online',
    skills: ['Figma', 'User Testing', 'Prototyping'],
    about:
      'Designing intuitive and beautiful digital experiences. Looking to collaborate on exciting side projects.',
    isMentor: true,
  },
  {
    id: '4',
    name: 'David Lee',
    role: 'Data Scientist',
    company: 'Quantify Analytics',
    graduationYear: 2017,
    major: 'Mathematics',
    location: 'Chicago, IL',
    avatar: 'https://i.pravatar.cc/150?u=david',
    status: 'away',
    skills: ['Python', 'Machine Learning', 'Data Visualization'],
    about:
      'Turning data into actionable insights. Always happy to chat about the latest trends in AI and big data.',
    isMentor: false,
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    role: 'Marketing Director',
    company: 'Global Brands Hub',
    graduationYear: 2015,
    major: 'Communications',
    location: 'Miami, FL',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'online',
    skills: ['Digital Marketing', 'Brand Strategy', 'SEO'],
    about:
      'Helping brands find their voice in a noisy world. Exploring new marketing strategies every day.',
    isMentor: true,
  },
]

export const dummyEvents = [
  {
    id: 'e1',
    title: 'Annual Tech Alumni Mixer',
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
    location: 'Virtual',
    attendees: 145,
    category: 'Networking',
    image:
      'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800',
    description:
      'Join us for our biggest virtual networking event of the year. Reconnect with fellow tech alumni!',
  },
  {
    id: 'e2',
    title: 'Career Transition Panel',
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
    location: 'Campus Center, Room 101',
    attendees: 80,
    category: 'Career',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    description:
      'Hear from a panel of successful alumni who have successfully navigated major career changes.',
  },
  {
    id: 'e3',
    title: 'Startup Pitch Night',
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20),
    location: 'City Innovation Hub',
    attendees: 210,
    category: 'Entrepreneurship',
    image:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800',
    description:
      'Watch innovative alumni-founded startups pitch their ideas to a panel of investors.',
  },
]

export const dummyMessages = [
  {
    id: 'm1',
    senderId: '1',
    text: 'Hey! I saw you recently transitioned to Product Management. Would love to hear about your experience doing so.',
    timestamp: subHours(now, 2),
    isOwn: false,
  },
  {
    id: 'm2',
    senderId: 'currentUser',
    text: 'Hi Sarah! Yes, it was definitely a learning curve but very rewarding. Are you thinking about making the switch?',
    timestamp: subHours(now, 1),
    isOwn: true,
  },
  {
    id: 'm3',
    senderId: '1',
    text: 'I am! Hoping we could grab a virtual coffee sometime next week to chat about it?',
    timestamp: subHours(now, 0.5),
    isOwn: false,
  },
]

export const dummyNews = [
  {
    id: 'n1',
    title: 'University Opens New Innovation Center',
    date: subDays(now, 2),
    summary:
      'A state-of-the-art facility for student and alumni entrepreneurs opens its doors on campus.',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'n2',
    title: 'Alumni Spotlight: Building the Future of Green Tech',
    date: subDays(now, 5),
    summary:
      'Read how a group of recent graduates are making waves in the sustainable energy sector.',
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800',
  },
]

export const dummyJobs = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    company: 'TechFlow Inc.',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    salaryRange: '$110,000 - $140,000',
    experienceLevel: 'Mid-Senior',
    experience_required: '3+ years',
    postedBy: 'Sarah Chen',
    postedByRole: 'Alumni',
    postedById: '1',
    alumniRecommended: true,
    alumniPosted: true,
    referralAvailable: true,
    canRefer: true,
    skills: ['React', 'JavaScript', 'Tailwind'],
    description: 'Looking for an experienced frontend developer to join our core team.',
    postedDate: subDays(now, 2),
  },
  {
    id: 'j2',
    title: 'Product Manager',
    company: 'InnovateX',
    location: 'New York, NY (Remote)',
    type: 'Full-time',
    salary: '$130,000 - $160,000',
    salaryRange: '$130,000 - $160,000',
    experienceLevel: 'Senior',
    experience_required: '5+ years',
    postedBy: 'Recruiting Team',
    postedByRole: 'Recruiter',
    postedById: 'rec1',
    alumniRecommended: false,
    alumniPosted: false,
    referralAvailable: false,
    canRefer: false,
    skills: ['Agile', 'Product Strategy', 'Jira'],
    description: 'Seeking a PM to lead our new mobile app initiative.',
    postedDate: subDays(now, 5),
  },
  {
    id: 'j3',
    title: 'Data Analyst Internship',
    company: 'Quantify Analytics',
    location: 'Chicago, IL (On-site)',
    type: 'Internship',
    salary: '$25/hr',
    salaryRange: '$25/hr',
    experienceLevel: 'Entry',
    experience_required: 'Entry Level',
    postedBy: 'David Lee',
    postedByRole: 'Alumni',
    postedById: '4',
    alumniRecommended: true,
    alumniPosted: true,
    referralAvailable: true,
    canRefer: true,
    skills: ['Python', 'SQL', 'Tableau'],
    description: 'Summer internship for recent grads or current students.',
    postedDate: subDays(now, 1),
  },
]
