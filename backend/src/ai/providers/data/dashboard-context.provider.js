import { analyticsRepository } from '../../../repositories/analytics.repository.js'

export const dashboardContextProvider = {
  async getContext() {
    const kpis = await analyticsRepository.getKPIs()
    
    let context = 'Dashboard Summary:\n'
    context += `- Total Assets: ${kpis.totalAssets}\n`
    context += `- Active Assets: ${kpis.activeAssets}\n`
    context += `- Assets Under Maintenance: ${kpis.assetsUnderMaintenance}\n`
    context += `- Active Bookings: ${kpis.activeBookings}\n`
    context += `- Pending Bookings: ${kpis.pendingBookings}\n`
    context += `- Maintenance Requests: ${kpis.maintenanceRequests}\n`
    
    return context
  }
}
