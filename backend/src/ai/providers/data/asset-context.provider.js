import { assetRepository } from '../../../repositories/asset.repository.js'

export const assetContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let where = {}
    
    const isAdminOrManager = user.roles && (user.roles.includes('ADMIN') || user.roles.includes('ASSET_MANAGER'))
    if (!isAdminOrManager) {
      where.assignedToId = user.id
    }

    const [assets, count] = await assetRepository.findPage({ where, skip: 0, take: Number(limit) })

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
