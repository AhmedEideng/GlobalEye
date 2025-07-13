# GlobalEye News

A modern, responsive news website built with Next.js 15, TypeScript, and Tailwind CSS. Features real-time news updates, breaking news ticker, and PWA capabilities.

## 🚀 Features

- **Real-time News**: Latest breaking news from multiple sources
- **Breaking News Ticker**: Live scrolling news ticker
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **PWA Support**: Progressive Web App with offline capabilities
- **SEO Optimized**: Meta tags, sitemaps, and structured data
- **Dark Mode**: Automatic theme switching
- **Performance**: Optimized images and lazy loading
- **Security**: CSP headers and security best practices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Deployment**: Vercel
- **PWA**: next-pwa
- **Icons**: React Icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/globaleye.git
   cd globaleye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### PWA Configuration
The app includes PWA support with:
- Service worker for offline functionality
- Web app manifest
- Install prompt
- Background sync

### Image Optimization
- Next.js Image component with WebP support
- Automatic image optimization
- Lazy loading for better performance

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 🐛 Troubleshooting

### Common Issues

1. **DOM Manipulation Errors**
   - Fixed with improved ErrorBoundary
   - Better null checks in components
   - Safer DOM operations

2. **Image Preload Warnings**
   - Optimized image loading strategy
   - Proper priority settings
   - Lazy loading for non-critical images

3. **Meta Tag Deprecation**
   - Updated to use `mobile-web-app-capable`
   - Proper PWA meta tags
   - Browser compatibility

4. **CSP Violations**
   - Updated Content Security Policy
   - Allowed necessary resources
   - Proper script and style sources

### Development Tips

- Use `npm run lint` to check for code issues
- Check browser console for any remaining warnings
- Test PWA functionality in production build
- Verify all meta tags are properly set

## 📁 Project Structure

```
globaleye/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind configuration
└── next.config.js          # Next.js configuration
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
