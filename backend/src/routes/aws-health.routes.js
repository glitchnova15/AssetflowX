import { Router } from 'express'
import { awsHealthController } from '../controllers/aws-health.controller.js'

export const awsHealthRouter = Router()

awsHealthRouter.get('/health', awsHealthController.checkHealth)
