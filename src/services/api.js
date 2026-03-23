import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
}

export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  search: (keyword, params) => api.get('/events/search',
    { params: { keyword, ...params } }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`)
}

export const registrationAPI = {
  register: (eventId) => api.post(`/registrations/events/${eventId}`),
  registerWithPayment: (eventId, utrNumber) =>
    api.post(`/registrations/events/${eventId}`, { utrNumber }),
  cancel: (registrationId) =>
    api.delete(`/registrations/${registrationId}`),
  getMyRegistrations: () => api.get('/registrations/my'),
  getEventRegistrations: (eventId) =>
    api.get(`/registrations/events/${eventId}`)
}

export const superAdminAPI = {
  getAllAdmins: () => api.get('/super-admin/admins'),
  getAllUsers: () => api.get('/super-admin/users'),
  createAdmin: (data) => api.post('/super-admin/admins', data),
  promoteToAdmin: (userId) =>
    api.put(`/super-admin/promote/${userId}`),
  demoteToUser: (userId) =>
    api.put(`/super-admin/demote/${userId}`),
  deactivate: (userId) =>
    api.put(`/super-admin/deactivate/${userId}`)
}

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getAll: () => api.get('/users')
}

export default api