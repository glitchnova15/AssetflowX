export const awsConfig = {
  region: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME,
  sesEmailSource: process.env.SES_FROM_EMAIL,
  cloudWatchLogGroup: process.env.AWS_CLOUDWATCH_LOG_GROUP || 'AssetFlowX-Logs',
  useLocal: process.env.AWS_USE_LOCAL === 'true',
}

if (!awsConfig.useLocal) {
  const requiredEnvVars = [
    'AWS_REGION',
    'S3_BUCKET_NAME',
    'SES_FROM_EMAIL',
  ]
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required AWS environment variable: ${envVar}`)
    }
  }
}
