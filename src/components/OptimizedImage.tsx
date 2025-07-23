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
  if (!isValidImageUrl) return null;
  
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
    />
  );
} 