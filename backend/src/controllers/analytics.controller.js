import { analyticsRepository } from '../repositories/analytics.repository.js'
import { asyncHandler } from '../utils/async-handler.js'

export const analyticsController = {
  getDashboard: asyncHandler(async (request, response) => {
    const data = await analyticsRepository.getDashboardData()
    response.status(200).json(data)
  })
}
