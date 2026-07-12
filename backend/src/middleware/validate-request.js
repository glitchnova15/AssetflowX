import { AppError } from '../utils/app-error.js'

export const validateRequest = (schema) => (request, _response, next) => {
  const result = schema.safeParse({ body: request.body, params: request.params, query: request.query })
  if (!result.success) return next(new AppError('Request validation failed', 400, 'VALIDATION_ERROR'))

  if (result.data.body) request.body = result.data.body
  if (result.data.params) request.params = result.data.params
  if (result.data.query) request.query = result.data.query
  return next()
}
