import { Router } from 'express'
import { aiController } from '../controllers/ai.controller.js'
import { authenticate } from '../../middleware/authenticate.js'

export const aiRouter = Router()

aiRouter.use(authenticate)

aiRouter.post('/chat', aiController.chat)
aiRouter.post('/summarize', aiController.summarize)
aiRouter.post('/search', aiController.search)
aiRouter.post('/recommend', aiController.recommend)
