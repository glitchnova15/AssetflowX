import { prisma } from '../config/prisma.js'

export const analyticsRepository = {
  getDashboardData: async () => {
    const [
      totalAssets,
      activeAssets,
      maintenanceAssets,
      pendingBookings,
      activeBookings,
      maintenanceRequests,
      totalCategories,
      assetStatusDistribution,
      assetConditionDistribution,
      categoryDistribution,
      bookingStatusDistribution,
      recentAssets,
      recentMaintenance,
      recentBookings
    ] = await prisma.$transaction([
      prisma.asset.count(),
      prisma.asset.count({ where: { lifecycleStatus: 'ALLOCATED' } }),
      prisma.asset.count({ where: { lifecycleStatus: 'MAINTENANCE' } }),
      prisma.resourceBooking.count({ where: { status: 'PENDING' } }),
      prisma.resourceBooking.count({ where: { status: 'CHECKED_OUT' } }),
      prisma.maintenanceRequest.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.assetCategory.count(),
      prisma.asset.groupBy({ by: ['lifecycleStatus'], _count: true }),
      prisma.asset.groupBy({ by: ['condition'], _count: true }),
      prisma.asset.groupBy({ by: ['categoryId'], _count: true }),
      prisma.resourceBooking.groupBy({ by: ['status'], _count: true }),
      prisma.asset.findMany({ orderBy: { acquiredAt: 'desc' }, take: 10 }),
      prisma.maintenanceRequest.findMany({ orderBy: { openedAt: 'desc' }, take: 10 }),
      prisma.resourceBooking.findMany({ orderBy: { startsAt: 'desc' }, take: 10 })
    ])

    let utilizationPercentage = 0;
    if (totalAssets > 0) {
      utilizationPercentage = (activeAssets / totalAssets) * 100;
    }

    return {
      overview: {
        totalAssets,
        activeAssets,
        maintenanceAssets,
        pendingBookings,
        activeBookings,
        maintenanceRequests,
        totalCategories,
        utilizationPercentage
      },
      distributions: {
        assetStatus: assetStatusDistribution,
        assetCondition: assetConditionDistribution,
        category: categoryDistribution,
        bookingStatus: bookingStatusDistribution
      },
      recent: {
        assets: recentAssets,
        maintenance: recentMaintenance,
        bookings: recentBookings
      }
    }
  }
}
