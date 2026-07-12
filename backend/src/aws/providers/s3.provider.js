import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { awsConfig } from '../config/aws.config.js'

const s3Client = awsConfig.useLocal ? null : new S3Client({ region: awsConfig.region })

export const uploadFile = async (buffer, key, contentType) => {
  if (awsConfig.useLocal) {
    console.log(`[LOCAL AWS MOCK] S3 Upload: ${key} (${contentType})`)
    return `http://localhost/mock-s3/${key}`
  }
  const command = new PutObjectCommand({
    Bucket: awsConfig.s3BucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })
  await s3Client.send(command)
  return `https://${awsConfig.s3BucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`
}

export const generatePresignedUrl = async (key) => {
  if (awsConfig.useLocal) {
    console.log(`[LOCAL AWS MOCK] S3 Presigned URL: ${key}`)
    return `http://localhost/mock-s3-presigned/${key}`
  }
  const command = new GetObjectCommand({
    Bucket: awsConfig.s3BucketName,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn: 900 })
}
