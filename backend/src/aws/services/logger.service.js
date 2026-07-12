import { logEvent } from '../providers/cloudwatch.provider.js'
import { awsConfig } from '../config/aws.config.js'

export const loggerService = {
  info: (message, meta = {}) => {
    if (awsConfig.useLocal) {
      console.log(`[INFO] ${message}`, meta)
    } else {
      logEvent(awsConfig.cloudWatchLogGroup, 'info', JSON.stringify({ message, meta })).catch(err => {
        console.error('Failed to send log to CloudWatch:', err)
      })
    }
  },
  error: (message, meta = {}) => {
    if (awsConfig.useLocal) {
      console.error(`[ERROR] ${message}`, meta)
    } else {
      logEvent(awsConfig.cloudWatchLogGroup, 'error', JSON.stringify({ message, meta })).catch(err => {
        console.error('Failed to send error log to CloudWatch:', err)
      })
    }
  }
}
