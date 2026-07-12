import express from 'express'
import path from 'node:path'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { authRouter } from './routes/auth.routes.js'
import { assetRouter, assetCategoryRouter } from './routes/asset.routes.js'
import { bookingRouter } from './routes/booking.routes.js'
import { maintenanceRouter } from './routes/maintenance.routes.js'
import { analyticsRouter } from './routes/analytics.routes.js'
import { aiRouter } from './ai/routes/ai.routes.js'
import { uploadRouter } from './routes/upload.routes.js'
import { awsHealthRouter } from './routes/aws-health.routes.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/assets', assetRouter)
app.use('/api/v1/asset-categories', assetCategoryRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/api/v1/maintenance', maintenanceRouter)
app.use('/api/v1/analytics', analyticsRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/upload', uploadRouter)
app.use('/api/v1/aws', awsHealthRouter)
app.use(notFound)
app.use(errorHandler)
