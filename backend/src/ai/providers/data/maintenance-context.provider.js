import { maintenanceRepository } from '../../../repositories/maintenance.repository.js'

export const maintenanceContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let filters = { page: 1, pageSize: Number(limit) }
    
    const isAdminOrManager = user.roles && (user.roles.includes('ADMIN') || user.roles.includes('ASSET_MANAGER'))
    if (!isAdminOrManager) {
      filters.reportedById = user.id
    }

    const { data: records } = await maintenanceRepository.findAll(filters)

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
