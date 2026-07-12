import { assetService } from '../../../services/asset.service.js'

export const assetContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let query = {
      page: 1,
      pageSize: Number(limit),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    
    console.log(`[Asset Context] Calling assetService.list with query:`, query)
    const { data: assets } = await assetService.list(query)

    if (assets.length === 0) return 'No assets found.'

    let context = 'Assets:\n'
    assets.forEach(asset => {
      context += `- ID: ${asset.assetTag}\n`
      context += `  Name: ${asset.name}\n`
      context += `  Status: ${asset.lifecycleStatus}\n`
      context += `  Condition: ${asset.condition}\n`
      context += `  Department: ${asset.department?.name || 'N/A'}\n`
      if (asset.assignedTo) {
        context += `  Assigned To: ${asset.assignedTo.firstName} ${asset.assignedTo.lastName}\n`
      }
    })
    
    return context
  }
}
