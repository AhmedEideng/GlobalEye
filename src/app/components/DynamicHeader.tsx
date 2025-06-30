"use client";
import AuthButtons from './AuthButtons';

export default function DynamicHeader() {
  return (
    <div className="dynamic-header fixed top-0 left-0 right-0 z-50">
      <div className="header-main px-4 py-3 flex justify-between items-center">
        <div className="cnn-logo text-2xl font-bold">
          <span className="text-red-600">Global</span>
          <span className="text-gray-800">Eye</span>
        </div>
        <AuthButtons />
      </div>
    </div>
  );
} 