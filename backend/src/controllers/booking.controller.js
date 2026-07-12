import { asyncHandler } from '../utils/async-handler.js'
import { bookingService } from '../services/booking.service.js'

export const bookingController = {
  create: asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.body, req.auth.userId)
    res.status(201).json(booking)
  }),

  getById: asyncHandler(async (req, res) => {
    const booking = await bookingService.getById(req.params.bookingId)
    res.json(booking)
  }),

  list: asyncHandler(async (req, res) => {
    const result = await bookingService.listBookings(req.query, {
      id: req.auth.userId,
      roles: req.auth.roles
    })
    res.json(result)
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const booking = await bookingService.updateStatus({
      bookingId: req.params.bookingId,
      newStatus: req.body.status,
      userId: req.auth.userId,
      userRoles: req.auth.roles
    })
    res.json(booking)
  })
}
