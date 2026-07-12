import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { categoriesApi } from '../../api/categories.api.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function CategoryListPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const canWrite = hasRole('ADMIN') || hasRole('ASSET_MANAGER')

  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  const currentPage = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await categoriesApi.list({
        page: currentPage,
        pageSize: 20,
        ...(search && { search }),
      })
      setCategories(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const updateSearch = (value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('search', value)
    else params.delete('search')
    params.set('page', '1')
    setSearchParams(params)
  }

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  const handleDelete = async (id) => {
    setDeleteError('')
    try {
      await categoriesApi.remove(id)
      setDeletingId(null)
      fetchCategories()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category. Ensure no assets are attached.')
      setDeletingId(null)
    }
  }

  const startIndex = (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">Categories</h1>
        {canWrite && (
          <button
            onClick={() => navigate('/categories/new')}
            className="inline-flex items-center gap-2 bg-signal hover:bg-signal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-paper-300 p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search categories by name or code..."
            className="w-full pl-10 pr-4 py-2.5 border border-paper-300 rounded-lg text-sm focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
            defaultValue={search}
            onKeyDown={(e) => { if (e.key === 'Enter') updateSearch(e.target.value) }}
          />
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-4 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg">{error}</div>
      )}
      {deleteError && (
        <div className="mb-4 p-3 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-lg flex justify-between items-center">
          {deleteError}
          <button onClick={() => setDeleteError('')} className="text-stamp hover:text-stamp-700 font-bold">×</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-paper-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-300 bg-paper-100/50">
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-500 text-xs uppercase tracking-wider hidden sm:table-cell">Parent</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-paper-300/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-paper-300/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-ink-500">
                    <p className="font-medium">No categories found</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-paper-300/50 hover:bg-paper-100/50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{category.code}</td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-ink-500 hidden md:table-cell truncate max-w-xs">{category.description || '—'}</td>
                    <td className="px-4 py-3 text-ink-500 hidden sm:table-cell">{category.parent?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {canWrite && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/categories/${category.id}/edit`)}
                            className="p-1.5 text-ink-500 hover:text-signal hover:bg-signal/10 rounded"
                            title="Edit Category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingId(category.id)}
                            className="p-1.5 text-ink-500 hover:text-stamp hover:bg-stamp/10 rounded"
                            title="Delete Category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-paper-300">
            <p className="text-sm text-ink-500">
              Showing <span className="font-medium text-ink">{startIndex}</span>–<span className="font-medium text-ink">{endIndex}</span> of{' '}
              <span className="font-medium text-ink">{pagination.total}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-paper-300 rounded-lg hover:bg-paper-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 text-sm border border-paper-300 rounded-lg hover:bg-paper-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold font-display text-stamp mb-2">Delete Category</h3>
            <p className="text-ink-500 mb-6">Are you sure you want to delete this category? You can only delete categories that have no child categories or assets attached.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-ink-500 hover:bg-paper-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-stamp hover:bg-stamp-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
