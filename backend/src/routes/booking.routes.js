import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validate-request.js'
import { bookingController } from '../controllers/booking.controller.js'
import {
  createBookingSchema,
  updateBookingStatusSchema,
  bookingIdSchema,
  bookingListSchema
} from '../validators/booking.validator.js'

export const bookingRouter = Router()

bookingRouter.use(authenticate)

bookingRouter.post('/', validateRequest(createBookingSchema), bookingController.create)
bookingRouter.get('/', validateRequest(bookingListSchema), bookingController.list)
bookingRouter.get('/:bookingId', validateRequest(bookingIdSchema), bookingController.getById)
bookingRouter.patch('/:bookingId/status', validateRequest(updateBookingStatusSchema), bookingController.updateStatus)
