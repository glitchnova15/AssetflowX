import { AppError } from '../utils/app-error.js'
import { assetRepository } from '../repositories/asset.repository.js'

const pagination = ({ page, pageSize }, total) => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
})

const cleanAssetData = (data) => Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))

export const assetService = {
  async create(data, userId) {
    return assetRepository.create({ data: cleanAssetData(data), createdById: userId })
  },

  async getById(id) {
    const asset = await assetRepository.findById(id)
    if (!asset) throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND')
    return asset
  },

  async list(query) {
    const { page, pageSize, sortBy, sortOrder, search, ...filters } = query
    const where = {
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.custodianId && { custodianId: filters.custodianId }),
      ...(filters.lifecycleStatus && { lifecycleStatus: filters.lifecycleStatus }),
      ...(filters.condition && { condition: filters.condition }),
      ...(search && {
        OR: [
          { assetTag: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }
    const [data, total] = await assetRepository.findPage({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    return { data, pagination: pagination({ page, pageSize }, total) }
  },

  async update(id, data) {
    await this.getById(id)
    return assetRepository.update(id, cleanAssetData(data))
  },

  async remove(id) {
    await this.getById(id)
    return assetRepository.delete(id)
  },

  async changeStatus({ assetId, lifecycleStatus, reason, userId }) {
    const asset = await this.getById(assetId)
    if (asset.lifecycleStatus === lifecycleStatus) {
      throw new AppError('Asset already has this lifecycle status', 409, 'ASSET_STATUS_UNCHANGED')
    }
    return assetRepository.changeStatus({ assetId, lifecycleStatus, reason, changedById: userId })
  },
}
