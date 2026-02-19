// Database types for the e-commerce application

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  user_role: 'buyer' | 'seller';
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  brand?: string;
  model?: string;
  year_from?: number;
  year_to?: number;
  part_number?: string;
  condition: 'new' | 'used' | 'refurbished';
  images?: string[];
  specifications?: Record<string, any>;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  seller?: Profile;
  avg_rating?: number;
  total_reviews?: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined data
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer_id: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  reviewer?: Profile;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shipping_address?: Record<string, any>;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joined data
  product?: Product;
  seller?: Profile;
}

export interface SellerPaymentInfo {
  id: string;
  seller_id: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number_last4?: string;
  routing_number_last4?: string;
  paypal_email?: string;
  stripe_account_id?: string;
  payment_method_preference: 'paypal' | 'bank_transfer';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  buyer_id: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id?: string; // Also stores PayPal capture ID
  stripe_checkout_session_id?: string; // Also stores PayPal order ID
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  payment_method?: string;
  receipt_url?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined data
  order?: Order;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
}

export interface CheckoutData {
  shipping_address: ShippingAddress;
  payment_method: string;
  notes?: string;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  brand: string;
  model: string;
  year_from: number | null;
  year_to: number | null;
  part_number: string;
  condition: 'new' | 'used' | 'refurbished';
  images: string[];
  specifications: Record<string, any>;
  is_active: boolean;
  featured: boolean;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export interface CartItemUpdate {
  quantity: number;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}