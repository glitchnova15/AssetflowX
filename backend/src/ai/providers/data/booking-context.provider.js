import { bookingService } from '../../../services/booking.service.js'

export const bookingContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let filters = { page: 1, pageSize: Number(limit) }
    
    const { data: bookings } = await bookingService.listBookings(filters, user)

    if (bookings.length === 0) return 'No bookings found.'

    let context = 'Bookings:\n'
    bookings.forEach(booking => {
      context += `- Booking ID: ${booking.id}\n`
      if (booking.asset) context += `  Asset: ${booking.asset.name} (${booking.asset.assetTag})\n`
      if (booking.assetCategory) context += `  Category: ${booking.assetCategory.name}\n`
      context += `  Status: ${booking.status}\n`
      context += `  Starts: ${booking.startsAt}\n`
      context += `  Ends: ${booking.endsAt}\n`
      if (booking.requestedBy) {
        context += `  Requested By: ${booking.requestedBy.firstName} ${booking.requestedBy.lastName}\n`
      }
    })
    
    return context
  }
}
