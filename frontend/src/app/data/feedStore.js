// src/app/data/feedStore.js
// Shared feed post data for Alumni and Student dashboards

export const POST_TYPES = {
  UPDATE: { label: 'Update', icon: '', color: 'bg-indigo-50 text-indigo-700' },
  ACHIEVEMENT: { label: 'Achievement', icon: '', color: 'bg-amber-50 text-amber-700' },
  QUESTION: { label: 'Question', icon: '❓', color: 'bg-sky-50 text-sky-700' },
  EVENT: { label: 'Event', icon: '', color: 'bg-rose-50 text-rose-700' },
}

export const REACTIONS = []

// Each post shape:
// { id, author, role, avatar, verified, verifiedType, time, type, content, images[], reactions{}, comments, shares, mockComments[] }
const makePosts = (_variant) => [
  {
    id: 1,
    author: 'Taylor Settler',
    role: 'Product Manager at Webflow',
    avatar: 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg',
    verified: true,
    verifiedType: 'alumni', // alumni | official
    time: '2h ago',
    type: 'ACHIEVEMENT',
    content: `Just hit a huge milestone. Our team shipped the most requested feature in Webflow's history — and we did it in record time.\n\nProud of every single person involved. This one's for the grinders.`,
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    ],
    reactions: { '👍': 42, '❤️': 18, '🔥': 27 },
    comments: 8,
    shares: 14,
    mockComments: [
      {
        id: 3,
        author: 'Alex Reed',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg',
        text: 'Incredible! Congratulations to the whole team 🙌',
        time: '1h ago',
        likes: 4,
        replies: [],
      },
      {
        id: 2,
        author: 'Jamie Cole',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg',
        text: 'This is so inspiring. Taylor you always crush it!',
        time: '2h ago',
        likes: 7,
        replies: [
          {
            id: 201,
            author: 'Taylor Settler',
            avatar: 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg',
            text: 'Thanks so much Jamie, means a lot! 😊',
            time: '1h ago',
            likes: 2,
          },
        ],
      },
      {
        id: 1,
        author: 'Morgan Smith',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg',
        text: 'Well deserved recognition! Keep inspiring us all.',
        time: '3h ago',
        likes: 3,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: 'David Wilson',
    role: 'Senior Software Engineer at Stripe',
    avatar: 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg',
    verified: true,
    verifiedType: 'alumni',
    time: '5h ago',
    type: 'UPDATE',
    content: `Reflecting on my journey so far — it's been an incredible ride! Thanks to everyone who mentored me along the way.\n\nNow I'm looking to give back. If you're a fresh grad trying to break into fintech or backend engineering, DM me. My calendar is open for 30-min chats every Thursday.`,
    images: [],
    reactions: { '👍': 89, '❤️': 31, '😮': 5 },
    comments: 12,
    shares: 22,
    mockComments: [
      {
        id: 6,
        author: 'Sam Wilson',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/28.jpg',
        text: 'I am a new grad and would love to chat! DMing you now.',
        time: '30m ago',
        likes: 1,
        replies: [],
      },
      {
        id: 5,
        author: 'Riley Park',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg',
        text: 'This is exactly what the alumni network is for. 💙',
        time: '2h ago',
        likes: 8,
        replies: [],
      },
      {
        id: 4,
        author: 'Kuz Pewee',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/34.jpg',
        text: "Booked Thursday! Can't wait. Thanks David.",
        time: '4h ago',
        likes: 3,
        replies: [
          {
            id: 401,
            author: 'David Wilson',
            avatar: 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg',
            text: 'Looking forward to it Kuz! Come with questions ready.',
            time: '3h ago',
            likes: 2,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    author: 'University Career Center',
    role: 'Official Department',
    avatar:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200',
    verified: true,
    verifiedType: 'official',
    time: '8h ago',
    type: 'EVENT',
    content: `Application deadline for the Summer Tech Internship Fair is Friday.\n\nOver 60 companies. Both remote-first and on-site opportunities. Make sure your resume has been reviewed by a mentor before you apply.\n\nGood luck to everyone. We're rooting for you.`,
    images: [
      'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800',
    ],
    reactions: { '👍': 134, '❤️': 45, '🔥': 60 },
    comments: 19,
    shares: 67,
    mockComments: [
      {
        id: 9,
        author: 'Alex Reed',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg',
        text: 'Will there be remote companies attending too?',
        time: '1h ago',
        likes: 6,
        replies: [
          {
            id: 901,
            author: 'University Career Center',
            avatar:
              'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200',
            text: 'Yes! Over 25 fully remote companies are confirmed. Full list on the portal.',
            time: '45m ago',
            likes: 14,
          },
        ],
      },
      {
        id: 8,
        author: 'Morgan Smith',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg',
        text: "Can't wait! My resume is ready 💪",
        time: '3h ago',
        likes: 5,
        replies: [],
      },
    ],
  },
  {
    id: 4,
    author: 'Emily Park',
    role: 'UX Design Lead at Figma',
    avatar: 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg',
    verified: true,
    verifiedType: 'alumni',
    time: '1d ago',
    type: 'QUESTION',
    content: `Hot take: The best designers I've hired were not the ones with the biggest portfolios — they were the ones who could clearly explain WHY they made every decision.\n\nAgree or disagree? What's your hiring philosophy?`,
    images: [],
    reactions: { '👍': 203, '❤️': 88, '😮': 34, '🔥': 76 },
    comments: 31,
    shares: 44,
    mockComments: [
      {
        id: 12,
        author: 'Taylor Settler',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg',
        text: "100% agree. Communication is the skill multiplier. A mediocre design explained brilliantly beats a great design that the team can't rally behind.",
        time: '20h ago',
        likes: 29,
        replies: [],
      },
      {
        id: 11,
        author: 'David Wilson',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg',
        text: 'Disagree a little — the WHY matters, but so does execution. You need both.',
        time: '22h ago',
        likes: 17,
        replies: [
          {
            id: 1101,
            author: 'Emily Park',
            avatar: 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg',
            text: 'Fair point David! The floor is still high. But given two candidates at similar skill level, I go for the communicator every time.',
            time: '21h ago',
            likes: 12,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    author: 'James Carter',
    role: 'Startup Founder | Ex-Google',
    avatar: 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg',
    verified: false,
    verifiedType: null,
    time: '2d ago',
    type: 'UPDATE',
    content: `We're officially 6 months old at BuildKit and the numbers are in:\n2,400 paying customers\n$180K MRR\nZero VC funding\n\nBootstrapping is hard. It's also the best decision I've ever made. To all the alumni who took calls with me when we were just an idea — thank you from the bottom of my heart.`,
    images: [
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1553484771-8bde7374aa3f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=800',
    ],
    reactions: { '👍': 512, '❤️': 234, '🔥': 189, '😮': 67 },
    comments: 54,
    shares: 103,
    mockComments: [
      {
        id: 15,
        author: 'Riley Park',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg',
        text: 'THIS. Bootstrapped founders are the real MVPs. Saving this post.',
        time: '1d ago',
        likes: 22,
        replies: [],
      },
      {
        id: 14,
        author: 'Sam Wilson',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/28.jpg',
        text: 'Incredible milestone. How did you get your first 100 customers?',
        time: '2d ago',
        likes: 31,
        replies: [
          {
            id: 1401,
            author: 'James Carter',
            avatar: 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg',
            text: 'Cold emails + this alumni network! Will write a full post about it soon.',
            time: '1d ago',
            likes: 20,
          },
        ],
      },
    ],
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 6 + i,
    author: i % 2 === 0 ? 'Taylor Settler' : 'David Wilson',
    role: i % 2 === 0 ? 'Product Manager at Webflow' : 'Senior Software Engineer at Stripe',
    avatar:
      i % 2 === 0
        ? 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg'
        : 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg',
    verified: true,
    verifiedType: 'alumni',
    time: `${3 + i}d ago`,
    type: i % 3 === 0 ? 'QUESTION' : 'UPDATE',
    content:
      i % 2 === 0
        ? `If anyone is looking for advice breaking into product management as a new grad, my calendar is open next week for Office Hours. Connect with me in the mentor hub!`
        : `Reflecting on ${i + 1} years of experience. Every failure taught me something irreplaceable. Looking forward to sharing more soon.`,
    images: [],
    reactions: { '👍': 15 + i * 4, '❤️': 8 + i * 2 },
    comments: 2 + i,
    shares: 4 + i,
    mockComments: [
      {
        id: 1000 + i,
        author: 'Alex Reed',
        avatar: 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg',
        text: 'Great insight! Thanks for sharing.',
        time: `${i + 1}d ago`,
        likes: 3,
        replies: [],
      },
    ],
  })),
]

export const ALUMNI_POSTS = makePosts('alumni')
export const STUDENT_POSTS = makePosts('student')
