import { apiClient } from './client.js'

export const analyticsApi = {
  getDashboardData: () => {
    return apiClient.get('/analytics/dashboard')
  }
}
