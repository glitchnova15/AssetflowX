import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/app-error.js'

const authUserInclude = { roles: { include: { role: true } } }

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email }, include: authUserInclude })
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, include: authUserInclude })
  },

  async createEmployeeUser({ email, displayName, passwordHash }) {
    return prisma.$transaction(async (transaction) => {
      const employeeRole = await transaction.role.findUnique({ where: { code: 'EMPLOYEE' } })
      if (!employeeRole) throw new AppError('Default EMPLOYEE role is not configured', 500, 'ROLE_CONFIGURATION_ERROR')

      return transaction.user.create({
        data: {
          email,
          displayName,
          passwordHash,
          roles: { create: { roleId: employeeRole.id } },
        },
        include: authUserInclude,
      })
    })
  },
}
