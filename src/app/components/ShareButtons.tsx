'use client';

import React, { useState, useEffect } from "react";
import { FaFacebook, FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareButtonsProps {
  title: string;
  url: string;
}

const encode = (str: string) => encodeURIComponent(str);

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    setShareUrl(window.location.origin + url);
  }, [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <div className="flex gap-3 mt-4">
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Facebook"
        className="rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 p-2 text-[#1877F3] hover:bg-[#1877F3] hover:text-white transition-all duration-200"
      >
        <FaFacebook size={22} />
      </a>
      
      {/* X (Twitter) */}
      <a
        href={`https://x.com/intent/tweet?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        className="rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 p-2 text-black hover:bg-black hover:text-white transition-all duration-200"
      >
        <FaXTwitter size={22} />
      </a>
      
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encode(title + ' ' + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        className="rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 p-2 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200"
      >
        <FaWhatsapp size={22} />
      </a>
      
      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Telegram"
        className="rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 p-2 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all duration-200"
      >
        <FaTelegram size={22} />
      </a>
      
      {/* Instagram (just opens Instagram, as direct sharing is not supported) */}
      <a
        href={`https://instagram.com/`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Instagram"
        className="rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200 p-2 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all duration-200"
      >
        <FaInstagram size={22} />
      </a>
      
      {/* Copy Link */}
      <button
        onClick={handleCopy}
        title="Copy link"
        className="hover:text-gray-600 transition-colors duration-200"
        type="button"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      </button>
    </div>
  );
};

export default ShareButtons; 