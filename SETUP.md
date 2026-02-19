# CarParts Pro - Installation & Setup Guide

## Quick Start

Follow these steps to get the CarParts Pro e-commerce application running locally.

## Prerequisites

- **Node.js 16+** and npm
- A **Supabase account** ([sign up here](https://supabase.com))

## Step 1: Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Step 2: Supabase Configuration

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### Get API Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your:
   - Project URL
   - Public anon key

### Configure Environment
Create `.env.local` in your project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Database Setup

### Run SQL Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `database_schema.sql` from this project
4. Run the query

This creates:
- ✅ All required tables (products, categories, cart, reviews, etc.)
- ✅ User roles and permissions
- ✅ Sample car parts categories
- ✅ Database security policies

## Step 4: Test the Application

### Create Test Accounts
1. Go to `http://localhost:5173`
2. Sign up for a **Seller** account
3. Sign up for a **Buyer** account (use different email)

### Test Core Features
**As a Seller:**
- Add a few car parts products
- Upload product images (use URLs for now)
- Set prices and inventory

**As a Buyer:**
- Browse the products
- Add items to cart
- Write product reviews

## Troubleshooting

### Common Issues

**Environment Variables Not Loading:**
- Ensure `.env.local` is in the project root
- Restart the dev server after creating `.env.local`
- Variable names must start with `VITE_`

**Database Connection Error:**
- Verify your Supabase URL and key are correct
- Check if your Supabase project is fully provisioned
- Ensure you've run the database schema

**RLS Policy Errors:**
- Make sure you've run the complete `database_schema.sql`
- Check that Row Level Security is enabled on all tables

**Authentication Issues:**
- Verify email confirmation settings in Supabase Auth
- Check spam folder for confirmation emails
- Try different browsers/incognito mode

### Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify all steps were completed in order
3. Try creating a fresh Supabase project
4. Contact support or create an issue on GitHub

## Production Deployment

### Environment Variables
Set these in your hosting platform:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

### Build Command
```bash
npm run build
```

### Deploy Folder
Upload the `dist` folder to your hosting provider.

## Next Steps

Once everything is working:
1. Customize the categories in your Supabase database
2. Add your own product images and data
3. Configure email templates in Supabase Auth
4. Set up custom domain and SSL
5. Configure payment processing (PayPal)

## Architecture Overview

```
Frontend (React/TypeScript)
    ↓
Supabase Client
    ↓
Supabase Backend
    ├── Authentication
    ├── PostgreSQL Database
    ├── Row Level Security
    └── Real-time Updates
```

The application follows modern best practices:
- **TypeScript** for type safety
- **Component-based architecture** for reusability
- **Service layer** for API interactions
- **Context API** for state management
- **RLS policies** for security
- **Responsive design** with Tailwind CSS

Enjoy building with CarParts Pro! 🚗✨