import { apiClient } from './client.js'

export const bookingsApi = {
  list: (params) => apiClient.get('/bookings', params),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  updateStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),
}
