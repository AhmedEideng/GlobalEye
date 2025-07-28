import React from 'react';

interface SourceNameTextProps {
  sourceName: string | null | undefined;
  fallback?: string;
  className?: string;
}

const SourceNameText: React.FC<SourceNameTextProps> = ({ 
  sourceName, 
  fallback = 'Unknown Source',
  className = ''
}) => {
  // Simple sanitization for source names - less strict than SafeText
  const sanitizeSourceName = (text: string | null | undefined): string => {
    if (!text) return fallback;
    
    return text
      .replace(/[<>]/gu, '') // Remove angle brackets
      .replace(/javascript:/giu, '') // Remove javascript protocol
      .replace(/data:/giu, '') // Remove data protocol
      .replace(/vbscript:/giu, '') // Remove vbscript protocol
      .replace(/\bon\w+\s*=/giu, '') // Remove event handlers
      .replace(/\s+/gu, ' ') // Normalize whitespace
      .trim()
      .substring(0, 50); // Limit length
  };

  const sanitized = sanitizeSourceName(sourceName);
  const displayText = sanitized || fallback;

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};

export default SourceNameText; 