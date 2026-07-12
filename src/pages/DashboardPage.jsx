import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/analytics.api.js'
import { useAuth } from '../hooks/useAuth.js'
import KpiCard from '../components/analytics/KpiCard.jsx'
import StatusPieChart from '../components/analytics/StatusPieChart.jsx'
import ConditionBarChart from '../components/analytics/ConditionBarChart.jsx'

// Animated Counter component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const end = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(end)) return
    
    let start = 0;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{typeof value === 'string' && value.includes('%') ? `${count}%` : count}</span>
}

const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
      {icon}
    </div>
    <p className="text-sm">{message}</p>
  </div>
)

const IconBox = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-28 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-80 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true
    analyticsApi.getDashboardData()
      .then(res => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data', err)
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96">
        <EmptyState message="Unable to load dashboard data. Please try again later." icon={<IconBox><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBox>} />
      </div>
    )
  }

  const { overview: kpis, distributions: charts, recent: activities } = data
  const isAdminOrManager = user?.roles?.includes('ADMIN') || user?.roles?.includes('ASSET_MANAGER')

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.displayName}</h1>
        <p className="text-sm text-gray-600">
          {isAdminOrManager ? 'Here is the global overview of your organization\'s assets.' : 'Here is the overview of your requested resources.'}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdminOrManager && (
          <>
            <KpiCard title="Total Assets" value={<AnimatedCounter value={kpis.totalAssets} />} icon={<IconBox><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></IconBox>} />
            <KpiCard title="Active Assets" value={<AnimatedCounter value={kpis.activeAssets} />} icon={<IconBox><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></IconBox>} />
            <KpiCard title="Utilization %" value={<AnimatedCounter value={kpis.utilizationPercentage} />} icon={<IconBox><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></IconBox>} />
            <KpiCard title="Total Categories" value={<AnimatedCounter value={kpis.totalCategories} />} icon={<IconBox><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></IconBox>} />
          </>
        )}
        <KpiCard title="Under Maintenance" value={<AnimatedCounter value={kpis.maintenanceAssets} />} icon={<IconBox><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></IconBox>} />
        <KpiCard title="Pending Bookings" value={<AnimatedCounter value={kpis.pendingBookings} />} icon={<IconBox><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconBox>} />
        <KpiCard title="Active Bookings" value={<AnimatedCounter value={kpis.activeBookings} />} icon={<IconBox><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></IconBox>} />
        <KpiCard title="Maintenance Requests" value={<AnimatedCounter value={kpis.maintenanceRequests} />} icon={<IconBox><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconBox>} />
      </div>

      {/* Charts Row */}
      {isAdminOrManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusPieChart title="Asset Status" data={charts.assetStatus.map(s => ({ name: s.lifecycleStatus, value: s._count }))} />
          <ConditionBarChart title="Asset Condition" data={charts.assetCondition.map(c => ({ name: c.condition, value: c._count }))} color="#10B981" />
          <StatusPieChart title="Booking Status" data={charts.bookingStatus.map(b => ({ name: b.status, value: b._count }))} colors={['#F59E0B', '#3B82F6', '#10B981', '#EF4444']} />
          <ConditionBarChart title="Category Distribution" data={charts.category.map(c => ({ name: c.categoryId || 'Uncategorized', value: c._count }))} color="#8B5CF6" />
        </div>
      )}

      {/* Activities and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Recent Asset Changes */}
        {isAdminOrManager && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full overflow-hidden max-h-96">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Assets Added</h3>
            <div className="flex-1 overflow-y-auto pr-2">
              {activities.assets?.length > 0 ? (
                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                  {activities.assets.map(asset => (
                    <div key={asset.id} className="relative pl-6">
                      <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-800"></span>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{asset.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(asset.acquiredAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No recent asset changes found." icon={<IconBox><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/></IconBox>} />
              )}
            </div>
          </div>
        )}

        {/* Recent Maintenance */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full overflow-hidden max-h-96 ${isAdminOrManager ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Maintenance</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {activities.maintenance?.length > 0 ? (
              <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                {activities.maintenance.map(req => (
                  <div key={req.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-gray-800"></span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{req.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {req.status} • {new Date(req.openedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent maintenance events." icon={<IconBox><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></IconBox>} />
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full overflow-hidden max-h-96 ${isAdminOrManager ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Bookings</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {activities.bookings?.length > 0 ? (
              <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                {activities.bookings.map(req => (
                  <div key={req.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-800"></span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{req.purpose || 'Booking Request'}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {req.status} • {new Date(req.startsAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent bookings found." icon={<IconBox><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/></IconBox>} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Quick Actions</h3>
          <div className="flex flex-col space-y-3">
            {isAdminOrManager && (
              <Link to="/assets/new" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border border-transparent">
                + Add Asset
              </Link>
            )}
            <Link to="/bookings/new" className="px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border border-transparent">
              + Request Booking
            </Link>
            <Link to="/maintenance/new" className="px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border border-transparent">
              + Report Maintenance
            </Link>
            {isAdminOrManager && (
              <Link to="/assets" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border border-transparent mt-4">
                Manage Categories
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
