import fs from 'node:fs/promises'
import path from 'node:path'
import { AppError } from '../utils/app-error.js'
import { assetRepository } from '../repositories/asset.repository.js'
import { assetImageRepository } from '../repositories/asset-image.repository.js'

const uploadRoot = path.resolve(process.cwd(), 'uploads')
const publicStorageKey = (fileName) => path.posix.join('assets', fileName)

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

export const assetImageService = {
  async list(assetId) {
    const asset = await assetRepository.findById(assetId)
    if (!asset) throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND')
    return assetImageRepository.findByAssetId(assetId)
  },

  async create({ assetId, file, uploadedById }) {
    const asset = await assetRepository.findById(assetId)
    if (!asset) {
      await deleteFile(file.path)
      throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND')
    }

    try {
      return await assetImageRepository.create({
        assetId,
        documentType: 'PHOTO',
        fileName: file.originalname,
        storageKey: publicStorageKey(file.filename),
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById,
      })
    } catch (error) {
      await deleteFile(file.path)
      throw error
    }
  },

  async remove({ assetId, imageId }) {
    const image = await assetImageRepository.findById(imageId)
    if (!image || image.assetId !== assetId) throw new AppError('Asset image not found', 404, 'ASSET_IMAGE_NOT_FOUND')
    await assetImageRepository.delete(imageId)
    await deleteFile(path.resolve(uploadRoot, image.storageKey))
  },
}
