CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED');
CREATE TYPE "AssetLifecycleStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'IN_MAINTENANCE', 'RETIRED', 'LOST', 'DISPOSED');
CREATE TYPE "AssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'WARRANTY', 'MANUAL', 'PHOTO', 'CERTIFICATE', 'OTHER');
CREATE TYPE "AllocationStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED');
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'COMPLETED');
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AuditCycleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AuditAssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "AuditResultStatus" AS ENUM ('FOUND', 'MISSING', 'DAMAGED', 'UNVERIFIED');
CREATE TYPE "NotificationType" AS ENUM ('ALLOCATION', 'TRANSFER', 'BOOKING', 'MAINTENANCE', 'AUDIT', 'SYSTEM');
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

CREATE TABLE "users" (
  "id" UUID NOT NULL, "authSubject" TEXT, "email" VARCHAR(320) NOT NULL, "displayName" VARCHAR(160),
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "roles" (
  "id" UUID NOT NULL, "code" VARCHAR(64) NOT NULL, "name" VARCHAR(100) NOT NULL, "description" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "user_roles" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "roleId" UUID NOT NULL, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "departments" (
  "id" UUID NOT NULL, "code" VARCHAR(32) NOT NULL, "name" VARCHAR(160) NOT NULL, "description" TEXT,
  "parentId" UUID, "managerId" UUID, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "employees" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "employeeNumber" VARCHAR(64) NOT NULL, "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL, "jobTitle" VARCHAR(160), "departmentId" UUID, "managerId" UUID,
  "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE', "startedAt" DATE, "endedAt" DATE,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "asset_categories" (
  "id" UUID NOT NULL, "code" VARCHAR(64) NOT NULL, "name" VARCHAR(160) NOT NULL, "description" TEXT,
  "parentId" UUID, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "assets" (
  "id" UUID NOT NULL, "assetTag" VARCHAR(100) NOT NULL, "serialNumber" VARCHAR(160), "name" VARCHAR(200) NOT NULL,
  "description" TEXT, "categoryId" UUID NOT NULL, "departmentId" UUID, "custodianId" UUID, "manufacturer" VARCHAR(160),
  "model" VARCHAR(160), "lifecycleStatus" "AssetLifecycleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD', "acquiredAt" DATE, "purchaseCost" DECIMAL(14,2),
  "warrantyExpiresAt" DATE, "retiredAt" DATE, "metadata" JSONB, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "asset_status_history" (
  "id" UUID NOT NULL, "assetId" UUID NOT NULL, "previousStatus" "AssetLifecycleStatus", "newStatus" "AssetLifecycleStatus" NOT NULL,
  "reason" TEXT, "changedById" UUID, "changedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "asset_status_history_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "asset_documents" (
  "id" UUID NOT NULL, "assetId" UUID NOT NULL, "documentType" "DocumentType" NOT NULL, "fileName" VARCHAR(255) NOT NULL,
  "storageKey" VARCHAR(1024) NOT NULL, "mimeType" VARCHAR(160), "sizeBytes" INTEGER, "uploadedById" UUID,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "asset_documents_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "asset_allocations" (
  "id" UUID NOT NULL, "assetId" UUID NOT NULL, "employeeId" UUID NOT NULL, "allocatedById" UUID,
  "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE', "allocatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedReturnAt" TIMESTAMPTZ(6), "returnedAt" TIMESTAMPTZ(6), "notes" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "asset_allocations_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "transfer_requests" (
  "id" UUID NOT NULL, "assetId" UUID NOT NULL, "sourceDepartmentId" UUID NOT NULL, "destinationDepartmentId" UUID NOT NULL,
  "requestedById" UUID NOT NULL, "approvedById" UUID, "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT', "reason" TEXT,
  "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "approvedAt" TIMESTAMPTZ(6), "completedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "transfer_requests_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "resource_bookings" (
  "id" UUID NOT NULL, "assetId" UUID, "assetCategoryId" UUID, "requestedById" UUID NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING', "startsAt" TIMESTAMPTZ(6) NOT NULL, "endsAt" TIMESTAMPTZ(6) NOT NULL,
  "purpose" VARCHAR(500), "notes" TEXT, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "resource_bookings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "maintenance_requests" (
  "id" UUID NOT NULL, "assetId" UUID NOT NULL, "requestedById" UUID NOT NULL, "assigneeId" UUID,
  "priority" "MaintenancePriority" NOT NULL DEFAULT 'NORMAL', "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "title" VARCHAR(200) NOT NULL, "description" TEXT, "vendorName" VARCHAR(160), "estimatedCost" DECIMAL(14,2),
  "actualCost" DECIMAL(14,2), "openedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "dueAt" TIMESTAMPTZ(6),
  "completedAt" TIMESTAMPTZ(6), "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "maintenance_history" (
  "id" UUID NOT NULL, "maintenanceRequestId" UUID NOT NULL, "status" "MaintenanceStatus" NOT NULL, "notes" TEXT,
  "actorId" UUID, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "maintenance_history_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_cycles" (
  "id" UUID NOT NULL, "code" VARCHAR(64) NOT NULL, "name" VARCHAR(200) NOT NULL,
  "status" "AuditCycleStatus" NOT NULL DEFAULT 'DRAFT', "startsAt" TIMESTAMPTZ(6) NOT NULL, "endsAt" TIMESTAMPTZ(6) NOT NULL,
  "createdById" UUID, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "audit_cycles_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_assignments" (
  "id" UUID NOT NULL, "auditCycleId" UUID NOT NULL, "departmentId" UUID NOT NULL, "auditorId" UUID NOT NULL,
  "status" "AuditAssignmentStatus" NOT NULL DEFAULT 'PENDING', "dueAt" TIMESTAMPTZ(6), "completedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "audit_assignments_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_results" (
  "id" UUID NOT NULL, "auditAssignmentId" UUID NOT NULL, "assetId" UUID NOT NULL, "status" "AuditResultStatus" NOT NULL,
  "expectedDepartmentId" UUID, "observedDepartmentId" UUID, "observedById" UUID, "observedCondition" "AssetCondition",
  "notes" TEXT, "verifiedAt" TIMESTAMPTZ(6), "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "audit_results_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notifications" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "type" "NotificationType" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD', "title" VARCHAR(200) NOT NULL, "body" TEXT NOT NULL,
  "data" JSONB, "readAt" TIMESTAMPTZ(6), "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "activity_logs" (
  "id" UUID NOT NULL, "actorId" UUID, "action" VARCHAR(100) NOT NULL, "entityType" VARCHAR(100) NOT NULL,
  "entityId" UUID, "metadata" JSONB, "ipAddress" VARCHAR(64), "userAgent" TEXT,
  "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_authSubject_key" ON "users"("authSubject");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");
CREATE INDEX "departments_managerId_idx" ON "departments"("managerId");
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");
CREATE INDEX "employees_managerId_idx" ON "employees"("managerId");
CREATE INDEX "employees_employmentStatus_idx" ON "employees"("employmentStatus");
CREATE UNIQUE INDEX "asset_categories_code_key" ON "asset_categories"("code");
CREATE UNIQUE INDEX "asset_categories_name_key" ON "asset_categories"("name");
CREATE INDEX "asset_categories_parentId_idx" ON "asset_categories"("parentId");
CREATE UNIQUE INDEX "assets_assetTag_key" ON "assets"("assetTag");
CREATE UNIQUE INDEX "assets_serialNumber_key" ON "assets"("serialNumber");
CREATE INDEX "assets_categoryId_idx" ON "assets"("categoryId");
CREATE INDEX "assets_departmentId_idx" ON "assets"("departmentId");
CREATE INDEX "assets_custodianId_idx" ON "assets"("custodianId");
CREATE INDEX "assets_lifecycleStatus_departmentId_idx" ON "assets"("lifecycleStatus", "departmentId");
CREATE INDEX "assets_warrantyExpiresAt_idx" ON "assets"("warrantyExpiresAt");
CREATE INDEX "asset_status_history_assetId_changedAt_idx" ON "asset_status_history"("assetId", "changedAt");
CREATE INDEX "asset_status_history_changedById_idx" ON "asset_status_history"("changedById");
CREATE UNIQUE INDEX "asset_documents_storageKey_key" ON "asset_documents"("storageKey");
CREATE INDEX "asset_documents_assetId_documentType_idx" ON "asset_documents"("assetId", "documentType");
CREATE INDEX "asset_documents_uploadedById_idx" ON "asset_documents"("uploadedById");
CREATE INDEX "asset_allocations_assetId_status_idx" ON "asset_allocations"("assetId", "status");
CREATE INDEX "asset_allocations_employeeId_status_idx" ON "asset_allocations"("employeeId", "status");
CREATE INDEX "asset_allocations_expectedReturnAt_idx" ON "asset_allocations"("expectedReturnAt");
CREATE INDEX "transfer_requests_assetId_status_idx" ON "transfer_requests"("assetId", "status");
CREATE INDEX "transfer_requests_sourceDepartmentId_status_idx" ON "transfer_requests"("sourceDepartmentId", "status");
CREATE INDEX "transfer_requests_destinationDepartmentId_status_idx" ON "transfer_requests"("destinationDepartmentId", "status");
CREATE INDEX "transfer_requests_requestedById_idx" ON "transfer_requests"("requestedById");
CREATE INDEX "resource_bookings_assetId_startsAt_endsAt_idx" ON "resource_bookings"("assetId", "startsAt", "endsAt");
CREATE INDEX "resource_bookings_assetCategoryId_startsAt_endsAt_idx" ON "resource_bookings"("assetCategoryId", "startsAt", "endsAt");
CREATE INDEX "resource_bookings_requestedById_status_idx" ON "resource_bookings"("requestedById", "status");
CREATE INDEX "maintenance_requests_assetId_status_idx" ON "maintenance_requests"("assetId", "status");
CREATE INDEX "maintenance_requests_assigneeId_status_idx" ON "maintenance_requests"("assigneeId", "status");
CREATE INDEX "maintenance_requests_priority_status_idx" ON "maintenance_requests"("priority", "status");
CREATE INDEX "maintenance_requests_dueAt_idx" ON "maintenance_requests"("dueAt");
CREATE INDEX "maintenance_history_maintenanceRequestId_occurredAt_idx" ON "maintenance_history"("maintenanceRequestId", "occurredAt");
CREATE INDEX "maintenance_history_actorId_idx" ON "maintenance_history"("actorId");
CREATE UNIQUE INDEX "audit_cycles_code_key" ON "audit_cycles"("code");
CREATE INDEX "audit_cycles_status_startsAt_idx" ON "audit_cycles"("status", "startsAt");
CREATE INDEX "audit_cycles_createdById_idx" ON "audit_cycles"("createdById");
CREATE UNIQUE INDEX "audit_assignments_auditCycleId_departmentId_key" ON "audit_assignments"("auditCycleId", "departmentId");
CREATE INDEX "audit_assignments_auditorId_status_idx" ON "audit_assignments"("auditorId", "status");
CREATE INDEX "audit_assignments_departmentId_status_idx" ON "audit_assignments"("departmentId", "status");
CREATE UNIQUE INDEX "audit_results_auditAssignmentId_assetId_key" ON "audit_results"("auditAssignmentId", "assetId");
CREATE INDEX "audit_results_assetId_idx" ON "audit_results"("assetId");
CREATE INDEX "audit_results_status_idx" ON "audit_results"("status");
CREATE INDEX "notifications_userId_status_createdAt_idx" ON "notifications"("userId", "status", "createdAt");
CREATE INDEX "activity_logs_actorId_occurredAt_idx" ON "activity_logs"("actorId", "occurredAt");
CREATE INDEX "activity_logs_entityType_entityId_occurredAt_idx" ON "activity_logs"("entityType", "entityId", "occurredAt");
CREATE INDEX "activity_logs_action_occurredAt_idx" ON "activity_logs"("action", "occurredAt");

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "asset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_allocations" ADD CONSTRAINT "asset_allocations_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "asset_allocations" ADD CONSTRAINT "asset_allocations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "asset_allocations" ADD CONSTRAINT "asset_allocations_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_sourceDepartmentId_fkey" FOREIGN KEY ("sourceDepartmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_destinationDepartmentId_fkey" FOREIGN KEY ("destinationDepartmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_assetCategoryId_fkey" FOREIGN KEY ("assetCategoryId") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_cycles" ADD CONSTRAINT "audit_cycles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_assignments" ADD CONSTRAINT "audit_assignments_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "audit_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_assignments" ADD CONSTRAINT "audit_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_assignments" ADD CONSTRAINT "audit_assignments_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_auditAssignmentId_fkey" FOREIGN KEY ("auditAssignmentId") REFERENCES "audit_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_expectedDepartmentId_fkey" FOREIGN KEY ("expectedDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_observedDepartmentId_fkey" FOREIGN KEY ("observedDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_observedById_fkey" FOREIGN KEY ("observedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "employees" ADD CONSTRAINT "employees_dates_check" CHECK ("endedAt" IS NULL OR "startedAt" IS NULL OR "endedAt" >= "startedAt");
ALTER TABLE "assets" ADD CONSTRAINT "assets_purchase_cost_check" CHECK ("purchaseCost" IS NULL OR "purchaseCost" >= 0);
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_size_check" CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);
ALTER TABLE "asset_allocations" ADD CONSTRAINT "asset_allocations_dates_check" CHECK (("expectedReturnAt" IS NULL OR "expectedReturnAt" >= "allocatedAt") AND ("returnedAt" IS NULL OR "returnedAt" >= "allocatedAt"));
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_departments_check" CHECK ("sourceDepartmentId" <> "destinationDepartmentId");
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_target_check" CHECK (("assetId" IS NOT NULL AND "assetCategoryId" IS NULL) OR ("assetId" IS NULL AND "assetCategoryId" IS NOT NULL));
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_dates_check" CHECK ("endsAt" > "startsAt");
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_cost_check" CHECK (("estimatedCost" IS NULL OR "estimatedCost" >= 0) AND ("actualCost" IS NULL OR "actualCost" >= 0));
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_dates_check" CHECK ("dueAt" IS NULL OR "dueAt" >= "openedAt");
ALTER TABLE "audit_cycles" ADD CONSTRAINT "audit_cycles_dates_check" CHECK ("endsAt" > "startsAt");
CREATE UNIQUE INDEX "asset_allocations_one_open_per_asset" ON "asset_allocations" ("assetId") WHERE "status" IN ('ACTIVE', 'OVERDUE');
CREATE UNIQUE INDEX "resource_bookings_one_open_asset_window" ON "resource_bookings" ("assetId", "startsAt", "endsAt") WHERE "status" IN ('PENDING', 'APPROVED', 'CHECKED_OUT');

CREATE OR REPLACE FUNCTION assetflow_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users', 'roles', 'user_roles', 'departments', 'employees', 'asset_categories', 'assets', 'asset_status_history',
    'asset_documents', 'asset_allocations', 'transfer_requests', 'resource_bookings', 'maintenance_requests',
    'maintenance_history', 'audit_cycles', 'audit_assignments', 'audit_results', 'notifications', 'activity_logs'
  ]
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION assetflow_set_updated_at()', table_name);
  END LOOP;
END;
$$;
