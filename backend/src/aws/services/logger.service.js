import { logEvent } from '../providers/cloudwatch.provider.js'
import { v4 as uuidv4 } from 'uuid'
import { awsConfig } from '../config/aws.config.js'

export const loggerService = {
  info: (message, meta = {}) => {
    const requestId = meta.requestId || uuidv4()
    const enrichedMeta = { ...meta, requestId }
    if (awsConfig.useLocal) {
      console.log(`[INFO][${requestId}] ${message}`, enrichedMeta)
    } else {
      try {
        logEvent(awsConfig.cloudWatchLogGroup, 'info', JSON.stringify({ message, meta: enrichedMeta })).catch(err => {
          console.error('Failed to send log to CloudWatch:', err)
        })
      } catch (err) {
        console.error('Failed to serialize or send log to CloudWatch:', err)
      }
    }
  },
  error: (message, meta = {}) => {
    const requestId = meta.requestId || uuidv4()
    const enrichedMeta = { ...meta, requestId }
    if (awsConfig.useLocal) {
      console.error(`[ERROR][${requestId}] ${message}`, enrichedMeta)
    } else {
      try {
        logEvent(awsConfig.cloudWatchLogGroup, 'error', JSON.stringify({ message, meta: enrichedMeta })).catch(err => {
          console.error('Failed to send error log to CloudWatch:', err)
        })
      } catch (err) {
        console.error('Failed to serialize or send error log to CloudWatch:', err)
      }
    }
  }
}
