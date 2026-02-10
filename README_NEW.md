# CarParts Pro - E-commerce Car Parts Marketplace

A modern, full-featured e-commerce application built with React, TypeScript, Supabase, and Tailwind CSS for buying and selling car parts.

## Features

### 🔐 Authentication & User Management
- User registration and login with Supabase Auth
- Role-based access control (Buyer/Seller)
- Profile management and customization

### 🛒 E-commerce Functionality
- **For Buyers:**
  - Browse and search car parts by category, brand, condition, price
  - Add products to shopping cart
  - Write and read product reviews
  - View product details with images and specifications

- **For Sellers:**
  - Add, edit, and manage product inventory
  - Upload product images and specifications
  - Set pricing, stock levels, and product conditions
  - Manage product categorization and visibility

### 📦 Product Management
- Advanced product filtering and search
- Category-based organization (Engine, Brakes, Suspension, etc.)
- Product conditions: New, Used, Refurbished
- Compatibility information (year, make, model)
- Image galleries and detailed specifications

### 🛍️ Shopping Cart
- Add/remove items with quantity controls
- Real-time cart updates and total calculations
- Stock availability checking
- Persistent cart across sessions

### ⭐ Review System
- Buyers can write detailed product reviews
- 5-star rating system
- Review verification and moderation
- Helpful vote system for reviews

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS with custom components
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Routing:** React Router v6
- **State Management:** React Context + Hooks
- **Icons:** Heroicons (via Tailwind)

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- A Supabase account and project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-react-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and run the entire contents of `database_schema.sql`

This will create:
- Updated profiles table with user roles
- Products, categories, cart_items, reviews tables
- Order management tables (for future expansion)
- Row Level Security policies
- Database functions and triggers
- Sample category data

### 5. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Database Schema

### Core Tables

#### `profiles` (Extended from Supabase Auth)
- User information and role management
- Fields: id, email, full_name, avatar_url, user_role

#### `categories`
- Product categories for organization
- Pre-populated with car part categories

#### `products`
- Complete product information
- Includes compatibility, pricing, inventory
- Seller relationship and categorization

#### `cart_items`
- Shopping cart management
- User-product relationship with quantities

#### `reviews`
- Product review system
- Rating, comments, and helpful votes

#### `orders` & `order_items`
- Order processing system (ready for expansion)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthForm.tsx    # Authentication form
│   ├── Navigation.tsx  # App navigation bar
│   ├── ProductCard.tsx # Product display card
│   ├── ProductList.tsx # Product listing with filters
│   ├── ProductForm.tsx # Add/edit product form
│   ├── Cart.tsx        # Shopping cart interface
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Full page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ProductsPage.tsx # Product browsing
│   ├── CartPage.tsx    # Shopping cart page
│   └── ...
├── services/           # API service functions
│   ├── productService.ts # Product CRUD operations
│   ├── cartService.ts    # Cart management
│   ├── reviewService.ts  # Review system
│   └── ...
├── types/              # TypeScript type definitions
│   └── database.ts     # Database schema types
└── lib/                # Utility libraries
    └── supabase.ts     # Supabase configuration
```

## User Roles & Permissions

### Buyers
- ✅ Browse and search products
- ✅ Add items to cart and checkout
- ✅ Write and manage reviews
- ✅ View seller information
- ❌ Cannot create/edit products

### Sellers
- ✅ Create, edit, and delete their products
- ✅ Manage inventory and pricing
- ✅ Add items to cart (can buy from other sellers)
- ✅ View their product analytics
- ❌ Cannot write reviews

## Key Features Implementation

### Role-Based Access Control
The application uses Supabase RLS policies to ensure:
- Users can only edit their own profiles
- Sellers can only manage their own products
- Buyers can only write reviews (not sellers)
- Cart items are private to each user

### Real-time Updates
- Cart count updates immediately when items are added
- Product availability is checked in real-time
- User role is displayed in navigation

### Advanced Search & Filtering
- Text search across product names, descriptions, and brands
- Filter by category, condition, price range
- Sort by relevance, price, or date added

## Customization

### Adding New Categories
Update the categories insert statement in `database_schema.sql` or add via the Supabase dashboard.

### Extending Product Schema
Modify the `products` table and update the TypeScript types in `src/types/database.ts`.

### Custom Styling
The project uses Tailwind CSS. Modify styles in component files or extend the theme in `tailwind.config.js`.

## Security Features

- Row Level Security (RLS) on all tables
- User authentication via Supabase Auth
- Protected routes requiring authentication
- Role-based feature access
- SQL injection prevention through Supabase client
- XSS protection through React's built-in escaping

## Performance Optimizations

- Lazy loading of product images
- Paginated product listings
- Efficient cart state management
- Optimized database queries with proper indexing
- React component memoization where appropriate

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Build the project
2. Deploy the `dist` folder
3. Configure environment variables on your hosting platform
4. Ensure Supabase RLS policies are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React, TypeScript, Supabase, and Tailwind CSS.