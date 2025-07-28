'use client';

import { useState, useEffect, useMemo } from 'react';
// import Image from 'next/image'; // Disabled Next.js Image optimization

interface UniversalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
}

export default function UniversalImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc = '/placeholder-news.svg',
  ...props
}: UniversalImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize the cleaned image URL to avoid unnecessary recalculations
  const imageSrc = useMemo(() => {
    if (!currentSrc || currentSrc.trim() === '') {
      return fallbackSrc;
    }
    
    let cleanUrl = currentSrc.trim();
    
    // If the link is empty or null, use the default image
    if (!cleanUrl || cleanUrl === 'null' || cleanUrl === 'undefined') {
      return fallbackSrc;
    }
    
    // If it's already a local path, use it as is
    if (cleanUrl.startsWith('/')) {
      return cleanUrl;
    }
    
    // Remove any query parameters that might cause issues
    try {
      const urlObj = new URL(cleanUrl);
      // Keep only essential query parameters
      const essentialParams = ['w', 'h', 'q', 'fit', 'crop'];
      const filteredParams = new URLSearchParams();
      
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (essentialParams.includes(key)) {
          filteredParams.set(key, value);
        }
      }
      
      urlObj.search = filteredParams.toString();
      cleanUrl = urlObj.toString();
    } catch {
      // If not a valid URL, try to fix common issues
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
      }
    }
    
    return cleanUrl;
  }, [currentSrc, fallbackSrc]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  // Handle image loading error
  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    if (retryCount === 0 && fallbackSrc && fallbackSrc !== currentSrc) {
      // Try fallback image
      console.log('Trying fallback image...');
      setCurrentSrc(fallbackSrc);
      setRetryCount(1);
      setIsLoading(true);
    } else {
      // Show placeholder
      setImageError(true);
      setIsLoading(false);
    }
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
          src={fallbackSrc} 
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

  // If no valid image URL, show placeholder
  if (!imageSrc || imageSrc === fallbackSrc) {
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
          src={fallbackSrc} 
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
      {/* Loading overlay - only show for a short time */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400">
            <svg 
              className="animate-spin h-6 w-6" 
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
      
      {/* Use regular img tag since Next.js Image optimization is disabled */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'} ${fill ? 'w-full h-full object-cover' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </div>
  );
} 