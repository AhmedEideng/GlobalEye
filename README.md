# GlobalEye News - English Version

A modern news aggregation platform built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Real-time News**: Fetch and display news from multiple sources
- **Category Management**: Organized news by categories
- **Responsive Design**: Modern UI that works on all devices
- **Admin Panel**: Manage categories and content
- **API Integration**: RESTful APIs for news and categories
- **Database Integration**: Supabase for data storage

## 📋 Supported Categories

The application supports the following news categories:

1. **Business** - Business and economy news
2. **Sports** - Sports and matches news
3. **Health** - Health and medical news
4. **Science** - Science and discoveries news
5. **Technology** - Technology and innovations news
6. **World** - World and international events news
7. **Entertainment** - Entertainment and arts news
8. **Politics** - Politics and government news

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd globaleye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual values:
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Google Analytics
   GA_MEASUREMENT_ID=your_ga_measurement_id_here
   
   # Site Configuration
   SITE_URL=your_site_url_here
   
   # News Refresh Token
   REFRESH_NEWS_TOKEN=your_refresh_token_here
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   
   # News API Keys
   GNEWS_KEY=your_gnews_api_key_here
   NEWS_API_KEY=your_newsapi_key_here
   MEDIASTACK_KEY=your_mediastack_key_here
   GUARDIAN_KEY=your_guardian_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Get your project URL and anon key
   - Create the required tables (see database setup below)

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Required Tables

#### Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### News Table
```sql
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    url VARCHAR(500),
    image_url VARCHAR(500),
    source VARCHAR(255),
    category VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Insert Sample Categories
Run the SQL commands in `database/insert-missing-categories.sql` to add the required categories.

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 📁 Project Structure

```
globaleye/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin pages
│   │   └── ...
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── database/              # SQL scripts
├── public/               # Static assets
└── ...
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_KEY` | Your Supabase anonymous key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GA_MEASUREMENT_ID` | Google Analytics measurement ID | No |
| `SITE_URL` | Your site URL | Yes |
| `REFRESH_NEWS_TOKEN` | News refresh token | Yes |
| `GNEWS_KEY` | GNews API key | Yes |
| `NEWS_API_KEY` | NewsAPI key | Yes |
| `MEDIASTACK_KEY` | MediaStack API key | Yes |
| `GUARDIAN_KEY` | The Guardian API key | Yes |

### API Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/news-rotation` - Get rotated news by category
- `GET /api/test-env` - Test environment variables
- `GET /api/test-db` - Test database connection

## 🧪 Testing

### System Diagnostics
Visit `/test` to run system diagnostics and check:
- Environment variables status
- Database connection
- API functionality

### Categories View
Visit `/categories-view` to see all categories and their statistics.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm run start`

## 🔒 Security

### Environment Variables Protection

This project implements several security measures to protect sensitive information:

1. **`.env.local` is gitignored** - Your actual environment variables are never committed to version control
2. **`.env.example` template** - Provides a safe template without real values
3. **No hardcoded secrets** - All sensitive values are loaded from environment variables
4. **Fallback values** - Empty fallbacks prevent crashes while maintaining security

### Best Practices

- ✅ **Never commit `.env.local`** - It's already in `.gitignore`
- ✅ **Use `.env.example`** - Copy and fill with your values
- ✅ **Rotate API keys regularly** - Update your environment variables periodically
- ✅ **Use environment-specific files** - Different files for dev/staging/prod
- ✅ **Monitor API usage** - Check your API providers for unusual activity

### Security Checklist

- [ ] `.env.local` is not committed to git
- [ ] All API keys are in environment variables
- [ ] No hardcoded secrets in source code
- [ ] `.env.example` contains no real values
- [ ] Database credentials are secure
- [ ] OAuth credentials are properly configured

## 🔍 Troubleshooting

### Common Issues

1. **White screen on homepage**
   - Check environment variables
   - Verify Supabase connection
   - Check browser console for errors

2. **Database connection errors**
   - Verify Supabase credentials
   - Check if tables exist
   - Run system diagnostics at `/test`

3. **Missing categories**
   - Run `database/insert-missing-categories.sql`
   - Check categories view at `/categories-view`

### Debug Tools

- **System Diagnostics**: `/test`
- **Categories Management**: `/categories-view`
- **Admin Panel**: `/admin`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Run system diagnostics at `/test`
- Review the documentation

---

**Note**: This is the English version of the GlobalEye News application. All user interfaces, error messages, and documentation are in English. 