import { AppError } from '../utils/app-error.js'
import { assetCategoryRepository } from '../repositories/asset-category.repository.js'

const pagination = ({ page, pageSize }, total) => ({ page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
const cleanData = (data) => Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))

async function assertValidParent(categoryId, parentId) {
  if (!parentId) return
  if (categoryId && categoryId === parentId) throw new AppError('A category cannot be its own parent', 400, 'CATEGORY_CYCLE')

  const visited = new Set(categoryId ? [categoryId] : [])
  let currentId = parentId
  while (currentId) {
    if (visited.has(currentId)) throw new AppError('Category parent would create a cycle', 400, 'CATEGORY_CYCLE')
    visited.add(currentId)
    const category = await assetCategoryRepository.findParentId(currentId)
    if (!category) throw new AppError('Parent category not found', 404, 'CATEGORY_NOT_FOUND')
    currentId = category.parentId
  }
}

export const assetCategoryService = {
  async create(data) {
    await assertValidParent(null, data.parentId)
    return assetCategoryRepository.create(cleanData(data))
  },

  async getById(id) {
    const category = await assetCategoryRepository.findById(id)
    if (!category) throw new AppError('Asset category not found', 404, 'CATEGORY_NOT_FOUND')
    return category
  },

  async list(query) {
    const { page, pageSize, sortBy, sortOrder, search, parentId } = query
    const where = {
      ...(parentId && { parentId }),
      ...(search && { OR: [{ code: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] }),
    }
    const [data, total] = await assetCategoryRepository.findPage({ where, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * pageSize, take: pageSize })
    return { data, pagination: pagination({ page, pageSize }, total) }
  },

  async update(id, data) {
    await this.getById(id)
    if (Object.hasOwn(data, 'parentId')) await assertValidParent(id, data.parentId)
    return assetCategoryRepository.update(id, cleanData(data))
  },

  async remove(id) {
    const category = await this.getById(id)
    if (category._count.assets || category._count.children) {
      throw new AppError('Categories with assets or child categories cannot be deleted', 409, 'CATEGORY_IN_USE')
    }
    return assetCategoryRepository.delete(id)
  },
}
