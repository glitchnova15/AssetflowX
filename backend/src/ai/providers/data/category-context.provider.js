import { assetCategoryService } from '../../../services/asset-category.service.js'

export const categoryContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    const { data: categories } = await assetCategoryService.list({ page: 1, pageSize: Number(limit), sortBy: 'name', sortOrder: 'asc' })

    if (categories.length === 0) return 'No asset categories found.'

    let context = 'Asset Categories:\n'
    categories.forEach(cat => {
      context += `- ID: ${cat.id}\n`
      context += `  Name: ${cat.name}\n`
      context += `  Description: ${cat.description || 'N/A'}\n`
      context += `  Requires Approval: ${cat.requiresApproval ? 'Yes' : 'No'}\n`
    })
    
    return context
  }
}
