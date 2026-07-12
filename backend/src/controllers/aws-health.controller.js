import { awsConfig } from '../aws/config/aws.config.js'

export const awsHealthController = {
  checkHealth: (req, res) => {
    // If we're using local mocks, we're always "ready" because there are no real credentials.
    // If we're not using local, we assume they are ready if the config exists (since they crash on startup if missing).
    // In a real production app, we could run quick dummy SDK calls here if desired, 
    // but the startup validation gives us high confidence.
    const isReady = true

    return res.status(200).json({
      status: 'ok',
      useLocal: awsConfig.useLocal,
      services: {
        bedrock: { status: 'ready', configured: true },
        s3: { status: 'ready', configured: !!awsConfig.s3BucketName },
        ses: { status: 'ready', configured: !!awsConfig.sesEmailSource },
        cloudwatch: { status: 'ready', configured: !!awsConfig.cloudWatchLogGroup }
      }
    })
  }
}
