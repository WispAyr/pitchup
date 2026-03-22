'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

const ALL_ALLERGENS = [
  'gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'soy', 'fish', 'shellfish', 'sesame', 'celery', 'mustard', 'sulphites',
]
const ALL_DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher']

interface MenuItem {
  id: string
  vendorId: string
  categoryId: string
  name: string
  description: string | null
  price: number
  allergens: string[]
  dietaryTags: string[]
  available: boolean
  sortOrder: number
}

interface MenuCategory {
  id: string
  vendorId: string
  name: string
  sortOrder: number
  items: MenuItem[]
}

interface ItemFormData {
  name: string
  description: string
  priceDisplay: string
  allergens: string[]
  dietaryTags: string[]
  sortOrder: number
}

const emptyItemForm: ItemFormData = {
  name: '',
  description: '',
  priceDisplay: '',
  allergens: [],
  dietaryTags: [],
  sortOrder: 0,
}

export default function MenuManagementPage() {
  const params = useParams()
  const slug = params.slug as string

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false)
  const [itemCategoryId, setItemCategoryId] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormData>(emptyItemForm)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null)

  const fetchMenu = useCallback(async () => {
    try {
      const vendorRes = await fetch(`/api/vendors/${slug}`)
      const vendor = await vendorRes.json()
      if (vendor.id) setVendorId(vendor.id)

      const res = await fetch(`/api/menu/categories?vendorId=${vendor.id}`)
      if (!res.ok) throw new Error('Failed to load menu')
      const data = await res.json()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryName.trim() || !vendorId) return
    setSaving(true)
    try {
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, name: categoryName.trim(), sortOrder: categories.length }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      setCategoryName('')
      setShowCategoryForm(false)
      await fetchMenu()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateCategory(id: string) {
    if (!editCategoryName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCategoryName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to update category')
      setEditingCategoryId(null)
      await fetchMenu()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      const url =
        deleteTarget.type === 'category'
          ? `/api/menu/categories/${deleteTarget.id}`
          : `/api/menu/items/${deleteTarget.id}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed to delete ${deleteTarget.type}`)
      setDeleteTarget(null)
      await fetchMenu()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAvailability(item: MenuItem) {
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !item.available }),
      })
      if (!res.ok) throw new Error('Failed to update item')
      await fetchMenu()
    } catch (err: any) {
      setError(err.message)
    }
  }

  function openAddItem(categoryId: string) {
    setItemCategoryId(categoryId)
    setEditingItemId(null)
    setItemForm(emptyItemForm)
    setShowItemModal(true)
  }

  function openEditItem(item: MenuItem) {
    setItemCategoryId(item.categoryId)
    setEditingItemId(item.id)
    setItemForm({
      name: item.name,
      description: item.description || '',
      priceDisplay: (item.price / 100).toFixed(2),
      allergens: item.allergens,
      dietaryTags: item.dietaryTags,
      sortOrder: item.sortOrder,
    })
    setShowItemModal(true)
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault()
    if (!itemForm.name.trim() || !itemForm.priceDisplay) return

    const priceInPence = Math.round(parseFloat(itemForm.priceDisplay) * 100)
    if (isNaN(priceInPence) || priceInPence < 0) {
      setError('Invalid price')
      return
    }

    setSaving(true)
    try {
      if (editingItemId) {
        const res = await fetch(`/api/menu/items/${editingItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: itemCategoryId,
            name: itemForm.name.trim(),
            description: itemForm.description.trim() || null,
            price: priceInPence,
            allergens: itemForm.allergens,
            dietaryTags: itemForm.dietaryTags,
            sortOrder: itemForm.sortOrder,
          }),
        })
        if (!res.ok) throw new Error('Failed to update item')
      } else {
        const res = await fetch('/api/menu/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId,
            categoryId: itemCategoryId,
            name: itemForm.name.trim(),
            description: itemForm.description.trim() || null,
            price: priceInPence,
            allergens: itemForm.allergens,
            dietaryTags: itemForm.dietaryTags,
            sortOrder: itemForm.sortOrder,
          }),
        })
        if (!res.ok) throw new Error('Failed to add item')
      }
      setShowItemModal(false)
      await fetchMenu()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleAllergen(a: string) {
    setItemForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter((x) => x !== a)
        : [...prev.allergens, a],
    }))
  }

  function toggleDietaryTag(t: string) {
    setItemForm((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(t)
        ? prev.dietaryTags.filter((x) => x !== t)
        : [...prev.dietaryTags, t],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-white" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">
            X
          </button>
        </div>
      )}

      {/* Add Category Form */}
      {showCategoryForm && (
        <form onSubmit={handleAddCategory} className="mb-6 flex gap-3 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category name"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCategoryForm(false)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Categories and Items */}
      {categories.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500">No menu categories yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="mb-4 flex items-center justify-between">
                {editingCategoryId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateCategory(cat.id)}
                      disabled={saving}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-900 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategoryId(null)}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddItem(cat.id)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-600"
                      >
                        + Add Item
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id)
                          setEditCategoryName(cat.name)
                        }}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })}
                        className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600/30"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

              {cat.items.length === 0 ? (
                <p className="text-sm text-gray-500">No items in this category</p>
              ) : (
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg bg-gray-50/50 p-3 ${
                        !item.available ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-sm font-semibold text-amber-400">
                            {formatPrice(item.price)}
                          </span>
                          {!item.available && (
                            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                              UNAVAILABLE
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 truncate text-xs text-gray-500">{item.description}</p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.allergens.map((a) => (
                            <span
                              key={a}
                              className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-medium text-orange-400"
                            >
                              {a}
                            </span>
                          ))}
                          {item.dietaryTags.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-medium text-green-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            item.available
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          onClick={() => openEditItem(item)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                          className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingItemId ? 'Edit Item' : 'Add Item'}
            </h2>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Price (GBP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      &pound;
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemForm.priceDisplay}
                      onChange={(e) => setItemForm({ ...itemForm, priceDisplay: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-7 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Sort Order</label>
                  <input
                    type="number"
                    value={itemForm.sortOrder}
                    onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-500">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_ALLERGENS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergen(a)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        itemForm.allergens.includes(a)
                          ? 'bg-orange-500/30 text-orange-300'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-500">Dietary Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DIETARY_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleDietaryTag(t)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        itemForm.dietaryTags.includes(t)
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItemId ? 'Update' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-gray-100 shadow-sm p-6 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Confirm Delete</h3>
            <p className="mb-4 text-sm text-gray-500">
              Are you sure you want to delete &quot;{deleteTarget.name}&quot;?
              {deleteTarget.type === 'category' && ' This will also delete all items in this category.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
