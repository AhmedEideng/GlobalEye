'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
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
  fallbackSrc?: string;
}

export default function ImageWithFallback({
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
  fallbackSrc = '/placeholder-news.jpg',
  ...props
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

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

  // Clean and validate image URL
  const cleanImageUrl = (url: string): string => {
    if (!url) return '';
    
    let cleanUrl = url.trim();
    
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
  };

  const imageSrc = cleanImageUrl(currentSrc);

  // If image failed to load, show placeholder
  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          minHeight: fill ? '200px' : undefined
        }}
      >
        <div className="text-center text-gray-500">
          <svg 
            className="mx-auto h-12 w-12 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  // If no valid image URL, show placeholder
  if (!imageSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          minHeight: fill ? '200px' : undefined
        }}
      >
        <div className="text-center text-gray-500">
          <svg 
            className="mx-auto h-12 w-12 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm">No image</p>
        </div>
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
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        fill={fill}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={false}
        {...props}
      />
    </div>
  );
} 