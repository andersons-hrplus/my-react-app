# CarParts Pro - E-commerce Platform for Auto Parts

A comprehensive e-commerce application for car parts, built with modern technologies and following software development best practices. Features complete user authentication, product management, shopping cart, and review system.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with Dark Mode Support
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Role-Based Access
- **Deployment**: Ready for Vercel/Netlify
- **Dev Tools**: ESLint, Hot Module Replacement

## 📦 Features

### 🔐 **Authentication System**
- User registration with role selection (Buyer/Seller)
- Secure login/logout with Supabase Auth
- Role-based access control and permissions

### 🛒 **E-commerce Functionality**
- Product catalog with categories (Engine, Brakes, Suspension, etc.)
- Advanced search and filtering (price, condition, category)
- Shopping cart with quantity management
- Product reviews and ratings (buyers only)

### 👥 **User Roles**
- **Buyers**: Browse products, add to cart, write reviews
- **Sellers**: Manage products (add/edit/delete), view orders
- **Dual Role**: Sellers can also purchase as buyers

### 🎨 **UI/UX Features**
- Responsive design for all devices
- Dark/Light/System theme support
- Beautiful product cards and detail pages
- Real-time cart counter and notifications

### 🛠️ **Product Management**
- Rich product forms with specifications
- Image gallery support
- Stock and inventory tracking
- Category-based organization

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local` file in project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire content from `database_schema.sql`
4. Paste and execute to create all tables and policies

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📁 Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # App navigation with role-based menus
│   ├── ProductCard.tsx  # Product display cards
│   ├── ProductForm.tsx  # Add/edit product forms
│   └── ProductList.tsx  # Product listing with filters
├── pages/              # Application pages
│   ├── Dashboard.tsx   # User dashboard
│   ├── ProductsPage.tsx # Product browsing
│   ├── ProductDetail.tsx # Product detail view
│   ├── AddProductPage.tsx # Seller product creation
│   ├── EditProductPage.tsx # Seller product editing
│   └── Profile.tsx     # User profile with theme switcher
├── services/           # API service layer
│   ├── productService.ts # Product CRUD operations
│   ├── cartService.ts   # Shopping cart management
│   ├── reviewService.ts # Review system
│   └── categoryService.ts # Category management
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── types/              # TypeScript definitions
│   └── database.ts     # Supabase types
└── lib/
    └── supabase.ts     # Supabase client configuration
```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User information with roles (buyer/seller)
- **categories** - Product categories (Engine, Brakes, etc.)
- **products** - Car parts with specifications and pricing
- **cart_items** - Shopping cart functionality
- **reviews** - Product reviews (buyers only)
- **orders** - Order management (future expansion)

### Security Features
- Row Level Security (RLS) policies
- Role-based data access
- Secure foreign key relationships
- Automated timestamps and triggers

## 🎯 User Workflows

### **For Buyers:**
1. Register/Login → Browse Products → Add to Cart → Write Reviews
2. Filter by category, price, condition
3. View seller information and product specifications

### **For Sellers:**
1. Register as Seller → Add Products → Manage Inventory
2. View product performance and reviews
3. Update product information and pricing

## 🌙 Theme System

Complete dark mode support with three options:
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes
- **System Mode** - Follows device preference

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Development Best Practices
- TypeScript for type safety
- Component-based architecture
- Service layer for API calls
- Row Level Security for data protection
- Responsive design patterns

## 🧪 Testing the Application

### **As a Seller:**
1. Register with "Seller" role
2. Navigate to "Add Product"
3. Create products with categories, specifications, images
4. Manage inventory in "My Products"

### **As a Buyer:**
1. Register with "Buyer" role  
2. Browse products with filters
3. Add items to shopping cart
4. Write reviews for purchased items

## 📈 Future Enhancements

- [ ] Order processing and payment integration
- [ ] Advanced search with Elasticsearch
- [ ] Product recommendations
- [ ] Seller analytics dashboard
- [ ] Mobile app with React Native
- [ ] Multi-language support
- [ ] Advanced inventory management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`) 
5. Open a Pull Request

## 🔧 Configuration Files

The project includes proper configuration for:
- **ESLint** - Code linting and quality
- **TypeScript** - Type checking
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development and building

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**CarParts Pro** - Your complete solution for car parts e-commerce! 🚗✨
