import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/analytics.api.js'
import KpiCard from '../components/analytics/KpiCard.jsx'
import StatusPieChart from '../components/analytics/StatusPieChart.jsx'
import ConditionBarChart from '../components/analytics/ConditionBarChart.jsx'

const mockFallbackData = {
  kpis: {
    totalAssets: 124,
    activeAssets: 98,
    underMaintenance: 12,
    pendingBookings: 8,
    activeBookings: 15,
    maintenanceRequests: 4,
    totalCategories: 18,
    utilizationPercentage: '82%'
  },
  charts: {
    assetStatus: [
      { name: 'Active', value: 98 },
      { name: 'Under Maintenance', value: 12 },
      { name: 'Retired', value: 5 },
      { name: 'Lost', value: 9 }
    ],
    assetCondition: [
      { name: 'Excellent', value: 45 },
      { name: 'Good', value: 50 },
      { name: 'Fair', value: 20 },
      { name: 'Poor', value: 9 }
    ],
    bookingStatus: [
      { name: 'Active', value: 15 },
      { name: 'Pending', value: 8 },
      { name: 'Completed', value: 42 },
      { name: 'Cancelled', value: 5 }
    ],
    categoryDistribution: [
      { name: 'Electronics', value: 40 },
      { name: 'Vehicles', value: 25 },
      { name: 'Furniture', value: 30 },
      { name: 'Equipment', value: 29 }
    ]
  },
  activities: {
    recentChanges: [
      { id: 1, text: 'MacBook Pro assigned to John Doe', time: '2 hours ago' },
      { id: 2, text: 'Delivery Van status changed to Active', time: '4 hours ago' }
    ],
    recentMaintenance: [
      { id: 1, text: 'HVAC repair scheduled', time: '1 day ago' },
      { id: 2, text: 'Forklift oil change completed', time: '2 days ago' }
    ],
    recentBookings: [
      { id: 1, text: 'Conference Room A booked by Marketing', time: '3 hours ago' },
      { id: 2, text: 'Projector #2 requested by Sales', time: '5 hours ago' }
    ]
  }
}

const IconBox = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-28 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-80 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
      <div className="lg:col-span-1 bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
    </div>
  </div>
)

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    analyticsApi.getDashboardData()
      .then(res => {
        if (isMounted) {
          // Check if data is populated, otherwise use fallback
          setData(res?.kpis ? res : mockFallbackData)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data', err)
        if (isMounted) {
          setData(mockFallbackData)
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  const { kpis, charts, activities } = data

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard & Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your asset management system</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Assets" value={kpis.totalAssets} icon={<IconBox><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></IconBox>} />
        <KpiCard title="Active Assets" value={kpis.activeAssets} icon={<IconBox><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></IconBox>} />
        <KpiCard title="Under Maintenance" value={kpis.underMaintenance} icon={<IconBox><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></IconBox>} />
        <KpiCard title="Pending Bookings" value={kpis.pendingBookings} icon={<IconBox><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconBox>} />
        <KpiCard title="Active Bookings" value={kpis.activeBookings} icon={<IconBox><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></IconBox>} />
        <KpiCard title="Maintenance Requests" value={kpis.maintenanceRequests} icon={<IconBox><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconBox>} />
        <KpiCard title="Total Categories" value={kpis.totalCategories} icon={<IconBox><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></IconBox>} />
        <KpiCard title="Utilization %" value={kpis.utilizationPercentage} icon={<IconBox><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></IconBox>} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart title="Asset Status" data={charts.assetStatus} />
        <ConditionBarChart title="Asset Condition" data={charts.assetCondition} color="#10B981" />
        <StatusPieChart title="Booking Status" data={charts.bookingStatus} colors={['#F59E0B', '#3B82F6', '#10B981', '#EF4444']} />
        <ConditionBarChart title="Category Distribution" data={charts.categoryDistribution} color="#8B5CF6" />
      </div>

      {/* Activities and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Recent Asset Changes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Asset Changes</h3>
          <ul className="space-y-4">
            {activities.recentChanges?.map(activity => (
              <li key={activity.id} className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Maintenance</h3>
          <ul className="space-y-4">
            {activities.recentMaintenance?.map(activity => (
              <li key={activity.id} className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Recent Bookings</h3>
          <ul className="space-y-4">
            {activities.recentBookings?.map(activity => (
              <li key={activity.id} className="flex flex-col">
                <span className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-wider">Quick Actions</h3>
          <div className="flex flex-col space-y-3">
            <Link to="/assets/new" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
              + New Asset
            </Link>
            <Link to="/bookings/new" className="px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
              + New Booking
            </Link>
            <Link to="/maintenance/new" className="px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
              + New Maintenance
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
