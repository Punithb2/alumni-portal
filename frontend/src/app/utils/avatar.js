const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']

const hashCode = (value) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export const getInitials = (name = 'User') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export const getAvatarDataUrl = (name = 'User') => {
  const safeName = String(name || 'User').trim() || 'User'
  const initials = getInitials(safeName)
  const bg = COLORS[hashCode(safeName) % COLORS.length]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='128' height='128' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' fill='white' font-family='Inter,Arial,sans-serif' font-size='48' font-weight='700'>${initials}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

