import { sendEmail } from '../providers/ses.provider.js'

export const emailService = {
  sendBookingStatus: async (toEmail, status, bookingId) => {
    const subject = `Booking Status Update: ${status}`
    const body = `Your booking with ID ${bookingId} is now ${status}.`
    return sendEmail(toEmail, subject, body)
  }
}
