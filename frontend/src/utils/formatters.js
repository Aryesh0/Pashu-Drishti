export const humanizeEnum = (value) => {
  if (!value) return 'N/A'
  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatShortDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)

export const formatCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  return Number(value).toFixed(4)
}

export const formatRoleLabel = (role) => humanizeEnum(String(role || '').replace('ROLE_', ''))

export const sumBy = (items, selector) =>
  items.reduce((total, item) => total + (Number(selector(item)) || 0), 0)
