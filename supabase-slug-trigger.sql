-- ملف SQL لإنشاء trigger تلقائي لتوليد slugs في Supabase
-- يمكن تشغيل هذا الملف في SQL Editor في Supabase Dashboard

-- دالة لتوليد slug من العنوان والرابط
CREATE OR REPLACE FUNCTION generate_slug_from_title(title TEXT, url TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_title TEXT;
    url_hash TEXT;
BEGIN
    -- تنظيف العنوان
    IF title IS NOT NULL AND title != '' THEN
        clean_title := lower(title);
        -- إزالة الأحرف الخاصة والرموز
        clean_title := regexp_replace(clean_title, '[^\w\s-]', '', 'g');
        -- استبدال المسافات والشرطات المتعددة بشرطة واحدة
        clean_title := regexp_replace(clean_title, '[\s\-]+', '-', 'g');
        -- إزالة الشرطات من البداية والنهاية
        clean_title := trim(both '-' from clean_title);
        -- تحديد الطول الأقصى
        clean_title := left(clean_title, 50);
        
        -- إذا كان العنوان فارغاً بعد التنظيف
        IF clean_title = '' THEN
            RETURN 'article-' || abs(('x' || substr(md5(url), 1, 8))::bit(32)::int)::text;
        END IF;
        
        -- إضافة hash من URL لضمان التفرد
        url_hash := abs(('x' || substr(md5(url), 1, 8))::bit(32)::int)::text;
        RETURN clean_title || '-' || url_hash;
    END IF;
    
    -- إذا لم يكن هناك عنوان، استخدم hash من URL
    RETURN 'article-' || abs(('x' || substr(md5(url), 1, 8))::bit(32)::int)::text;
END;
$$ LANGUAGE plpgsql;

-- دالة trigger لتوليد slug تلقائياً
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- توليد slug فقط إذا لم يكن موجوداً أو كان فارغاً أو غير صحيح
    IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = 'null' OR 
       NEW.slug LIKE '%undefined%' OR NEW.slug LIKE '%null%' OR
       length(NEW.slug) < 5 OR length(NEW.slug) > 100 THEN
        
        NEW.slug := generate_slug_from_title(NEW.title, NEW.url);
        
        -- تسجيل العملية (اختياري)
        RAISE NOTICE 'Generated slug for article "%": %', NEW.title, NEW.slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger على جدول news
-- هذا سيعمل عند إدخال أو تحديث أي خبر
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON news;
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- دالة لتحديث جميع الأخبار الموجودة مع slugs
CREATE OR REPLACE FUNCTION update_all_existing_slugs()
RETURNS TABLE(updated_count INTEGER, message TEXT) AS $$
DECLARE
    article_record RECORD;
    new_slug TEXT;
    count_updated INTEGER := 0;
BEGIN
    -- تحديث جميع الأخبار التي لا تحتوي على slug صحيح
    FOR article_record IN 
        SELECT id, title, url, slug 
        FROM news 
        WHERE slug IS NULL 
           OR slug = '' 
           OR slug = 'null'
           OR slug LIKE '%undefined%'
           OR slug LIKE '%null%'
           OR length(slug) < 5
           OR length(slug) > 100
    LOOP
        new_slug := generate_slug_from_title(article_record.title, article_record.url);
        
        UPDATE news 
        SET slug = new_slug 
        WHERE id = article_record.id;
        
        count_updated := count_updated + 1;
        
        RAISE NOTICE 'Updated slug for article ID %: % -> %', 
                    article_record.id, article_record.slug, new_slug;
    END LOOP;
    
    RETURN QUERY SELECT count_updated, 
                    format('Updated %s articles with new slugs', count_updated);
END;
$$ LANGUAGE plpgsql;

-- دالة لفحص حالة slugs في قاعدة البيانات
CREATE OR REPLACE FUNCTION check_slugs_status()
RETURNS TABLE(
    total_articles BIGINT,
    articles_with_slugs BIGINT,
    articles_without_slugs BIGINT,
    articles_with_poor_slugs BIGINT,
    percentage_with_slugs NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN slug IS NOT NULL AND slug != '' AND slug != 'null' THEN 1 END) as with_slugs,
            COUNT(CASE WHEN slug IS NULL OR slug = '' OR slug = 'null' THEN 1 END) as without_slugs,
            COUNT(CASE WHEN slug IS NOT NULL AND slug != '' AND slug != 'null' 
                       AND (slug LIKE '%undefined%' OR slug LIKE '%null%' OR length(slug) < 5 OR length(slug) > 100)
                   THEN 1 END) as poor_slugs
        FROM news
    )
    SELECT 
        total,
        with_slugs,
        without_slugs,
        poor_slugs,
        CASE WHEN total > 0 THEN ROUND((with_slugs::NUMERIC / total::NUMERIC) * 100, 2) ELSE 0 END
    FROM stats;
END;
$$ LANGUAGE plpgsql;

-- إنشاء index على slug لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_url ON news(url);

-- تعليقات توضيحية
COMMENT ON FUNCTION generate_slug_from_title(TEXT, TEXT) IS 'توليد slug من عنوان الخبر والرابط';
COMMENT ON FUNCTION auto_generate_slug() IS 'Trigger تلقائي لتوليد slug عند إدخال أو تحديث خبر';
COMMENT ON FUNCTION update_all_existing_slugs() IS 'تحديث جميع الأخبار الموجودة مع slugs جديدة';
COMMENT ON FUNCTION check_slugs_status() IS 'فحص حالة slugs في قاعدة البيانات';

-- مثال على الاستخدام:
-- SELECT * FROM check_slugs_status();
-- SELECT * FROM update_all_existing_slugs(); 