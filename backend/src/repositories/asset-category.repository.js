import { prisma } from '../config/prisma.js'

const categoryInclude = { parent: { select: { id: true, code: true, name: true } }, _count: { select: { assets: true, children: true } } }

export const assetCategoryRepository = {
  create(data) {
    return prisma.assetCategory.create({ data, include: categoryInclude })
  },

  findById(id) {
    return prisma.assetCategory.findUnique({ where: { id }, include: { ...categoryInclude, children: { orderBy: { name: 'asc' } } } })
  },

  findPage({ where, orderBy, skip, take }) {
    return prisma.$transaction([
      prisma.assetCategory.findMany({ where, orderBy, skip, take, include: categoryInclude }),
      prisma.assetCategory.count({ where }),
    ])
  },

  update(id, data) {
    return prisma.assetCategory.update({ where: { id }, data, include: categoryInclude })
  },

  delete(id) {
    return prisma.assetCategory.delete({ where: { id } })
  },

  findParentId(id) {
    return prisma.assetCategory.findUnique({ where: { id }, select: { parentId: true } })
  },
}
