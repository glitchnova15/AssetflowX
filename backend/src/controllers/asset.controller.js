import { assetService } from '../services/asset.service.js'
import { assetCategoryService } from '../services/asset-category.service.js'
import { assetImageService } from '../services/asset-image.service.js'
import { assetQrService } from '../services/asset-qr.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'

export const assetController = {
  /* ───── Asset CRUD ───── */

  create: asyncHandler(async (request, response) => {
    const asset = await assetService.create(request.body, request.auth.userId)
    response.status(201).json(asset)
  }),

  getById: asyncHandler(async (request, response) => {
    const asset = await assetService.getById(request.params.assetId)
    response.status(200).json(asset)
  }),

  list: asyncHandler(async (request, response) => {
    const assets = await assetService.list(request.query)
    response.status(200).json(assets)
  }),

  update: asyncHandler(async (request, response) => {
    const asset = await assetService.update(request.params.assetId, request.body)
    response.status(200).json(asset)
  }),

  remove: asyncHandler(async (request, response) => {
    await assetService.remove(request.params.assetId)
    response.status(204).send()
  }),

  changeStatus: asyncHandler(async (request, response) => {
    const asset = await assetService.changeStatus({
      assetId: request.params.assetId,
      ...request.body,
      userId: request.auth.userId,
    })
    response.status(200).json(asset)
  }),

  /* ───── Asset Images ───── */

  listImages: asyncHandler(async (request, response) => {
    const images = await assetImageService.list(request.params.assetId)
    response.status(200).json(images)
  }),

  uploadImage: asyncHandler(async (request, response) => {
    if (!request.file) throw new AppError('Image file is required', 400, 'IMAGE_REQUIRED')

    const image = await assetImageService.create({
      assetId: request.params.assetId,
      file: request.file,
      uploadedById: request.auth.userId,
    })
    response.status(201).json(image)
  }),

  deleteImage: asyncHandler(async (request, response) => {
    await assetImageService.remove({
      assetId: request.params.assetId,
      imageId: request.params.imageId,
    })
    response.status(204).send()
  }),

  /* ───── Asset QR ───── */

  generateQr: asyncHandler(async (request, response) => {
    const buffer = await assetQrService.generate(request.params.assetId)
    response.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="qr.png"',
    })
    response.send(buffer)
  }),

  /* ───── Category CRUD ───── */

  createCategory: asyncHandler(async (request, response) => {
    const category = await assetCategoryService.create(request.body)
    response.status(201).json(category)
  }),

  getCategoryById: asyncHandler(async (request, response) => {
    const category = await assetCategoryService.getById(request.params.categoryId)
    response.status(200).json(category)
  }),

  listCategories: asyncHandler(async (request, response) => {
    const categories = await assetCategoryService.list(request.query)
    response.status(200).json(categories)
  }),

  updateCategory: asyncHandler(async (request, response) => {
    const category = await assetCategoryService.update(request.params.categoryId, request.body)
    response.status(200).json(category)
  }),

  removeCategory: asyncHandler(async (request, response) => {
    await assetCategoryService.remove(request.params.categoryId)
    response.status(204).send()
  }),
}
