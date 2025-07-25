'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ 
  message = "جاري التحميل...", 
  size = 'medium' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-red-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">GlobalEye News</h2>
        <p className="text-gray-600">جاري تحميل الأخبار...</p>
      </div>
    </div>
  );
}

export function SectionLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
} 