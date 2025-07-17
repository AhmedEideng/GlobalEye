-- إصلاح المؤشرات المكررة في جدول news
-- حذف المؤشر المكرر news_url_unique والاحتفاظ بـ news_url_key

-- التحقق من المؤشرات الموجودة
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'news' 
AND schemaname = 'public'
AND indexname IN ('news_url_key', 'news_url_unique');

-- حذف المؤشر المكرر (news_url_unique)
DROP INDEX IF EXISTS public.news_url_unique;

-- التحقق من النتيجة
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'news' 
AND schemaname = 'public'
ORDER BY indexname; 