import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
  })
})

export const updateMaintenanceSchema = z.object({
  body: z.object({
    status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().optional(),
    actualCost: z.number().nonnegative().optional(),
    vendorName: z.string().max(160).optional(),
    assigneeId: z.string().uuid().optional()
  }),
  params: z.object({
    maintenanceId: z.string().uuid()
  })
})

export const maintenanceIdSchema = z.object({
  params: z.object({
    maintenanceId: z.string().uuid()
  })
})

export const maintenanceListSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional(),
    assetId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    userId: z.string().uuid().optional()
  })
})
