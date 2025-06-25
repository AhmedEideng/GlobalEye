'use client';

import React, { useState, useEffect } from "react";

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
        className="hover:text-blue-600 transition-colors duration-200"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      
      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X (Twitter)"
        className="hover:text-gray-800 transition-colors duration-200"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encode(title + ' ' + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        className="hover:text-green-500 transition-colors duration-200"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.991c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05.001C5.495.001.001 5.495.001 12.049c0 2.124.553 4.199 1.601 6.032L.057 23.974a1.001 1.001 0 0 0 1.262 1.262l5.924-1.548a11.888 11.888 0 0 0 5.804 1.479h.005c6.554 0 11.948-5.494 11.949-12.049a11.87 11.87 0 0 0-3.489-8.413"/>
        </svg>
      </a>
      
      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Telegram"
        className="hover:text-blue-500 transition-colors duration-200"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.371 0 0 5.371 0 12c0 6.629 5.371 12 12 12s12-5.371 12-12c0-6.629-5.371-12-12-12zm5.707 8.293l-1.414 8.485c-.104.624-.441.775-.893.482l-2.475-1.828-1.194 1.151c-.132.132-.243.243-.497.243l.178-2.522 4.599-4.149c.2-.178-.043-.277-.31-.099l-5.684 3.584-2.448-.763c-.532-.166-.543-.532.111-.789l9.564-3.689c.443-.166.832.099.689.788z"/>
        </svg>
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