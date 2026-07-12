import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller.js'
import { authenticate } from '../middleware/authenticate.js'

export const analyticsRouter = Router()

analyticsRouter.get('/dashboard', authenticate, analyticsController.getDashboard)
