import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../../api/categories.api.js'

export default function CategoryFormPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(categoryId)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parentId: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await categoriesApi.list({ pageSize: 100 })
        setCategories(catRes.data)

        if (isEdit) {
          const category = await categoriesApi.getById(categoryId)
          setFormData({
            code: category.code,
            name: category.name,
            description: category.description || '',
            parentId: category.parentId || '',
          })
        }
      } catch (err) {
        setError('Failed to load form data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [categoryId, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = { ...formData }
    if (!payload.parentId) payload.parentId = null
    if (!payload.description) payload.description = null
    
    // Cannot change code in edit mode usually, but sending it is fine if backend ignores it,
    // let's just send the payload

    try {
      if (isEdit) {
        delete payload.code // Backend usually prevents code changes
        await categoriesApi.update(categoryId, payload)
      } else {
        await categoriesApi.create(payload)
      }
      navigate('/categories')
    } catch (err) {
      setError(err.message || 'Failed to save category')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-signal"></div>
      </div>
    )
  }

  // Filter out the current category and its children to prevent circular dependencies in parent selection
  const validParents = categories.filter(c => c.id !== categoryId)

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-paper-300/50 text-ink-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="font-display text-3xl font-bold text-ink uppercase tracking-wide">
          {isEdit ? 'Edit Category' : 'New Category'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-stamp/10 border border-stamp/20 text-stamp text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-paper-300 p-6 md:p-8">
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-bold mb-1.5 text-ink-500">Category Code <span className="text-stamp">*</span></label>
            <input
              name="code"
              required
              disabled={isEdit}
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. IT-HW"
              className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:opacity-60 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-ink-500">Category Name <span className="text-stamp">*</span></label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. IT Hardware"
              className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-ink-500">Parent Category</label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
            >
              <option value="">None (Top Level)</option>
              {validParents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-ink-500">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description of this category..."
              className="w-full px-4 py-2.5 bg-paper-100 border border-paper-300 rounded-lg focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end border-t border-paper-300 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-bold text-ink hover:bg-paper-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-bold bg-signal hover:bg-signal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  )
}
