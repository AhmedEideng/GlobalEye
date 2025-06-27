'use client';

import OptimizedImage from '../../components/OptimizedImage';

interface ArticleImageProps {
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

export default function ArticleImage(props: ArticleImageProps) {
  return <OptimizedImage {...props} />;
} 