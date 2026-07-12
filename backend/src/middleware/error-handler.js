import { ZodError } from 'zod'
import { loggerService } from '../aws/services/logger.service.js'

export const errorHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: error.flatten() } })
  }

  const statusCode = error.statusCode ?? 500
  const code = error.code ?? 'INTERNAL_ERROR'
  const message = statusCode >= 500 ? 'Internal server error' : error.message

  loggerService.error(error.message || 'Error occurred', { statusCode, code, stack: error.stack })

  return response.status(statusCode).json({ error: { code, message } })
}
