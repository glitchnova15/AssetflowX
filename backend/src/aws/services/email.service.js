import { sendEmail } from '../providers/ses.provider.js'

const HACKATHON_EMAIL = 'ab6113013@gmail.com'

const logSuccess = (event, recipient, messageId) => {
  console.log('--------------------------------')
  console.log('📧 SES Notification Sent')
  console.log(`Event: ${event}`)
  console.log(`Recipient: ${recipient}`)
  console.log(`MessageId: ${messageId}`)
  console.log('--------------------------------')
}

const logError = (error) => {
  console.log('Email notification failed:')
  console.error(error.message || error)
}

export const emailService = {
  sendBookingStatus: async (status, bookingId, assetName) => {
    try {
      const subject = `Booking Status Update: ${status}`
      const body = `Your booking (ID: ${bookingId}) for ${assetName || 'an asset'} is now ${status}.`
      const response = await sendEmail(HACKATHON_EMAIL, subject, body)
      logSuccess(`Booking ${status}`, HACKATHON_EMAIL, response.MessageId)
    } catch (error) {
      logError(error)
    }
  },

  sendMaintenanceStatus: async (status, requestId, title) => {
    try {
      const subject = `Maintenance Update: ${status}`
      const body = `Maintenance request "${title}" (ID: ${requestId}) is now ${status}.`
      const response = await sendEmail(HACKATHON_EMAIL, subject, body)
      logSuccess(`Maintenance Status Changed`, HACKATHON_EMAIL, response.MessageId)
    } catch (error) {
      logError(error)
    }
  },

  sendAssetAssigned: async (assetName, assetTag) => {
    try {
      const subject = `Asset Assigned: ${assetName}`
      const body = `You have been assigned a new asset: ${assetName} (${assetTag}).`
      const response = await sendEmail(HACKATHON_EMAIL, subject, body)
      logSuccess('Asset Assigned', HACKATHON_EMAIL, response.MessageId)
    } catch (error) {
      logError(error)
    }
  }
}
