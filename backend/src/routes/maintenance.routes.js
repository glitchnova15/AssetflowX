import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validate-request.js'
import { maintenanceController } from '../controllers/maintenance.controller.js'
import { 
  createMaintenanceSchema, 
  updateMaintenanceSchema, 
  maintenanceIdSchema, 
  maintenanceListSchema 
} from '../validators/maintenance.validator.js'

export const maintenanceRouter = Router()

maintenanceRouter.use(authenticate)

maintenanceRouter.post('/', validateRequest(createMaintenanceSchema), maintenanceController.create)
maintenanceRouter.get('/', validateRequest(maintenanceListSchema), maintenanceController.list)
maintenanceRouter.get('/:maintenanceId', validateRequest(maintenanceIdSchema), maintenanceController.getById)
maintenanceRouter.patch('/:maintenanceId', validateRequest(updateMaintenanceSchema), maintenanceController.update)
