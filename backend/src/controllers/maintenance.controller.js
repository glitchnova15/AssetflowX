import { asyncHandler } from '../utils/async-handler.js'
import { maintenanceService } from '../services/maintenance.service.js'

export const maintenanceController = {
  create: asyncHandler(async (req, res) => {
    const data = req.body
    const userId = req.auth.id
    const request = await maintenanceService.createMaintenanceRequest(data, userId)
    res.status(201).json(request)
  }),

  getById: asyncHandler(async (req, res) => {
    const request = await maintenanceService.getById(req.params.maintenanceId)
    res.status(200).json(request)
  }),

  list: asyncHandler(async (req, res) => {
    const result = await maintenanceService.listMaintenanceRequests(req.query, req.auth)
    res.status(200).json(result)
  }),

  update: asyncHandler(async (req, res) => {
    const { status, notes, actualCost, vendorName, assigneeId } = req.body
    const updatedRequest = await maintenanceService.updateMaintenanceStatus({
      requestId: req.params.maintenanceId,
      newStatus: status,
      userId: req.auth.id,
      userRoles: req.auth.roles,
      notes,
      actualCost,
      vendorName,
      assigneeId
    })
    res.status(200).json(updatedRequest)
  })
}
