import { assetCategoryRepository } from '../../../repositories/asset-category.repository.js'

export const categoryContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    const [categories, count] = await assetCategoryRepository.findPage({ where: {}, skip: 0, take: Number(limit) })

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
