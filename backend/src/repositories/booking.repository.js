import { prisma } from '../config/prisma.js'

const bookingInclude = {
  asset: true,
  assetCategory: true,
  requestedBy: true
}

export const bookingRepository = {
  create: async (data) => {
    return prisma.resourceBooking.create({ data, include: bookingInclude })
  },

  findById: async (id) => {
    return prisma.resourceBooking.findUnique({
      where: { id },
      include: bookingInclude
    })
  },

  findAll: async ({ userId, status, assetId, assetCategoryId, page = 1, pageSize = 10 }) => {
    const where = {}
    if (userId) where.requestedById = userId
    if (status) where.status = status
    if (assetId) where.assetId = assetId
    if (assetCategoryId) where.assetCategoryId = assetCategoryId

    const skip = (page - 1) * pageSize
    const take = pageSize

    const [data, total] = await prisma.$transaction([
      prisma.resourceBooking.findMany({
        where,
        skip,
        take,
        include: bookingInclude,
        orderBy: { startsAt: 'desc' }
      }),
      prisma.resourceBooking.count({ where })
    ])

    return { data, total }
  },

  updateStatus: async (id, status) => {
    return prisma.resourceBooking.update({
      where: { id },
      data: { status },
      include: bookingInclude
    })
  },

  findOverlapping: async ({ assetId, startsAt, endsAt, excludeBookingId }) => {
    const where = {
      assetId,
      status: { in: ['APPROVED', 'CHECKED_OUT'] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt }
    }

    if (excludeBookingId) {
      where.id = { not: excludeBookingId }
    }

    return prisma.resourceBooking.findMany({ where })
  }
}
