import { Router } from 'express'
import { assetController } from '../controllers/asset.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorize-roles.js'
import { validateRequest } from '../middleware/validate-request.js'
import { uploadAssetImage } from '../middleware/upload-asset-image.js'
import { ASSET_WRITE_ROLES } from '../constants/roles.js'
import {
  createAssetSchema,
  updateAssetSchema,
  assetIdSchema,
  assetListSchema,
  updateAssetStatusSchema,
  assetImageIdSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categoryListSchema,
} from '../validators/asset.validator.js'

/* ───── Asset Router ───── */

export const assetRouter = Router()

assetRouter.post('/', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(createAssetSchema), assetController.create)
assetRouter.get('/', authenticate, validateRequest(assetListSchema), assetController.list)
assetRouter.get('/:assetId', authenticate, validateRequest(assetIdSchema), assetController.getById)
assetRouter.patch('/:assetId', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(updateAssetSchema), assetController.update)
assetRouter.delete('/:assetId', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(assetIdSchema), assetController.remove)
assetRouter.patch('/:assetId/status', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(updateAssetStatusSchema), assetController.changeStatus)
assetRouter.get('/:assetId/images', authenticate, validateRequest(assetIdSchema), assetController.listImages)
assetRouter.post('/:assetId/images', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(assetIdSchema), uploadAssetImage, assetController.uploadImage)
assetRouter.delete('/:assetId/images/:imageId', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(assetImageIdSchema), assetController.deleteImage)
assetRouter.get('/:assetId/qr', authenticate, validateRequest(assetIdSchema), assetController.generateQr)

/* ───── Asset Category Router ───── */

export const assetCategoryRouter = Router()

assetCategoryRouter.post('/', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(createCategorySchema), assetController.createCategory)
assetCategoryRouter.get('/', authenticate, validateRequest(categoryListSchema), assetController.listCategories)
assetCategoryRouter.get('/:categoryId', authenticate, validateRequest(categoryIdSchema), assetController.getCategoryById)
assetCategoryRouter.patch('/:categoryId', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(updateCategorySchema), assetController.updateCategory)
assetCategoryRouter.delete('/:categoryId', authenticate, authorizeRoles(...ASSET_WRITE_ROLES), validateRequest(categoryIdSchema), assetController.removeCategory)
