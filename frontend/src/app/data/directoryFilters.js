// src/app/data/directoryFilters.js

export const STUDENT_FILTER_OPTIONS = [
  {
    id: 'industry',
    title: 'Industry',
    options: [
      { label: 'Technology', value: 'Technology', count: 150 },
      { label: 'Finance', value: 'Finance', count: 80 },
      { label: 'Consulting', value: 'Consulting', count: 60 },
      { label: 'Media', value: 'Media', count: 40 },
      { label: 'Science', value: 'Science', count: 30 },
    ],
  },
  {
    id: 'mentorship',
    title: 'Mentorship',
    options: [
      { label: 'Open to Mentoring', value: 'yes', count: 120 },
      { label: 'Hiring', value: 'hiring', count: 45 },
      { label: 'Available for Coffee Chat', value: 'coffee', count: 90 },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    options: [
      { label: 'Google', value: 'Google', count: 25 },
      { label: 'Microsoft', value: 'Microsoft', count: 20 },
      { label: 'Amazon', value: 'Amazon', count: 15 },
      { label: 'Startup', value: 'Startup', count: 50 },
    ],
  },
  {
    id: 'skills',
    title: 'Skills / Expertise',
    options: [
      { label: 'React', value: 'React', count: 80 },
      { label: 'Python', value: 'Python', count: 70 },
      { label: 'System Design', value: 'System Design', count: 65 },
      { label: 'Product Strategy', value: 'Product Strategy', count: 40 },
      { label: 'Machine Learning', value: 'Machine Learning', count: 35 },
    ],
  },
  {
    id: 'hiring',
    title: 'Hiring Status',
    options: [{ label: 'Currently Hiring', value: 'yes', count: 45 }],
  },
]

export const ALUMNI_FILTER_OPTIONS = [
  {
    id: 'year',
    title: 'Graduation Year',
    options: [
      { label: '2024', value: '2024', count: 100 },
      { label: '2023', value: '2023', count: 90 },
      { label: '2022', value: '2022', count: 85 },
      { label: '2021', value: '2021', count: 80 },
      { label: 'Before 2020', value: 'older', count: 200 },
    ],
  },
  {
    id: 'department',
    title: 'Department / Major',
    options: [
      { label: 'Computer Science', value: 'Computer Science', count: 150 },
      { label: 'Business Administration', value: 'Business Administration', count: 120 },
      { label: 'Engineering', value: 'Engineering', count: 90 },
      { label: 'Arts & Design', value: 'Arts', count: 45 },
    ],
  },
  {
    id: 'industry',
    title: 'Industry',
    options: [
      { label: 'Technology', value: 'Technology', count: 120 },
      { label: 'Finance', value: 'Finance', count: 45 },
      { label: 'Healthcare', value: 'Healthcare', count: 30 },
      { label: 'Education', value: 'Education', count: 25 },
      { label: 'Marketing', value: 'Marketing', count: 10 },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    options: [
      { label: 'Google', value: 'Google', count: 50 },
      { label: 'Microsoft', value: 'Microsoft', count: 40 },
      { label: 'Amazon', value: 'Amazon', count: 35 },
      { label: 'Meta', value: 'Meta', count: 20 },
      { label: 'Apple', value: 'Apple', count: 15 },
    ],
  },
  {
    id: 'location',
    title: 'Location Area',
    options: [
      { label: 'Bengaluru Area', value: 'Bengaluru', count: 80 },
      { label: 'Mumbai Area', value: 'Mumbai', count: 60 },
      { label: 'Delhi NCR', value: 'Delhi', count: 20 },
      { label: 'Remote / Global', value: 'Remote', count: 40 },
    ],
  },
  {
    id: 'skills',
    title: 'Skills / Expertise',
    options: [
      { label: 'React', value: 'React', count: 80 },
      { label: 'Python', value: 'Python', count: 70 },
      { label: 'System Design', value: 'System Design', count: 65 },
      { label: 'Product Strategy', value: 'Product Strategy', count: 40 },
      { label: 'Machine Learning', value: 'Machine Learning', count: 35 },
    ],
  },
  {
    id: 'hiring',
    title: 'Hiring Status',
    options: [{ label: 'Currently Hiring', value: 'yes', count: 45 }],
  },
]
