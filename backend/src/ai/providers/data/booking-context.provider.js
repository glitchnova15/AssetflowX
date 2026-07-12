import { bookingRepository } from '../../../repositories/booking.repository.js'

export const bookingContextProvider = {
  async getContext(user, limit = process.env.AI_MAX_CONTEXT_RECORDS || 25) {
    let filters = { page: 1, pageSize: Number(limit) }
    
    const isAdminOrManager = user.roles && (user.roles.includes('ADMIN') || user.roles.includes('ASSET_MANAGER'))
    if (!isAdminOrManager) {
      filters.userId = user.id
    }

    const { data: bookings } = await bookingRepository.findAll(filters)

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
