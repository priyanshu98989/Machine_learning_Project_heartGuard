const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const isFormData = options.body instanceof FormData
  const config = {
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  predict: (data) => request('/predict', { method: 'POST', body: JSON.stringify(data) }),

  predictBulk: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('/predict/bulk', { method: 'POST', body: form })
  },

  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/history${query ? `?${query}` : ''}`)
  },

  deleteRecord: (id) => request(`/history/${id}`, { method: 'DELETE' }),

  getDashboard: () => request('/dashboard'),

  getReport: async (id) => {
    const response = await fetch(`${API_BASE}/report/${id}`)
    if (!response.ok) throw new Error('Failed to download report')
    return response.blob()
  },

  getModelMetrics: () => request('/model/metrics'),

  retrainModel: () => request('/model/retrain', { method: 'POST' }),

  health: () => fetch('/health').then(r => r.json()),
}
