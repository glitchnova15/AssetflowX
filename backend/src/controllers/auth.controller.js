import { authService } from '../services/auth.service.js'
import { asyncHandler } from '../utils/async-handler.js'

export const authController = {
  register: asyncHandler(async (request, response) => {
    const tokens = await authService.register(request.body)
    response.status(201).json(tokens)
  }),

  login: asyncHandler(async (request, response) => {
    const tokens = await authService.login(request.body)
    response.status(200).json(tokens)
  }),

  refresh: asyncHandler(async (request, response) => {
    const tokens = await authService.refresh(request.body.refreshToken)
    response.status(200).json(tokens)
  }),

  logout: asyncHandler(async (request, response) => {
    await authService.logout(request.body.refreshToken)
    response.status(204).send()
  }),
}
