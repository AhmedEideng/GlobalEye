"use client";
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface ScrollToTopWrapperProps {
  children: React.ReactNode;
}

export default function ScrollToTopWrapper({ children }: ScrollToTopWrapperProps) {
  useScrollToTop();
  
  return <>{children}</>;
} 