import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Login from '../pages/Login.jsx'
import AssetListPage from '../pages/assets/AssetListPage.jsx'
import AssetDetailPage from '../pages/assets/AssetDetailPage.jsx'
import AssetFormPage from '../pages/assets/AssetFormPage.jsx'
import CategoryListPage from '../pages/categories/CategoryListPage.jsx'
import CategoryFormPage from '../pages/categories/CategoryFormPage.jsx'
import BookingListPage from '../pages/bookings/BookingListPage.jsx'
import BookingFormPage from '../pages/bookings/BookingFormPage.jsx'
import BookingDetailPage from '../pages/bookings/BookingDetailPage.jsx'
import MaintenanceListPage from '../pages/maintenance/MaintenanceListPage.jsx'
import MaintenanceFormPage from '../pages/maintenance/MaintenanceFormPage.jsx'
import MaintenanceDetailPage from '../pages/maintenance/MaintenanceDetailPage.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/assets" replace />} />
          <Route path="/assets" element={<AssetListPage />} />
          <Route path="/assets/new" element={<AssetFormPage />} />
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
          <Route path="/assets/:assetId/edit" element={<AssetFormPage />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories/:categoryId/edit" element={<CategoryFormPage />} />
          <Route path="/bookings" element={<BookingListPage />} />
          <Route path="/bookings/new" element={<BookingFormPage />} />
          <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
          <Route path="/maintenance" element={<MaintenanceListPage />} />
          <Route path="/maintenance/new" element={<MaintenanceFormPage />} />
          <Route path="/maintenance/:maintenanceId" element={<MaintenanceDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/assets" replace />} />
    </Routes>
  )
}
