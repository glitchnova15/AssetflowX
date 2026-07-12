import express from 'express'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { authRouter } from './routes/auth.routes.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use('/api/v1/auth', authRouter)
app.use(notFound)
app.use(errorHandler)
