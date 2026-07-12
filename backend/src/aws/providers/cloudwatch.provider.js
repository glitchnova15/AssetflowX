import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs'
import { awsConfig } from '../config/aws.config.js'

const cloudwatchClient = awsConfig.useLocal ? null : new CloudWatchLogsClient({ region: awsConfig.region })

export const logEvent = async (logGroupName, logStreamName, message) => {
  if (awsConfig.useLocal) {
    console.log(`[LOCAL AWS MOCK] CloudWatch Log [${logGroupName}/${logStreamName}]: ${message}`)
    return
  }

  const command = new PutLogEventsCommand({
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message,
        timestamp: Date.now(),
      },
    ],
  })
  
  return cloudwatchClient.send(command)
}
