import { maintenanceRepository } from '../repositories/maintenance.repository.js'
import { emailService } from '../aws/services/email.service.js'
import { AppError } from '../utils/app-error.js'

export const maintenanceService = {
  async createMaintenanceRequest(data, userId) {
    data.requestedById = userId
    data.status = 'OPEN'
    return maintenanceRepository.createRequest(data, data.description)
  },

  async getById(id) {
    const request = await maintenanceRepository.findById(id)
    if (!request) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND')
    }
    return request
  },

  async listMaintenanceRequests(filters, user) {
    const hasElevatedRole = user.roles && (user.roles.includes('ADMIN') || user.roles.includes('ASSET_MANAGER'))
    if (!hasElevatedRole) {
      filters.userId = user.id
    }
    return maintenanceRepository.findAll(filters)
  },

  async updateMaintenanceStatus({ requestId, newStatus, userId, userRoles, notes, actualCost, vendorName, assigneeId }) {
    const request = await maintenanceRepository.findById(requestId)
    if (!request) {
      throw new AppError('Maintenance request not found', 404, 'MAINTENANCE_NOT_FOUND')
    }

    const hasElevatedRole = userRoles && (userRoles.includes('ADMIN') || userRoles.includes('ASSET_MANAGER'))
    const isOwner = request.requestedById === userId
    const isAssignee = request.assigneeId === userId

    if (!hasElevatedRole && !isOwner && !isAssignee) {
      throw new AppError('You do not have permission to modify this maintenance request', 403, 'FORBIDDEN')
    }

    const updateData = {}
    if (newStatus) {
      updateData.status = newStatus
      if (newStatus === 'COMPLETED') updateData.completedAt = new Date()
    }
    if (actualCost !== undefined) updateData.actualCost = actualCost
    if (vendorName !== undefined) updateData.vendorName = vendorName
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId

    if (Object.keys(updateData).length > 0) {
      await maintenanceRepository.updateRequest(requestId, updateData)
    }

    const statusForHistory = newStatus || request.status
    if (newStatus !== request.status || notes) {
      await maintenanceRepository.addHistory(requestId, statusForHistory, userId, notes || null)
    }

    const updatedRequest = await maintenanceRepository.findById(requestId)

    if (newStatus && newStatus !== request.status) {
      await emailService.sendMaintenanceStatus(newStatus, requestId, request.title)
    }

    return updatedRequest
  }
}
