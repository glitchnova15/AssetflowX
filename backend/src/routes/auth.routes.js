import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { validateRequest } from '../middleware/validate-request.js'
import { loginSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator.js'

export const authRouter = Router()

authRouter.post('/register', validateRequest(registerSchema), authController.register)
authRouter.post('/login', validateRequest(loginSchema), authController.login)
authRouter.post('/refresh', validateRequest(refreshTokenSchema), authController.refresh)
authRouter.post('/logout', validateRequest(refreshTokenSchema), authController.logout)
