# AI Chatbot - React + TypeScript + Tailwind + Supabase

A production-ready React application with AI chatbot capabilities, built with modern technologies and following software development best practices.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel/Netlify
- **Dev Tools**: ESLint, Hot Module Replacement

## 📦 Features

- ⚡ Lightning fast development with Vite
- 🎨 Beautiful UI with Tailwind CSS
- 🔐 Authentication ready with Supabase
- 🤖 AI chatbot integration ready
- 📱 Responsive design
- 🌙 Dark mode support
- 🔧 TypeScript for type safety

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Rename `.env.example` to `.env.local`
4. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 📁 Project Structure
```
src/
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── components/          # Reusable UI components (coming soon)
├── pages/              # Application pages (coming soon)
├── hooks/              # Custom React hooks (coming soon)
├── types/              # TypeScript type definitions (coming soon)
└── utils/              # Utility functions (coming soon)
```

## 🗄️ Database Schema (Planned)

### Users Table
- User authentication and profiles
- AI chat preferences

### Chats Table
- Chat sessions and metadata
- User associations

### Messages Table
- Individual chat messages
- AI responses and user queries

### AI Configuration
- Model settings
- System prompts and configurations

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

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS utilities
- Implement proper error handling
- Write meaningful git commits

## 📚 Next Steps

1. **Database Setup**: Create tables in Supabase
2. **Authentication**: Implement user login/signup
3. **Chat Interface**: Build the chatbot UI
4. **AI Integration**: Connect to OpenAI/Claude API
5. **Real-time**: Add live chat updates
6. **Testing**: Implement unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
