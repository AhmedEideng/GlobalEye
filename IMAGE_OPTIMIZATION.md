# Image Optimization Guide

## Overview
This document outlines the image optimization improvements implemented in the GlobalEye News application.

## Implemented Optimizations

### 1. Lazy Loading
- Added `loading="lazy"` attribute to all images
- Added `decoding="async"` for better performance
- Implemented Intersection Observer for advanced lazy loading

### 2. Custom Image Components

#### LazyImage Component
- Advanced lazy loading with Intersection Observer
- Placeholder with blur effect
- Error handling with fallback images
- Smooth transitions

#### OptimizedImage Component
- Uses Next.js Image component
- Automatic format optimization (WebP, AVIF)
- Responsive sizing
- Blur placeholder
- Priority loading for above-the-fold images

### 3. Configuration Improvements

#### Next.js Config
```javascript
images: {
  domains: ['images.unsplash.com', 'via.placeholder.com', 'picsum.photos'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

### 4. CSS Optimizations
- Responsive image sizing
- Smooth transitions
- Loading placeholders
- Optimized containers

## Usage Examples

### Basic Lazy Loading
```jsx
<img 
  src={imageUrl} 
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### Using LazyImage Component
```jsx
import LazyImage from './components/LazyImage';

<LazyImage
  src={imageUrl}
  alt="Description"
  className="w-full h-64 object-cover"
/>
```

### Using OptimizedImage Component
```jsx
import OptimizedImage from './components/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  priority={true} // For above-the-fold images
/>
```

## Performance Benefits

1. **Faster Initial Load**: Images load only when needed
2. **Reduced Bandwidth**: Smaller image formats (WebP, AVIF)
3. **Better UX**: Smooth loading transitions
4. **SEO Friendly**: Proper alt tags and loading attributes
5. **Mobile Optimized**: Responsive sizing for all devices

## Best Practices

1. Always use `alt` attributes for accessibility
2. Use `priority` for above-the-fold images
3. Provide appropriate `sizes` for responsive images
4. Use placeholder images for better UX
5. Implement error handling for failed image loads

## Monitoring

Monitor image performance using:
- Lighthouse Performance score
- Core Web Vitals (LCP, CLS)
- Network tab in DevTools
- Image loading times 