import React from 'react';

interface SimpleSourceNameProps {
  sourceName: string | null | undefined;
  fallback?: string;
  className?: string;
}

const SimpleSourceName: React.FC<SimpleSourceNameProps> = ({ 
  sourceName, 
  fallback = 'Unknown Source',
  className = ''
}) => {
  // Simple display without any sanitization
  const displayText = sourceName || fallback;

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};

export default SimpleSourceName; 