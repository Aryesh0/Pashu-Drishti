import axios from 'axios'

const API_BASE = '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || ''
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
      const hasToken = Boolean(localStorage.getItem('accessToken'))

      if (hasToken && !isAuthRequest) {
        localStorage.clear()
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

// ── AUTH ──────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (userId) => api.post('/auth/logout', { userId }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
}

// ── FARMS ─────────────────────────────────────
export const farmAPI = {
  create: (data) => api.post('/farms', data),
  getAll: (page = 0, size = 20) => api.get(`/farms?page=${page}&size=${size}`),
  getById: (id) => api.get(`/farms/${id}`),
  getMyFarms: (page = 0, size = 20) => api.get(`/farms/my-farms?page=${page}&size=${size}`),
  search: (keyword, page = 0) => api.get(`/farms/search?keyword=${keyword}&page=${page}`),
  update: (id, data) => api.put(`/farms/${id}`, data),
  updateStatus: (id, status) => api.patch(`/farms/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/farms/${id}`),
}

// ── ANIMALS ───────────────────────────────────
export const animalAPI = {
  create: (data) => api.post('/animals', data),
  getAll: (page = 0, size = 20) => api.get(`/animals?page=${page}&size=${size}`),
  getById: (id) => api.get(`/animals/${id}`),
  getByFarm: (farmId, page = 0, size = 20) => api.get(`/animals/farm/${farmId}?page=${page}&size=${size}`),
  getSickByFarm: (farmId, page = 0, size = 20) => api.get(`/animals/farm/${farmId}/sick?page=${page}&size=${size}`),
  getByTag: (tag) => api.get(`/animals/tag/${tag}`),
  getSick: (page = 0, size = 20) => api.get(`/animals/sick?page=${page}&size=${size}`),
  getPregnant: (page = 0, size = 20) => api.get(`/animals/pregnant?page=${page}&size=${size}`),
  update: (id, data) => api.put(`/animals/${id}`, data),
  updateHealth: (id, status) => api.patch(`/animals/${id}/health-status?healthStatus=${status}`),
  updateStatus: (id, status) => api.patch(`/animals/${id}/status?status=${status}`),
  addVaccination: (id, data) => api.post(`/animals/${id}/vaccinations`, data),
  getQrCode: (id) => api.get(`/animals/${id}/qr-code`),
}

// ── RFID ──────────────────────────────────────
export const rfidAPI = {
  scan: (data) => api.post('/rfid/scan', data),
  assign: (animalId, data) => api.post(`/rfid/assign/${animalId}`, data),
  getAnimalHistory: (animalId, page = 0, size = 20) => api.get(`/rfid/history/animal/${animalId}?page=${page}&size=${size}`),
  getFarmHistory: (farmId, page = 0, size = 20) => api.get(`/rfid/history/farm/${farmId}?page=${page}&size=${size}`),
}

// ── MRL TESTS ─────────────────────────────────
export const mrlAPI = {
  create: (data) => api.post('/mrl-tests', data),
  getAll: (page = 0, size = 20) => api.get(`/mrl-tests?page=${page}&size=${size}`),
  getById: (id) => api.get(`/mrl-tests/${id}`),
  getByFarm: (farmId, page = 0, size = 20) => api.get(`/mrl-tests/farm/${farmId}?page=${page}&size=${size}`),
  getFailed: (page = 0, size = 20) => api.get(`/mrl-tests/failed?page=${page}&size=${size}`),
  updateStatus: (id, status) => api.patch(`/mrl-tests/${id}/status?status=${status}`),
  updateAction: (id, data) => api.patch(`/mrl-tests/${id}/action`, data),
}

// ── ANTIMICROBIAL ─────────────────────────────
export const amrAPI = {
  create: (data) => api.post('/antimicrobial', data),
  getAll: (page = 0, size = 20) => api.get(`/antimicrobial?page=${page}&size=${size}`),
  getById: (id) => api.get(`/antimicrobial/${id}`),
  getByFarm: (farmId, page = 0, size = 20) => api.get(`/antimicrobial/farm/${farmId}?page=${page}&size=${size}`),
  getCritical: (page = 0, size = 20) => api.get(`/antimicrobial/critical?page=${page}&size=${size}`),
  getActiveWithdrawals: (page = 0, size = 20) => api.get(`/antimicrobial/active-withdrawals?page=${page}&size=${size}`),
  updateOutcome: (id, data) => api.patch(`/antimicrobial/${id}/outcome`, data),
  markWithdrawalComplete: (id) => api.patch(`/antimicrobial/${id}/withdrawal-complete`),
}

// ── ADMIN ─────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 0) => api.get(`/admin/users?page=${page}`),
  toggleUser: (userId) => api.patch(`/admin/users/${userId}/toggle-active`),
  getAuditLogs: (page = 0) => api.get(`/admin/audit-logs?page=${page}`),
}

export const publicAPI = {
  getPlatformSummary: () => api.get('/public/platform-summary'),
}

export default api
