'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cleanImageUrl } from '@utils/cleanImageUrl';

// Next.js Image supports WebP and Lazy Loading automatically based on the browser

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder-news.jpg',
  width,
  height,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Clean the image URL
  const cleanSrc = cleanImageUrl(src);
  
  // استخدم الصورة مباشرة من المصدر الخارجي بدون proxy
  const imageSrc = hasError ? placeholder : cleanSrc || '/placeholder-news.jpg' || '';

  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
    </div>
  );
};

export default OptimizedImage; 