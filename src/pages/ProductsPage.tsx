import { ProductList } from '../components/ProductList'

export function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProductList title="Browse Car Parts" />
        </div>
      </div>
    </div>
  )
}