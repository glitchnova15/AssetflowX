import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { awsConfig } from '../config/aws.config.js'

const sesClient = awsConfig.useLocal ? null : new SESClient({ region: awsConfig.region })

export const sendEmail = async (to, subject, body) => {
  if (awsConfig.useLocal) {
    console.log(`[LOCAL AWS MOCK] SES Email to ${to}, Subject: ${subject}`)
    return { MessageId: 'local-mock-id' }
  }

  const command = new SendEmailCommand({
    Source: awsConfig.sesEmailSource,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    }
  })

  return sesClient.send(command)
}
