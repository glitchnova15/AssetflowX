import { analyticsRepository } from '../../../repositories/analytics.repository.js'

export const dashboardContextProvider = {
  async getContext() {
    const data = await analyticsRepository.getDashboardData()
    const overview = data.overview
    
    let context = 'Dashboard Summary:\n'
    context += `- Total Assets: ${overview.totalAssets}\n`
    context += `- Active Assets: ${overview.activeAssets}\n`
    context += `- Assets Under Maintenance: ${overview.maintenanceAssets}\n`
    context += `- Active Bookings: ${overview.activeBookings}\n`
    context += `- Pending Bookings: ${overview.pendingBookings}\n`
    context += `- Maintenance Requests: ${overview.maintenanceRequests}\n`
    
    return context
  }
}
