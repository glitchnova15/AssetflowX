import { prisma } from '../config/prisma.js'

const assetInclude = {
  category: true,
  department: true,
  custodian: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
  documents: { where: { documentType: 'PHOTO' }, orderBy: { createdAt: 'desc' } },
}

export const assetRepository = {
  create({ data, createdById }) {
    return prisma.$transaction(async (transaction) => {
      const asset = await transaction.asset.create({ data, include: assetInclude })
      await transaction.assetStatusHistory.create({
        data: { assetId: asset.id, previousStatus: null, newStatus: asset.lifecycleStatus, reason: 'Asset created', changedById: createdById },
      })
      return asset
    })
  },

  findById(id) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        ...assetInclude,
        statusHistory: { orderBy: { changedAt: 'desc' }, take: 100, include: { changedBy: { select: { id: true, email: true, displayName: true } } } },
      },
    })
  },

  findPage({ where, orderBy, skip, take }) {
    return prisma.$transaction([
      prisma.asset.findMany({ where, orderBy, skip, take, include: assetInclude }),
      prisma.asset.count({ where }),
    ])
  },

  update(id, data) {
    return prisma.asset.update({ where: { id }, data, include: assetInclude })
  },

  delete(id) {
    return prisma.asset.delete({ where: { id } })
  },

  changeStatus({ assetId, lifecycleStatus, reason, changedById }) {
    return prisma.$transaction(async (transaction) => {
      const asset = await transaction.asset.findUnique({ where: { id: assetId } })
      if (!asset) return null

      const updatedAsset = await transaction.asset.update({
        where: { id: assetId },
        data: { lifecycleStatus },
        include: assetInclude,
      })
      await transaction.assetStatusHistory.create({
        data: { assetId, previousStatus: asset.lifecycleStatus, newStatus: lifecycleStatus, reason, changedById },
      })
      return updatedAsset
    })
  },
}
