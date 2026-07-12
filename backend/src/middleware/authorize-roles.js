import { AppError } from '../utils/app-error.js'

export const authorizeRoles = (...allowedRoles) => (request, _response, next) => {
  if (!request.auth) return next(new AppError('Authentication is required', 401, 'AUTHENTICATION_REQUIRED'))
  if (!request.auth.roles.some((role) => allowedRoles.includes(role))) {
    return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
  }
  return next()
}
