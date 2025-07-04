"use client";
import { useState } from 'react';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex flex-wrap gap-3 mt-6 mb-8 items-center justify-center">
      {/* WhatsApp */}
      <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">
        <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.69.97.99-3.59-.24-.37A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2c2.54 0 4.93.99 6.74 2.8A9.94 9.94 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.16 3.3 5.23 4.5.73.3 1.3.48 1.75.61.74.23 1.41.2 1.94.12.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z"/></svg>
      </a>
      {/* Telegram */}
      <a href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" title="Share on Telegram">
        <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm5.707 8.293l-2.828 8.485c-.213.64-.77.822-1.312.573l-3.637-2.687-1.754-.844-2.41-.793c-.524-.172-.533-.414.11-.608l9.36-2.88c.524-.172.82.127.675.608z"/></svg>
      </a>
      {/* Facebook */}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`} target="_blank" rel="noopener noreferrer" title="Share on Facebook">
        <svg className="w-7 h-7 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
      </a>
      {/* X (Twitter) */}
      <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" title="Share on X">
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
      <a href={`https://www.instagram.com/?url=${encodeURIComponent(fullUrl)}`} target="_blank" rel="noopener noreferrer" title="Share on Instagram">
        <svg className="w-7 h-7 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.414 3.678 1.395c-.98.98-1.263 2.092-1.322 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.281.342 2.393 1.322 3.373.98.98 2.092 1.263 3.373 1.322C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.342 3.373-1.322.98-.98 1.263-2.092 1.322-3.373.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.281-.342-2.393-1.322-3.373-.98-.98-2.092-1.263-3.373-1.322C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
      </a>
      {/* Copy Link */}
      <button onClick={handleCopy} title="Copy link" className="focus:outline-none">
        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      {copied && <span className="text-xs text-green-600 ml-2 animate-pulse">Copied!</span>}
    </div>
  );
} 