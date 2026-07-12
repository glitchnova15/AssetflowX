import express from 'express'
import path from 'node:path'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { authRouter } from './routes/auth.routes.js'
import { assetRouter, assetCategoryRouter } from './routes/asset.routes.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/assets', assetRouter)
app.use('/api/v1/asset-categories', assetCategoryRouter)
app.use(notFound)
app.use(errorHandler)
