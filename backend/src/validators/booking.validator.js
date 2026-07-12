import { z } from 'zod'

export const createBookingSchema = z.object({
  body: z.object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    assetId: z.string().uuid().optional(),
    assetCategoryId: z.string().uuid().optional(),
    purpose: z.string().max(500).optional(),
    notes: z.string().optional()
  }).refine(data => data.assetId || data.assetCategoryId, {
    message: 'Must provide either assetId or assetCategoryId',
    path: ['assetId']
  })
})

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'COMPLETED'])
  }),
  params: z.object({
    bookingId: z.string().uuid()
  })
})

export const bookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().uuid()
  })
})

export const bookingListSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'COMPLETED']).optional(),
    assetId: z.string().uuid().optional(),
    assetCategoryId: z.string().uuid().optional(),
    userId: z.string().uuid().optional()
  })
})
