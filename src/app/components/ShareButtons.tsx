import React from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const encode = (str: string) => encodeURIComponent(str);

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const shareUrl = typeof window !== "undefined" ? window.location.origin + url : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("تم نسخ الرابط!");
    } catch {
      alert("حدث خطأ أثناء النسخ");
    }
  };

  return (
    <div className="flex gap-3 mt-4">
      {/* فيسبوك */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="مشاركة على فيسبوك"
        className="hover:text-blue-600"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692V11.01h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.696h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
      </a>
      {/* تويتر */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="مشاركة على تويتر"
        className="hover:text-blue-400"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.21-.005-.423-.015-.633A9.936 9.936 0 0 0 24 4.557z"/></svg>
      </a>
      {/* واتساب */}
      <a
        href={`https://wa.me/?text=${encode(title + ' ' + shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="مشاركة على واتساب"
        className="hover:text-green-500"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.991c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05.001C5.495.001.001 5.495.001 12.049c0 2.124.553 4.199 1.601 6.032L.057 23.974a1.001 1.001 0 0 0 1.262 1.262l5.924-1.548a11.888 11.888 0 0 0 5.804 1.479h.005c6.554 0 11.948-5.494 11.949-12.049a11.87 11.87 0 0 0-3.489-8.413"/></svg>
      </a>
      {/* تيليجرام */}
      <a
        href={`https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="مشاركة على تيليجرام"
        className="hover:text-blue-500"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.371 0 0 5.371 0 12c0 6.629 5.371 12 12 12s12-5.371 12-12c0-6.629-5.371-12-12-12zm5.707 8.293l-1.414 8.485c-.104.624-.441.775-.893.482l-2.475-1.828-1.194 1.151c-.132.132-.243.243-.497.243l.178-2.522 4.599-4.149c.2-.178-.043-.277-.31-.099l-5.684 3.584-2.448-.763c-.532-.166-.543-.532.111-.789l9.564-3.689c.443-.166.832.099.689.788z"/></svg>
      </a>
      {/* نسخ الرابط */}
      <button
        onClick={handleCopy}
        title="نسخ الرابط"
        className="hover:text-gray-600"
        type="button"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
      </button>
    </div>
  );
};

export default ShareButtons; 