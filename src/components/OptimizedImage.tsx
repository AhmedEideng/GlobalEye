'use client';

// import Image from 'next/image'; // Disabled Next.js Image optimization
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image loading error
  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };

  // If image failed to load, show placeholder
  if (imageError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          minHeight: fill ? '200px' : undefined
        }}
      >
        <img 
          src="/placeholder-news.svg" 
          alt="Image not available"
          className="max-w-full max-h-full object-contain"
          style={{ 
            width: fill ? '100%' : width, 
            height: fill ? '100%' : height 
          }}
        />
      </div>
    );
  }

  // Clean and validate image URL
  const cleanImageUrl = (url: string): string => {
    if (!url) return '';
    
    // Remove any invalid characters
    let cleanUrl = url.trim();
    
    // Ensure it's a valid URL
    try {
      new URL(cleanUrl);
    } catch {
      // If not a valid URL, try to fix common issues
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
      }
    }
    
    return cleanUrl;
  };

  const imageSrc = cleanImageUrl(src);

  // If no valid image URL, show placeholder
  if (!imageSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          minHeight: fill ? '200px' : undefined
        }}
      >
        <img 
          src="/placeholder-news.svg" 
          alt="Image not available"
          className="max-w-full max-h-full object-contain"
          style={{ 
            width: fill ? '100%' : width, 
            height: fill ? '100%' : height 
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400">
            <svg 
              className="animate-spin h-8 w-8" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}
