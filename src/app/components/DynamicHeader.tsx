"use client";
import AuthButtons from './AuthButtons';

export default function DynamicHeader() {
  return (
    <div className="dynamic-header fixed top-0 left-0 right-0 z-50">
      <div className="header-main px-4 py-3 flex justify-between items-center">
        {/* تم حذف الشعار من هنا ليبقى فقط في Navbar */}
      </div>
    </div>
  );
} 