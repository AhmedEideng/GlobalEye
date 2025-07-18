# GlobalEye - News Aggregation Platform

A modern, secure, and high-performance news aggregation platform built with Next.js, TypeScript, and Supabase.

## 🚀 Features

- **Real-time News Aggregation**: Collects news from multiple sources (NewsAPI, GNews, Guardian, Mediastack)
- **Smart Content Deduplication**: Removes duplicate content using advanced algorithms
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **PWA Support**: Progressive Web App with offline capabilities
- **Breaking News Ticker**: Real-time breaking news updates
- **User Authentication**: Secure login with Google OAuth
- **Favorites System**: Save and manage favorite articles
- **Admin Dashboard**: Comprehensive statistics and management tools
- **SEO Optimized**: Full SEO support with structured data
- **Performance Optimized**: Caching, lazy loading, and performance optimizations

## 🔒 Security Features

- **API Key Protection**: All API keys stored in environment variables
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Input Validation**: Comprehensive input sanitization and validation
- **CORS Protection**: Proper CORS configuration
- **XSS Prevention**: Content sanitization and secure rendering
- **CSRF Protection**: Built-in CSRF protection
- **Secure Headers**: Security headers implementation
- **Error Handling**: Secure error handling without information leakage

## ⚡ Performance Optimizations

- **Caching Strategy**: Multi-level caching (memory, database, CDN)
- **Image Optimization**: Automatic image compression and optimization
- **Code Splitting**: Dynamic imports and lazy loading
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Database Optimization**: Efficient queries and indexing
- **CDN Integration**: Global content delivery network
- **Service Worker**: Offline functionality and caching

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Image Processing**: Sharp
- **Caching**: LRU Cache, Next.js built-in caching
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, Stylelint
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmedEideng/GlobalEye.git
   cd GlobalEye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # External News APIs
   NEWS_API_KEY=your_newsapi_key
   GNEWS_API_KEY=your_gnews_key
   GUARDIAN_API_KEY=your_guardian_key
   MEDIASTACK_KEY=your_mediastack_key

   # Logging and Monitoring
   LOGSNAG_API_KEY=your_logsnag_key

   # Application Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Run the database setup script
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Tables

- **news**: Main articles table
- **categories**: News categories
- **favorites**: User favorite articles
- **users**: User profiles (managed by Supabase Auth)

### Key Features

- **Automatic slug generation** for SEO-friendly URLs
- **Content deduplication** using URL and title matching
- **Category management** with automatic ID assignment
- **View counting** and analytics tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEWS_API_KEY` | NewsAPI.org API key | No |
| `GNEWS_API_KEY` | GNews API key | No |
| `GUARDIAN_API_KEY` | Guardian API key | No |
| `MEDIASTACK_KEY` | Mediastack API key | No |
| `LOGSNAG_API_KEY` | LogSnag API key for monitoring | No |

### Performance Settings

- **Cache Duration**: 5 minutes for breaking news
- **Image Optimization**: 70% JPEG quality, max 1200px width
- **Rate Limiting**: 10 requests per 5 minutes per IP
- **Database Connection Pool**: Optimized for Vercel deployment

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring and Analytics

- **LogSnag Integration**: Real-time notifications and monitoring
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Anonymous usage statistics

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔍 Code Quality

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Run Stylelint
npm run lint:css

# Fix auto-fixable issues
npm run lint:fix
```

### Pre-commit Hooks

- Automatic linting and formatting
- Type checking
- Test running
- Security scanning

## 🐛 Troubleshooting

### Common Issues

1. **API Rate Limiting**
   - Check API key validity
   - Verify rate limit settings
   - Monitor API usage

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review database permissions

3. **Image Loading Problems**
   - Check image proxy configuration
   - Verify image URLs
   - Monitor image optimization settings

4. **Performance Issues**
   - Review caching configuration
   - Check database query optimization
   - Monitor bundle size

### Development Tips

- Use `npm run lint` to check for code issues
- Monitor browser console for warnings
- Test PWA functionality in production build
- Verify all meta tags are properly set
- Check security headers implementation

## 📁 Project Structure

```
globaleye/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── [category]/     # Dynamic category pages
│   │   └── article/        # Article pages
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── jest.config.js         # Jest configuration
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@globaleye.live or create an issue on GitHub.

---

**Note**: This project is actively maintained and updated regularly. Make sure to keep dependencies updated for the best performance and security.

## 🔒 Security Checklist

- [x] API keys stored in environment variables
- [x] Input validation and sanitization
- [x] Rate limiting implemented
- [x] CORS protection configured
- [x] XSS prevention measures
- [x] CSRF protection enabled
- [x] Secure error handling
- [x] Content Security Policy
- [x] HTTPS enforcement
- [x] Regular dependency updates

## ⚡ Performance Checklist

- [x] Image optimization
- [x] Code splitting
- [x] Caching strategy
- [x] Bundle optimization
- [x] Database query optimization
- [x] CDN integration
- [x] Service worker implementation
- [x] Lazy loading
- [x] Prefetching
- [x] Core Web Vitals optimization
