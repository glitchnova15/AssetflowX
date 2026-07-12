import { maintenanceService } from '../../../services/maintenance.service.js'

export const maintenanceContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let filters = { page: 1, pageSize: Number(limit) }
    
    const { data: records } = await maintenanceService.listMaintenanceRequests(filters, user)

    if (records.length === 0) return 'No maintenance records found.'

    let context = 'Maintenance Requests:\n'
    records.forEach(record => {
      context += `- ID: ${record.id}\n`
      context += `  Title: ${record.title}\n`
      context += `  Status: ${record.status}\n`
      context += `  Priority: ${record.priority}\n`
      if (record.asset) context += `  Asset: ${record.asset.name} (${record.asset.assetTag})\n`
      if (record.reportedBy) context += `  Reported By: ${record.reportedBy.firstName} ${record.reportedBy.lastName}\n`
      if (record.assignedTo) context += `  Assigned To: ${record.assignedTo.firstName} ${record.assignedTo.lastName}\n`
    })
    
    return context
  }
}
