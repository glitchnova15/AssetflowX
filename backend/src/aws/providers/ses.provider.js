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

  let retries = 3
  let delay = 1000
  while (retries > 0) {
    try {
      return await sesClient.send(command)
    } catch (err) {
      retries--
      if (retries === 0) throw err
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2
    }
  }
}
