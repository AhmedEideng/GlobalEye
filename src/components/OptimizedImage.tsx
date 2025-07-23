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

  // إذا لم يكن الرابط صالحًا، لا تعرض شيئًا
  if (!isValidImageUrl) {
    return null;
  }

  // إذا تم تحديد fill، استخدم layout="fill" مع objectFit="cover"
  if (fill) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          src={cleanSrc}
          alt={alt}
          className={className}
          fill
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // إذا لم يتم تحديد width أو height، استخدم قيم افتراضية
  const finalWidth = width || 500;
  const finalHeight = height || 500;

  return (
    <Image
      src={cleanSrc}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={className}
      style={{ objectFit: 'cover' }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
}
