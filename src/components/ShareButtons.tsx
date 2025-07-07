"use client";
import { useState } from 'react';
import { sendAnalyticsEvent } from '../app/utils/fetchNews';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    sendAnalyticsEvent('share_article', { method: 'copy', url: fullUrl });
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex flex-wrap gap-3 mt-6 mb-8 items-center justify-center">
      {/* WhatsApp - Updated to match original button style */}
      <a 
        href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        title="Share on WhatsApp" 
        onClick={() => sendAnalyticsEvent('share_article', { method: 'whatsapp', url: fullUrl })}
        className="btn btn-secondary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.69.97.99-3.59-.24-.37A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2c2.54 0 4.93.99 6.74 2.8A9.94 9.94 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.16 3.3 5.23 4.5.73.3 1.3.48 1.75.61.74.23 1.41.2 1.94.12.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z"/>
        </svg>
        Share on WhatsApp
      </a>
      {/* Telegram */}
      <a href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" title="Share on Telegram" onClick={() => sendAnalyticsEvent('share_article', { method: 'telegram', url: fullUrl })}>
        <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm5.707 8.293l-2.828 8.485c-.213.64-.77.822-1.312.573l-3.637-2.687-1.754-.844-2.41-.793c-.524-.172-.533-.414.11-.608l9.36-2.88c.524-.172.82.127.675.608z"/></svg>
      </a>
      {/* Facebook */}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`} target="_blank" rel="noopener noreferrer" title="Share on Facebook" onClick={() => sendAnalyticsEvent('share_article', { method: 'facebook', url: fullUrl })}>
        <svg className="w-7 h-7 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
      </a>
      {/* X (Twitter) */}
      <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" title="Share on X" onClick={() => sendAnalyticsEvent('share_article', { method: 'x', url: fullUrl })}>
        <svg className="w-7 h-7 text-black" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_87_390)">
            <rect width="1200" height="1227" fill="white"/>
            <path d="M908.305 0H1090.7L704.305 521.49L1152 1227H797.305L523.305 813.49L211.305 1227H28.3052L438.305 667.49L0 0H364.305L610.305 375.49L908.305 0ZM845.305 1105H945.305L308.305 114H203.305L845.305 1105Z" fill="black"/>
          </g>
          <defs>
            <clipPath id="clip0_87_390">
              <rect width="1200" height="1227" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </a>
      {/* Instagram */}
      <a
        href={`https://www.instagram.com/?url=${encodeURIComponent(fullUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Instagram"
        className="group"
        onClick={() => sendAnalyticsEvent('share_article', { method: 'instagram', url: fullUrl })}
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] transition-transform transform group-hover:scale-110">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 448 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 186c-39.5 0-71.5-32-71.5-71.5s32-71.5 71.5-71.5 71.5 32 71.5 71.5-32 71.5-71.5 71.5zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-1.7-35.3-9.9-66.7-36.2-92.9S388.6 1.7 353.3 0C317.8-1.7 130.2-1.7 94.7 0 59.4 1.7 28 9.9 1.7 36.2S1.7 123.4 0 158.7C-1.7 194.2-1.7 381.8 0 417.3c1.7 35.3 9.9 66.7 36.2 92.9s57.6 34.5 92.9 36.2c35.5 1.7 223.1 1.7 258.6 0 35.3-1.7 66.7-9.9 92.9-36.2s34.5-57.6 36.2-92.9c1.7-35.5 1.7-223.1 0-258.6zM398.8 388c-7.8 19.6-22.9 34.7-42.5 42.5-29.4 11.7-99.2 9-132.3 9s-102.9 2.6-132.3-9c-19.6-7.8-34.7-22.9-42.5-42.5-11.7-29.4-9-99.2-9-132.3s-2.6-102.9 9-132.3c7.8-19.6 22.9-34.7 42.5-42.5C121.2 9 191 11.6 224.1 11.6s102.9-2.6 132.3 9c19.6 7.8 34.7 22.9 42.5 42.5 11.7 29.4 9 99.2 9 132.3s2.7 102.9-9 132.3z" />
          </svg>
        </span>
      </a>
      {/* Copy Link */}
      <button onClick={handleCopy} title="Copy link" className="focus:outline-none">
        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      {copied && <span className="text-xs text-green-600 ml-2 animate-pulse">Copied!</span>}
    </div>
  );
} 