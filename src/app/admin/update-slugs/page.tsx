"use client";

import { useState, useEffect } from 'react';

interface SlugsStats {
  totalArticles: number;
  articlesWithSlugs: number;
  articlesWithoutSlugs: number;
  articlesWithPoorSlugs: number;
  percentageWithSlugs: number;
}

export default function UpdateSlugsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<string>('');
  const [stats, setStats] = useState<SlugsStats | null>(null);
  const [details, setDetails] = useState<any>(null);

  // فحص حالة slugs عند تحميل الصفحة
  useEffect(() => {
    checkSlugsStatus();
  }, []);

  const checkSlugsStatus = async () => {
    setIsChecking(true);
    setResult('جاري فحص حالة الروابط...');
    
    try {
      const response = await fetch('/api/update-slugs?action=check-status', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setResult('تم فحص حالة الروابط بنجاح! 📊');
      } else {
        setResult(`خطأ في فحص الحالة: ${data.error}`);
      }
    } catch (error) {
      setResult(`خطأ في الاتصال: ${error}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateSlugs = async () => {
    setIsUpdating(true);
    setResult('جاري تحديث الروابط...');
    
    try {
      const response = await fetch('/api/update-slugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult('تم تحديث الروابط بنجاح! 🎉');
        setDetails(data.details);
        // إعادة فحص الحالة بعد التحديث
        setTimeout(() => {
          checkSlugsStatus();
        }, 1000);
      } else {
        setResult(`خطأ: ${data.error}`);
      }
    } catch (error) {
      setResult(`خطأ في الاتصال: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">إدارة روابط الأخبار</h1>
      
      {/* إحصائيات حالة slugs */}
      {stats && (
        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">إحصائيات الروابط</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-sm text-blue-800">إجمالي الأخبار</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.articlesWithSlugs}</div>
              <div className="text-sm text-green-800">أخبار بروابط جيدة</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.articlesWithoutSlugs}</div>
              <div className="text-sm text-red-800">أخبار بدون روابط</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.articlesWithPoorSlugs}</div>
              <div className="text-sm text-yellow-800">روابط تحتاج تحسين</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-gray-700">
              نسبة الأخبار بروابط جيدة: {stats.percentageWithSlugs}%
            </div>
          </div>
        </div>
      )}

      {/* تفاصيل التحديث الأخير */}
      {details && (
        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">تفاصيل آخر تحديث</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{details.articlesNeedingSlugs}</div>
              <div className="text-sm text-blue-800">أخبار بدون روابط</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">{details.articlesWithPoorSlugs}</div>
              <div className="text-sm text-yellow-800">روابط محسنة</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{details.totalUpdated}</div>
              <div className="text-sm text-green-800">إجمالي المحدثة</div>
            </div>
          </div>
        </div>
      )}
      
      {/* أزرار التحكم */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6 text-center">
          هذا النظام سيقوم بتوليد وتحسين روابط (slugs) لجميع الأخبار الموجودة في قاعدة البيانات
        </p>
        
        <div className="space-y-4">
          <button
            onClick={checkSlugsStatus}
            disabled={isChecking}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isChecking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isChecking ? 'جاري الفحص...' : 'فحص حالة الروابط'}
          </button>
          
          <button
            onClick={handleUpdateSlugs}
            disabled={isUpdating}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isUpdating ? 'جاري التحديث...' : 'تحديث جميع الروابط'}
          </button>
        </div>
        
        {result && (
          <div className={`mt-4 p-3 rounded-lg ${
            result.includes('نجح') || result.includes('تم')
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>بعد التحديث، ستتمكن من فتح جميع الأخبار بشكل صحيح</p>
        <p className="mt-2">
          <a href="/world" className="text-red-600 hover:underline">العودة لأخبار العالم</a>
        </p>
      </div>
    </div>
  );
} 