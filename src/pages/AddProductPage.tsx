import { useNavigate } from 'react-router-dom'
import { ProductForm } from '../components/ProductForm'

export function AddProductPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/seller/products')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <ProductForm onSuccess={handleSuccess} />
    </div>
  )
}