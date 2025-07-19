import React from 'react';
import { sanitizeText } from '../utils/sanitizeText';

interface SafeTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: string | null | undefined;
  fallback?: string;
}

const SafeText: React.FC<SafeTextProps> = ({ children, fallback = '', ...props }) => {
  const sanitized = sanitizeText(children);
  return <span {...props}>{sanitized || fallback}</span>;
};

export default SafeText; 