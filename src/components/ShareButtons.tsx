"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { sendAnalyticsEvent } from '@utils/fetchNews';
import React from 'react';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const [fullUrl, setFullUrl] = useState(url);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.origin + url);
    }
  }, [url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      sendAnalyticsEvent('share_article', { method: 'copy', url: fullUrl });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [fullUrl]);

  const handleWhatsAppShare = useCallback(() => {
    sendAnalyticsEvent('share_article', { method: 'whatsapp', url: fullUrl });
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  }, [fullUrl, title]);

  const handleTwitterShare = useCallback(() => {
    sendAnalyticsEvent('share_article', { method: 'twitter', url: fullUrl });
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(twitterUrl, '_blank');
  }, [fullUrl, title]);

  const handleFacebookShare = useCallback(() => {
    sendAnalyticsEvent('share_article', { method: 'facebook', url: fullUrl });
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank');
  }, [fullUrl]);

  // Memoize share buttons to prevent unnecessary re-renders
  const shareButtons = useMemo(() => [
    {
      label: 'Copy Link',
      icon: copied ? '✓' : '🔗',
      onClick: handleCopy,
      className: copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
    },
    {
      label: 'WhatsApp',
      icon: '📱',
      onClick: handleWhatsAppShare,
      className: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Twitter',
      icon: '🐦',
      onClick: handleTwitterShare,
      className: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Facebook',
      icon: '📘',
      onClick: handleFacebookShare,
      className: 'bg-blue-600 hover:bg-blue-700'
    }
  ], [handleCopy, handleWhatsAppShare, handleTwitterShare, handleFacebookShare, copied]);

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {shareButtons.map((button, index) => (
        <button
          key={`${button.label}-${index}`}
          onClick={button.onClick}
          className={`${button.className} text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2`}
          aria-label={button.label}
        >
          <span>{button.icon}</span>
          <span>{button.label}</span>
        </button>
      ))}
    </div>
  );
} 