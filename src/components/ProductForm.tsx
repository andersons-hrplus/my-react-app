import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import type { Product, Category, ProductFormData } from '../types/database'

interface ProductFormProps {
  product?: Product
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { isSeller } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock_quantity: product?.stock_quantity || 0,
    category_id: product?.category_id || '',
    brand: product?.brand || '',
    model: product?.model || '',
    year_from: product?.year_from || null,
    year_to: product?.year_to || null,
    part_number: product?.part_number || '',
    condition: product?.condition || 'new',
    images: product?.images || [],
    specifications: product?.specifications || {},
    is_active: product?.is_active ?? true,
    featured: product?.featured || false
  })

  useEffect(() => {
    if (!isSeller()) {
      navigate('/')
      return
    }

    loadCategories()
  }, [isSeller, navigate])

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories()
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }))
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim() && !formData.specifications[specKey.trim()]) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }))
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpecification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Debug form data
    console.log('Submitting form data:', formData)

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required')
      setLoading(false)
      return
    }

    if (!formData.category_id) {
      setError('Product category is required')
      setLoading(false)
      return
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0')
      setLoading(false)
      return
    }

    if (formData.stock_quantity < 0) {
      setError('Stock quantity cannot be negative')
      setLoading(false)
      return
    }

    try {
      let result

      if (product) {
        // Update existing product
        result = await productService.updateProduct(product.id, formData)
      } else {
        // Create new product
        result = await productService.createProduct(formData)
      }

      if (result.error) {
        setError(result.error)
        console.error('Product save error:', result.error)
      } else {
        onSuccess?.()
        if (!product) {
          // Reset form for new product
          setFormData({
            name: '',
            description: '',
            price: 0,
            stock_quantity: 0,
            category_id: '',
            brand: '',
            model: '',
            year_from: null,
            year_to: null,
            part_number: '',
            condition: 'new',
            images: [],
            specifications: {},
            is_active: true,
            featured: false
          })
        }
      }
    } catch (err) {
      console.error('Error saving product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
      setError(`Failed to save product: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isSeller()) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {product ? 'Edit Product' : 'Add New Product'}
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            <div className="font-semibold">Error:</div>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="" className="dark:bg-gray-700">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="dark:bg-gray-700">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="new" className="dark:bg-gray-700">New</option>
                  <option value="used" className="dark:bg-gray-700">Used</option>
                  <option value="refurbished" className="dark:bg-gray-700">Refurbished</option>
                </select>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="e.g., Toyota, Honda, Ford"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="e.g., Camry, Civic, F-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year From</label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.year_from || ''}
                    onChange={(e) => handleInputChange('year_from', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="2020"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year To</label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.year_to || ''}
                    onChange={(e) => handleInputChange('year_to', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number</label>
                <input
                  type="text"
                  value={formData.part_number}
                  onChange={(e) => handleInputChange('part_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Manufacturer part number"
                />
              </div>

              {/* Status Toggles */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active (visible to buyers)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Images</h3>
            
            <div className="flex gap-3 mb-4">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={addImage}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Image
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h3>
            
            {/* Add specification form */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Specification name (e.g., Weight)"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value (e.g., 2.5 lbs)"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  disabled={!specKey.trim() || !specValue.trim() || formData.specifications[specKey.trim()]}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Spec
                </button>
              </div>
              {specKey.trim() && formData.specifications[specKey.trim()] && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">This specification already exists</p>
              )}
            </div>

            {Object.entries(formData.specifications).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                    <span className="text-gray-600 dark:text-gray-400">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-8 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}