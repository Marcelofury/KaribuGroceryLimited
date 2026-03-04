export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateOnly(dateString) {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatNumber(number) {
  return new Intl.NumberFormat('en-KE').format(number || 0)
}

export function truncateText(text, length = 50) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

export function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getStatusBadgeClass(status) {
  const statusClasses = {
    'paid': 'bg-success',
    'partial': 'bg-warning',
    'pending': 'bg-danger',
    'cash': 'bg-success',
    'credit': 'bg-warning',
    'active': 'bg-success',
    'inactive': 'bg-secondary'
  }
  return statusClasses[status?.toLowerCase()] || 'bg-secondary'
}
