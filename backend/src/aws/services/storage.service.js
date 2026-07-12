import { v4 as uuidv4 } from 'uuid'
import { uploadFile } from '../providers/s3.provider.js'
import { AppError } from '../../utils/app-error.js'

export const storageService = {
  uploadAssetImage: async (fileBuffer, originalName, mimeType) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(mimeType)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400, 'INVALID_FILE_TYPE')
    }

    // Magic number validation to ensure the file isn't spoofed
    const hex = fileBuffer.toString('hex', 0, 4)
    const isValidMagicNumber = 
      hex.startsWith('ffd8') || // JPEG
      hex.startsWith('89504e47') || // PNG
      hex.startsWith('52494646') // WebP (RIFF)

    if (!isValidMagicNumber) {
      throw new AppError('Invalid file signature. File may be corrupted or spoofed.', 400, 'INVALID_FILE_SIGNATURE')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (fileBuffer.length > maxSize) {
      throw new AppError('File size exceeds the 5MB limit.', 400, 'FILE_TOO_LARGE')
    }

    const extension = originalName.split('.').pop() || 'bin'
    const timestamp = Date.now()
    const key = `assets/${uuidv4()}-${timestamp}.${extension}`

    return uploadFile(fileBuffer, key, mimeType)
  }
}
