import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Login from '../pages/Login.jsx'
import AssetListPage from '../pages/assets/AssetListPage.jsx'
import AssetDetailPage from '../pages/assets/AssetDetailPage.jsx'
import AssetFormPage from '../pages/assets/AssetFormPage.jsx'
import CategoryListPage from '../pages/categories/CategoryListPage.jsx'
import CategoryFormPage from '../pages/categories/CategoryFormPage.jsx'

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
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/assets" replace />} />
    </Routes>
  )
}
