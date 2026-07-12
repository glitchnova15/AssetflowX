import { apiClient } from './client.js'

export const assetsApi = {
  list: (params) => apiClient.get('/assets', params),
  getById: (id) => apiClient.get(`/assets/${id}`),
  create: (data) => apiClient.post('/assets', data),
  update: (id, data) => apiClient.patch(`/assets/${id}`, data),
  remove: (id) => apiClient.delete(`/assets/${id}`),
  changeStatus: (id, data) => apiClient.patch(`/assets/${id}/status`, data),
  listImages: (id) => apiClient.get(`/assets/${id}/images`),
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.upload(`/assets/${id}/images`, formData)
  },
  deleteImage: (assetId, imageId) => apiClient.delete(`/assets/${assetId}/images/${imageId}`),
  getQrUrl: (id) => `/api/v1/assets/${id}/qr`,
}
