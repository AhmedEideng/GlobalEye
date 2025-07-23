"use client";
import Image from 'next/image';
import { cleanImageUrl } from '@utils/cleanImageUrl';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = 70
}: OptimizedImageProps) {
  const cleanSrc = cleanImageUrl(src);
  // تحقق من صلاحية الرابط (يقبل أي رابط يبدأ بـ http/https)
  const isValidImageUrl = !!cleanSrc && /^https?:\/\//i.test(cleanSrc);
  if (!isValidImageUrl) return null;
  return (
    <Image
      src={cleanSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
    />
  );
} 