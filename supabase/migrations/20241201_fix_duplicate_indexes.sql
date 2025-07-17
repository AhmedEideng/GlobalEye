-- Migration: إصلاح المؤشرات المكررة في جدول news
-- التاريخ: 2024-12-01

-- حذف المؤشر المكرر news_url_unique
DROP INDEX IF EXISTS public.news_url_unique;

-- التحقق من أن المؤشر المتبقي يعمل بشكل صحيح
-- (news_url_key سيبقى ويضمن عدم تكرار URLs) 