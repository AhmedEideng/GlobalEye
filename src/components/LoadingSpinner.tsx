'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  showProgress = false,
  progress = 0 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`animate-spin rounded-full border-b-2 border-red-600 ${sizeClasses[size]} mb-4`}></div>
      {text && (
        <p className="text-gray-600 text-center mb-2">{text}</p>
      )}
      {showProgress && (
        <div className="w-48 bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
      {showProgress && (
        <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">GlobalEye News</h2>
        <p className="text-gray-600 mb-4">Loading news...</p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 shadow-md overflow-hidden">
      <div className="w-full h-48 bg-gray-300" />
      <div className="p-4">
        <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
        <div className="h-6 w-3/4 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
} 