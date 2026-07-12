import { apiClient } from './client.js'

export const categoriesApi = {
  list: (params) => apiClient.get('/asset-categories', params),
  getById: (id) => apiClient.get(`/asset-categories/${id}`),
  create: (data) => apiClient.post('/asset-categories', data),
  update: (id, data) => apiClient.patch(`/asset-categories/${id}`, data),
  remove: (id) => apiClient.delete(`/asset-categories/${id}`),
}
