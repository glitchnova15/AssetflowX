import { asyncHandler } from '../utils/async-handler.js'
import { storageService } from '../aws/services/storage.service.js'
import { AppError } from '../utils/app-error.js'

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file provided', 400, 'MISSING_FILE')
  }

  const { buffer, originalname, mimetype } = req.file
  const result = await storageService.uploadAssetImage(buffer, originalname, mimetype)

  res.status(200).json({ url: result })
})
