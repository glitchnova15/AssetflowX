import { Router } from 'express'
import multer from 'multer'
import { uploadImage } from '../controllers/upload.controller.js'
import { authenticate } from '../middleware/authenticate.js'

export const uploadRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

uploadRouter.post('/image', authenticate, upload.single('image'), uploadImage)
