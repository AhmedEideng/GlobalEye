"use client";
import { cleanImageUrl } from '@utils/cleanImageUrl';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
}: OptimizedImageProps) {
  const cleanSrc = cleanImageUrl(src);
  
  // تحقق من صلاحية الرابط (يقبل أي رابط يبدأ بـ http/https)
  const isValidImageUrl = !!cleanSrc && /^https?:\/\//i.test(cleanSrc);
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('OptimizedImage Debug:', {
      originalSrc: src,
      cleanSrc,
      isValidImageUrl,
      alt
    });
  }
  
  // إذا لم يكن الرابط صالحًا، لا تعرض شيئًا
  if (!isValidImageUrl) {
    return null;
  }
  
  // استخدم img العادي بدلاً من next/image لحل مشكلة الصور
  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        objectFit: 'cover'
      }}
      onError={(e) => {
        // إذا فشل تحميل الصورة، أخفي العنصر
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (process.env.NODE_ENV === 'development') {
          console.error('Image failed to load:', cleanSrc);
        }
      }}
      onLoad={() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Image loaded successfully:', cleanSrc);
        }
      }}
    />
  );
} 