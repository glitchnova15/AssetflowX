import { prisma } from '../config/prisma.js'

export const refreshTokenRepository = {
  create(data) {
    return prisma.refreshToken.create({ data })
  },

  findByHash(tokenHash) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } })
  },

  revokeByHash(tokenHash) {
    return prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } })
  },

  revokeFamily(familyId) {
    return prisma.refreshToken.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: new Date() } })
  },
}
