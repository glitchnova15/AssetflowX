import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ids = Object.freeze({
  adminRole: '00000000-0000-4000-8000-000000000001',
  employeeRole: '00000000-0000-4000-8000-000000000002',
  auditorRole: '00000000-0000-4000-8000-000000000003',
  adminUser: '00000000-0000-4000-8000-000000000011',
  employeeUser: '00000000-0000-4000-8000-000000000012',
  auditorUser: '00000000-0000-4000-8000-000000000013',
  itDepartment: '00000000-0000-4000-8000-000000000021',
  engineeringDepartment: '00000000-0000-4000-8000-000000000022',
  adminEmployee: '00000000-0000-4000-8000-000000000031',
  employeeEmployee: '00000000-0000-4000-8000-000000000032',
  auditorEmployee: '00000000-0000-4000-8000-000000000033',
  computerCategory: '00000000-0000-4000-8000-000000000041',
  laptopCategory: '00000000-0000-4000-8000-000000000042',
  asset: '00000000-0000-4000-8000-000000000051',
  allocation: '00000000-0000-4000-8000-000000000061',
  transfer: '00000000-0000-4000-8000-000000000071',
  booking: '00000000-0000-4000-8000-000000000081',
  maintenanceRequest: '00000000-0000-4000-8000-000000000091',
  maintenanceHistory: '00000000-0000-4000-8000-000000000101',
  auditCycle: '00000000-0000-4000-8000-000000000111',
  auditAssignment: '00000000-0000-4000-8000-000000000121',
  auditResult: '00000000-0000-4000-8000-000000000131',
  notification: '00000000-0000-4000-8000-000000000141',
  activityLog: '00000000-0000-4000-8000-000000000151',
  statusHistory: '00000000-0000-4000-8000-000000000161',
  document: '00000000-0000-4000-8000-000000000171',
  adminRoleLink: '00000000-0000-4000-8000-000000000181',
  employeeRoleLink: '00000000-0000-4000-8000-000000000182',
  auditorRoleLink: '00000000-0000-4000-8000-000000000183',
})

const upsertById = (delegate, record) =>
  delegate.upsert({ where: { id: record.id }, update: record, create: record })

async function main() {
  await upsertById(prisma.role, { id: ids.adminRole, code: 'ADMIN', name: 'Administrator', description: 'System administrator' })
  await upsertById(prisma.role, { id: ids.employeeRole, code: 'EMPLOYEE', name: 'Employee', description: 'Standard employee' })
  await upsertById(prisma.role, { id: ids.auditorRole, code: 'AUDITOR', name: 'Auditor', description: 'Asset audit operator' })

  await upsertById(prisma.user, { id: ids.adminUser, authSubject: 'demo-admin', email: 'admin@assetflow.demo', displayName: 'Avery Admin', status: 'ACTIVE' })
  await upsertById(prisma.user, { id: ids.employeeUser, authSubject: 'demo-employee', email: 'alex@assetflow.demo', displayName: 'Alex Employee', status: 'ACTIVE' })
  await upsertById(prisma.user, { id: ids.auditorUser, authSubject: 'demo-auditor', email: 'aria@assetflow.demo', displayName: 'Aria Auditor', status: 'ACTIVE' })

  await upsertById(prisma.department, { id: ids.itDepartment, code: 'IT', name: 'Information Technology', description: 'Technology operations', parentId: null, managerId: null })
  await upsertById(prisma.department, { id: ids.engineeringDepartment, code: 'ENG', name: 'Engineering', description: 'Product engineering', parentId: null, managerId: null })

  await upsertById(prisma.employee, { id: ids.adminEmployee, userId: ids.adminUser, employeeNumber: 'EMP-001', firstName: 'Avery', lastName: 'Admin', jobTitle: 'IT Manager', departmentId: ids.itDepartment, managerId: null, employmentStatus: 'ACTIVE', startedAt: new Date('2025-01-01') })
  await upsertById(prisma.employee, { id: ids.employeeEmployee, userId: ids.employeeUser, employeeNumber: 'EMP-002', firstName: 'Alex', lastName: 'Employee', jobTitle: 'Software Engineer', departmentId: ids.engineeringDepartment, managerId: null, employmentStatus: 'ACTIVE', startedAt: new Date('2025-02-01') })
  await upsertById(prisma.employee, { id: ids.auditorEmployee, userId: ids.auditorUser, employeeNumber: 'EMP-003', firstName: 'Aria', lastName: 'Auditor', jobTitle: 'Asset Auditor', departmentId: ids.itDepartment, managerId: ids.adminEmployee, employmentStatus: 'ACTIVE', startedAt: new Date('2025-03-01') })
  await prisma.department.update({ where: { id: ids.itDepartment }, data: { managerId: ids.adminEmployee } })

  await upsertById(prisma.userRole, { id: ids.adminRoleLink, userId: ids.adminUser, roleId: ids.adminRole })
  await upsertById(prisma.userRole, { id: ids.employeeRoleLink, userId: ids.employeeUser, roleId: ids.employeeRole })
  await upsertById(prisma.userRole, { id: ids.auditorRoleLink, userId: ids.auditorUser, roleId: ids.auditorRole })

  await upsertById(prisma.assetCategory, { id: ids.computerCategory, code: 'COMPUTER', name: 'Computers', description: 'Computing equipment', parentId: null })
  await upsertById(prisma.assetCategory, { id: ids.laptopCategory, code: 'LAPTOP', name: 'Laptops', description: 'Portable computers', parentId: ids.computerCategory })
  await upsertById(prisma.asset, {
    id: ids.asset, assetTag: 'AF-LT-0001', serialNumber: 'DEMO-LT-0001', name: 'Demo Engineering Laptop', description: 'Seeded laptop for workflow demonstrations',
    categoryId: ids.laptopCategory, departmentId: ids.itDepartment, custodianId: ids.employeeEmployee, manufacturer: 'AssetFlow', model: 'DemoBook 14',
    lifecycleStatus: 'ALLOCATED', condition: 'GOOD', acquiredAt: new Date('2025-01-15'), purchaseCost: '1299.00', warrantyExpiresAt: new Date('2028-01-15'), metadata: { operatingSystem: 'demo' },
  })
  await upsertById(prisma.assetStatusHistory, { id: ids.statusHistory, assetId: ids.asset, previousStatus: 'AVAILABLE', newStatus: 'ALLOCATED', reason: 'Seed allocation', changedById: ids.adminUser })
  await upsertById(prisma.assetDocument, { id: ids.document, assetId: ids.asset, documentType: 'WARRANTY', fileName: 'demo-laptop-warranty.pdf', storageKey: 'demo/assets/AF-LT-0001/warranty.pdf', mimeType: 'application/pdf', sizeBytes: 1024, uploadedById: ids.adminUser })

  await upsertById(prisma.assetAllocation, { id: ids.allocation, assetId: ids.asset, employeeId: ids.employeeEmployee, allocatedById: ids.adminUser, status: 'ACTIVE', allocatedAt: new Date('2026-01-15T09:00:00Z'), expectedReturnAt: new Date('2026-12-31T17:00:00Z'), notes: 'Primary development device' })
  await upsertById(prisma.transferRequest, { id: ids.transfer, assetId: ids.asset, sourceDepartmentId: ids.itDepartment, destinationDepartmentId: ids.engineeringDepartment, requestedById: ids.employeeUser, approvedById: null, status: 'SUBMITTED', reason: 'Permanent engineering assignment', requestedAt: new Date('2026-02-01T09:00:00Z'), approvedAt: null, completedAt: null })
  await upsertById(prisma.resourceBooking, { id: ids.booking, assetId: ids.asset, assetCategoryId: null, requestedById: ids.employeeUser, status: 'APPROVED', startsAt: new Date('2026-07-15T09:00:00Z'), endsAt: new Date('2026-07-15T17:00:00Z'), purpose: 'Demo booking', notes: 'Seed record' })
  await upsertById(prisma.maintenanceRequest, { id: ids.maintenanceRequest, assetId: ids.asset, requestedById: ids.employeeUser, assigneeId: ids.adminEmployee, priority: 'NORMAL', status: 'IN_PROGRESS', title: 'Battery health inspection', description: 'Routine battery inspection', vendorName: 'AssetFlow Services', estimatedCost: '75.00', actualCost: null, openedAt: new Date('2026-06-01T09:00:00Z'), dueAt: new Date('2026-07-20T17:00:00Z'), completedAt: null })
  await upsertById(prisma.maintenanceHistory, { id: ids.maintenanceHistory, maintenanceRequestId: ids.maintenanceRequest, status: 'IN_PROGRESS', notes: 'Inspection scheduled', actorId: ids.adminUser, occurredAt: new Date('2026-06-02T10:00:00Z') })

  await upsertById(prisma.auditCycle, { id: ids.auditCycle, code: 'FY26-Q3', name: 'FY26 Q3 Asset Audit', status: 'SCHEDULED', startsAt: new Date('2026-07-01T00:00:00Z'), endsAt: new Date('2026-07-31T23:59:59Z'), createdById: ids.adminUser })
  await upsertById(prisma.auditAssignment, { id: ids.auditAssignment, auditCycleId: ids.auditCycle, departmentId: ids.itDepartment, auditorId: ids.auditorEmployee, status: 'IN_PROGRESS', dueAt: new Date('2026-07-25T17:00:00Z'), completedAt: null })
  await upsertById(prisma.auditResult, { id: ids.auditResult, auditAssignmentId: ids.auditAssignment, assetId: ids.asset, status: 'FOUND', expectedDepartmentId: ids.itDepartment, observedDepartmentId: ids.itDepartment, observedById: ids.auditorEmployee, observedCondition: 'GOOD', notes: 'Verified during seed audit', verifiedAt: new Date('2026-07-12T11:00:00Z') })

  await upsertById(prisma.notification, { id: ids.notification, userId: ids.employeeUser, type: 'MAINTENANCE', status: 'UNREAD', title: 'Maintenance scheduled', body: 'Your allocated laptop has a scheduled battery inspection.', data: { maintenanceRequestId: ids.maintenanceRequest }, readAt: null })
  await upsertById(prisma.activityLog, { id: ids.activityLog, actorId: ids.adminUser, action: 'ASSET_ALLOCATED', entityType: 'AssetAllocation', entityId: ids.allocation, metadata: { assetId: ids.asset, employeeId: ids.employeeEmployee }, ipAddress: '127.0.0.1', userAgent: 'AssetFlow demo seed', occurredAt: new Date('2026-01-15T09:00:00Z') })
}

main()
  .then(() => console.info('AssetFlow demo data seeded successfully.'))
  .catch((error) => {
    console.error('AssetFlow seed failed.', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
