import { prisma } from '../config/prisma.js'

export const maintenanceRepository = {
  async createRequest(data, initialNote) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.create({ data })
      await tx.maintenanceHistory.create({
        data: {
          maintenanceRequestId: request.id,
          status: 'OPEN',
          actorId: data.requestedById,
          notes: initialNote || null,
        }
      })
      return tx.maintenanceRequest.findUnique({
        where: { id: request.id },
        include: { history: true }
      })
    })
  },
  
  async findById(id) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requestedBy: true,
        assignee: true,
        history: { include: { actor: true }, orderBy: { occurredAt: 'desc' } }
      }
    })
  },

  async findAll({ status, priority, assetId, assigneeId, userId, page = 1, pageSize = 10 }) {
    const where = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assetId) where.assetId = assetId
    if (assigneeId) where.assigneeId = assigneeId
    if (userId) where.requestedById = userId
    
    const skip = (page - 1) * pageSize
    
    const [data, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        skip,
        take: pageSize,
        include: { asset: true, requestedBy: true, assignee: true },
        orderBy: { openedAt: 'desc' }
      }),
      prisma.maintenanceRequest.count({ where })
    ])
    
    return { data, total }
  },

  async updateRequest(id, data) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data
    })
  },

  async addHistory(maintenanceRequestId, status, actorId, notes) {
    return prisma.maintenanceHistory.create({
      data: { maintenanceRequestId, status, actorId, notes }
    })
  }
}
