import { apiClient } from './client.js'

export const aiApi = {
  chat: (messages) => apiClient.post('/ai/chat', { messages }),
  summarize: (text) => apiClient.post('/ai/summarize', { text }),
  search: (query) => apiClient.post('/ai/search', { query }),
  recommend: () => apiClient.post('/ai/recommend'),
}
