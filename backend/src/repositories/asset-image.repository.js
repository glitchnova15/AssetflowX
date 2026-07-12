import { prisma } from '../config/prisma.js'

export const assetImageRepository = {
  create(data) {
    return prisma.assetDocument.create({ data })
  },

  findById(id) {
    return prisma.assetDocument.findFirst({ where: { id, documentType: 'PHOTO' } })
  },

  findByAssetId(assetId) {
    return prisma.assetDocument.findMany({ where: { assetId, documentType: 'PHOTO' }, orderBy: { createdAt: 'desc' } })
  },

  delete(id) {
    return prisma.assetDocument.delete({ where: { id } })
  },
}
