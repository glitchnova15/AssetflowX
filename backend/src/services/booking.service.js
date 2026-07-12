import { AppError } from '../utils/app-error.js'
import { bookingRepository } from '../repositories/booking.repository.js'
import { ROLES } from '../constants/roles.js'

export const bookingService = {
  createBooking: async (data, userId) => {
    const startsAt = new Date(data.startsAt)
    const endsAt = new Date(data.endsAt)
    const now = new Date()

    if (startsAt >= endsAt) {
      throw new AppError('Starts at must be before ends at', 400, 'INVALID_DATES')
    }

    if (startsAt < now) {
      throw new AppError('Cannot create bookings in the past', 400, 'PAST_DATE_NOT_ALLOWED')
    }

    if (data.assetId) {
      const overlapping = await bookingRepository.findOverlapping({
        assetId: data.assetId,
        startsAt,
        endsAt
      })
      if (overlapping.length > 0) {
        throw new AppError('Asset is already booked for this period', 409, 'ASSET_ALREADY_BOOKED')
      }
    }

    return bookingRepository.create({
      ...data,
      requestedById: userId,
      startsAt,
      endsAt
    })
  },

  getById: async (id) => {
    const booking = await bookingRepository.findById(id)
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND')
    }
    return booking
  },

  listBookings: async (filters, user) => {
    const hasManagerRoles = user.roles.includes(ROLES.ADMIN) || user.roles.includes(ROLES.ASSET_MANAGER)
    
    if (!hasManagerRoles) {
      filters.userId = user.id
    }

    const page = parseInt(filters.page, 10) || 1
    const pageSize = parseInt(filters.pageSize, 10) || 10

    const { data, total } = await bookingRepository.findAll({
      ...filters,
      page,
      pageSize
    })

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  },

  updateStatus: async ({ bookingId, newStatus, userId, userRoles }) => {
    const booking = await bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND')
    }

    const hasManagerRoles = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.ASSET_MANAGER)

    if (!hasManagerRoles) {
      if (booking.requestedById !== userId) {
        throw new AppError('You do not have permission to modify this booking', 403, 'FORBIDDEN')
      }
      if (newStatus !== 'CANCELLED' || booking.status !== 'PENDING') {
        throw new AppError('You can only cancel your own pending bookings', 400, 'INVALID_STATUS_TRANSITION')
      }
    }

    return bookingRepository.updateStatus(bookingId, newStatus)
  }
}
