import { z } from 'zod'

const uuid = z.string().uuid()
const lifecycleStatus = z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'IN_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'])
const assetCondition = z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'])

const nullableUuid = uuid.nullable().optional()
const optionalText = z.string().trim().min(1).max(160).nullable().optional()

const assetFields = {
  assetTag: z.string().trim().min(1).max(100),
  serialNumber: z.string().trim().min(1).max(160).nullable().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  categoryId: uuid,
  departmentId: nullableUuid,
  custodianId: nullableUuid,
  manufacturer: optionalText,
  model: optionalText,
  lifecycleStatus: lifecycleStatus.optional(),
  condition: assetCondition.optional(),
  acquiredAt: z.coerce.date().nullable().optional(),
  purchaseCost: z.coerce.number().nonnegative().nullable().optional(),
  warrantyExpiresAt: z.coerce.date().nullable().optional(),
  retiredAt: z.coerce.date().nullable().optional(),
}

const assetUpdateFields = Object.fromEntries(Object.entries(assetFields).map(([key, value]) => [key, value.optional()]))

export const assetIdSchema = z.object({ params: z.object({ assetId: uuid }).strict() })
export const assetImageIdSchema = z.object({ params: z.object({ assetId: uuid, imageId: uuid }).strict() })
export const createAssetSchema = z.object({ body: z.object(assetFields).strict() })
export const updateAssetSchema = z.object({ params: z.object({ assetId: uuid }).strict(), body: z.object(assetUpdateFields).strict() })
export const updateAssetStatusSchema = z.object({
  params: z.object({ assetId: uuid }).strict(),
  body: z.object({ lifecycleStatus, reason: z.string().trim().min(1).max(1000) }).strict(),
})
export const assetListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(200).optional(),
    categoryId: uuid.optional(),
    departmentId: uuid.optional(),
    custodianId: uuid.optional(),
    lifecycleStatus: lifecycleStatus.optional(),
    condition: assetCondition.optional(),
    sortBy: z.enum(['assetTag', 'name', 'lifecycleStatus', 'acquiredAt', 'warrantyExpiresAt', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }).strict(),
})

const categoryFields = {
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  parentId: nullableUuid,
}
const categoryUpdateFields = Object.fromEntries(Object.entries(categoryFields).map(([key, value]) => [key, value.optional()]))

export const categoryIdSchema = z.object({ params: z.object({ categoryId: uuid }).strict() })
export const createCategorySchema = z.object({ body: z.object(categoryFields).strict() })
export const updateCategorySchema = z.object({ params: z.object({ categoryId: uuid }).strict(), body: z.object(categoryUpdateFields).strict() })
export const categoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(160).optional(),
    parentId: uuid.optional(),
    sortBy: z.enum(['code', 'name', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }).strict(),
})
