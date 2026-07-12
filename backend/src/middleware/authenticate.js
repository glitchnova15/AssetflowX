import { userRepository } from '../repositories/user.repository.js'
import { AppError } from '../utils/app-error.js'
import { verifyAccessToken } from '../utils/token.js'
import { asyncHandler } from '../utils/async-handler.js'

export const authenticate = asyncHandler(async (request, _response, next) => {
  const [scheme, token] = request.get('authorization')?.split(' ') ?? []
  if (scheme !== 'Bearer' || !token) throw new AppError('Authentication is required', 401, 'AUTHENTICATION_REQUIRED')

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new AppError('Invalid or expired access token', 401, 'INVALID_ACCESS_TOKEN')
  }

  const user = await userRepository.findById(payload.sub)
  if (!user || user.status !== 'ACTIVE') throw new AppError('Account is unavailable', 401, 'ACCOUNT_UNAVAILABLE')

  request.auth = { userId: user.id, roles: user.roles.map(({ role }) => role.code) }
  next()
})
