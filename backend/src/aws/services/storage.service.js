import { v4 as uuidv4 } from 'uuid'
import { uploadFile } from '../providers/s3.provider.js'
import { AppError } from '../../utils/app-error.js'

export const storageService = {
  uploadAssetImage: async (fileBuffer, originalName, mimeType) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(mimeType)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400, 'INVALID_FILE_TYPE')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (fileBuffer.length > maxSize) {
      throw new AppError('File size exceeds the 5MB limit.', 400, 'FILE_TOO_LARGE')
    }

    const extension = originalName.split('.').pop() || 'bin'
    const key = `assets/${uuidv4()}.${extension}`

    return uploadFile(fileBuffer, key, mimeType)
  }
}
