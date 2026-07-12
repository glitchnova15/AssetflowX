import { apiClient } from './client.js'

export const storageApi = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
