"use client";
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { FaEnvelope, FaInstagram, FaFacebookF, FaTwitter, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const [fullUrl, setFullUrl] = useState(url);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.origin + url);
    }
  }, [url]);

  const handleWhatsAppShare = useCallback(() => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  }, [fullUrl, title]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(twitterUrl, '_blank');
  }, [fullUrl, title]);

  const handleFacebookShare = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank');
  }, [fullUrl]);

  const handleInstagramShare = useCallback(() => {
    // Instagram does not support direct sharing via web, so just open Instagram
    window.open('https://instagram.com/', '_blank');
  }, []);

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(fullUrl);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [title, fullUrl]);

  const handleTelegramShare = useCallback(() => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
    window.open(telegramUrl, '_blank');
  }, [fullUrl, title]);

  const shareButtons = [
    {
      id: 'email',
      label: 'Email',
      icon: <FaEnvelope size={32} />,
      onClick: handleEmailShare,
      bg: 'bg-[#1da1f2]', // أزرق فاتح
      ring: 'ring-[#1da1f2]'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <FaInstagram size={32} />,
      onClick: handleInstagramShare,
      bg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
      ring: 'ring-pink-500'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <FaFacebookF size={32} />,
      onClick: handleFacebookShare,
      bg: 'bg-[#1877f3]',
      ring: 'ring-[#1877f3]'
    },
    {
      id: 'x',
      label: 'X',
      icon: <FaTwitter size={32} />,
      onClick: handleTwitterShare,
      bg: 'bg-white',
      ring: 'ring-gray-300',
      iconColor: 'text-black'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <FaWhatsapp size={32} />,
      onClick: handleWhatsAppShare,
      bg: 'bg-[#25d366]',
      ring: 'ring-[#25d366]'
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <FaTelegramPlane size={32} />,
      onClick: handleTelegramShare,
      bg: 'bg-[#229ed9]',
      ring: 'ring-[#229ed9]'
    },
  ];

  return (
    <div className="flex gap-6 justify-center items-center py-6">
      {shareButtons.map((button) => (
        <button
          key={button.id}
          onClick={button.onClick}
          className={`group flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 ${button.bg} ${button.ring} hover:scale-110`}
          aria-label={button.label}
          type="button"
          style={{ position: 'relative' }}
        >
          <span className={`flex items-center justify-center w-full h-full ${button.iconColor || 'text-white'}`}>{button.icon}</span>
          {button.id === 'email' && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-green-600 text-white px-2 py-1 rounded shadow">تم النسخ!</span>
          )}
        </button>
      ))}
    </div>
  );
} 