const JOB_TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
}

export const JOB_TYPE_API_BY_LABEL = {
  'Full-time': 'full_time',
  'Part-time': 'part_time',
  Internship: 'internship',
  Contract: 'contract',
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const formatPostedDate = (value) => {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatSalaryRange = (salaryMin, salaryMax) => {
  if (salaryMin && salaryMax) {
    return `${currencyFormatter.format(salaryMin)} - ${currencyFormatter.format(salaryMax)}`
  }
  if (salaryMin) return `${currencyFormatter.format(salaryMin)}+`
  if (salaryMax) return `Up to ${currencyFormatter.format(salaryMax)}`
  return 'Not specified'
}

export const parseSalaryRange = (value) => {
  const cleaned = String(value || '').trim()
  if (!cleaned) return { salaryMin: null, salaryMax: null }

  const matches = cleaned.match(/\d[\d,]*/g) || []
  const numbers = matches
    .map((match) => Number.parseInt(match.replaceAll(',', ''), 10))
    .filter((num) => Number.isFinite(num) && num > 0)

  if (numbers.length === 0) return { salaryMin: null, salaryMax: null }
  if (numbers.length === 1) return { salaryMin: numbers[0], salaryMax: null }

  return {
    salaryMin: Math.min(numbers[0], numbers[1]),
    salaryMax: Math.max(numbers[0], numbers[1]),
  }
}

export const normalizeJob = (job, currentUserId = null) => {
  const rawId = Number(job.id)
  const isOwnJob = currentUserId != null && Number(job.posted_by) === Number(currentUserId)

  return {
    id: String(job.id),
    rawId,
    title: job.title || 'Untitled role',
    company: job.company || 'Unknown company',
    location: job.is_remote ? 'Remote' : job.location || 'Location not specified',
    type: JOB_TYPE_LABELS[job.job_type] || job.type || 'Full-time',
    description: job.description || '',
    requirements: job.requirements || '',
    salary: formatSalaryRange(job.salary_min, job.salary_max),
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    experience_required: job.experience_required || 'Not specified',
    postedDate: formatPostedDate(job.created_at),
    postedBy: isOwnJob ? 'You' : job.posted_by_name || 'Alumni',
    postedById: job.posted_by ?? null,
    postedByRole: isOwnJob ? 'Alumni' : null,
    createdAt: job.created_at || null,
    applicationDeadline: job.application_deadline || null,
    status: job.status || 'active',
    alumniPosted: true,
    alumniRecommended: true,
    logo: null,
    canRefer: Boolean(job.can_refer),
    referralAvailable: Boolean(job.can_refer),
    isRemote: Boolean(job.is_remote),
  }
}

export const getInitials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
