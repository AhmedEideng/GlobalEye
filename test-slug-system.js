// ملف اختبار نظام slugs
// يمكن تشغيله في Node.js أو في browser console

// دالة hashCode (نفس الدالة المستخدمة في المشروع)
function hashCode(str) {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// دالة توليد slug المحسنة
function generateSlug(title, url) {
  // تنظيف العنوان وإزالة الأحرف الخاصة
  if (title && title.trim()) {
    let cleanTitle = title
      .toLowerCase()
      .trim()
      // إزالة الأحرف العربية والأحرف الخاصة
      .replace(/[^\w\s-]/g, '')
      // استبدال المسافات والشرطات المتعددة بشرطة واحدة
      .replace(/[\s\-]+/g, '-')
      // إزالة الشرطات من البداية والنهاية
      .replace(/^-+|-+$/g, '')
      // تحديد الطول الأقصى
      .slice(0, 50);
    
    // إذا كان العنوان فارغاً بعد التنظيف، استخدم hash من URL
    if (!cleanTitle) {
      return `article-${Math.abs(hashCode(url)).toString()}`;
    }
    
    // إضافة hash من URL لضمان التفرد
    const urlHash = Math.abs(hashCode(url)).toString().slice(0, 8);
    return `${cleanTitle}-${urlHash}`;
  }
  
  // إذا لم يكن هناك عنوان، استخدم hash من URL
  return `article-${Math.abs(hashCode(url)).toString()}`;
}

// اختبارات
console.log('=== اختبار نظام توليد الروابط ===\n');

// اختبار 1: عنوان عادي
const test1 = {
  title: "Breaking News: Major Event Happens Today!",
  url: "https://example.com/news/123"
};
console.log('اختبار 1 - عنوان عادي:');
console.log('العنوان:', test1.title);
console.log('الرابط:', test1.url);
console.log('الرابط المولد:', generateSlug(test1.title, test1.url));
console.log('');

// اختبار 2: عنوان باللغة العربية
const test2 = {
  title: "أخبار عاجلة: حدث مهم يحدث اليوم!",
  url: "https://example.com/news/456"
};
console.log('اختبار 2 - عنوان بالعربية:');
console.log('العنوان:', test2.title);
console.log('الرابط:', test2.url);
console.log('الرابط المولد:', generateSlug(test2.title, test2.url));
console.log('');

// اختبار 3: عنوان مع رموز خاصة
const test3 = {
  title: "Tech News: AI & Machine Learning @ 2024!",
  url: "https://example.com/news/789"
};
console.log('اختبار 3 - عنوان مع رموز خاصة:');
console.log('العنوان:', test3.title);
console.log('الرابط:', test3.url);
console.log('الرابط المولد:', generateSlug(test3.title, test3.url));
console.log('');

// اختبار 4: عنوان طويل جداً
const test4 = {
  title: "This is a very long news title that should be truncated to fit within the maximum length limit of 50 characters",
  url: "https://example.com/news/101"
};
console.log('اختبار 4 - عنوان طويل:');
console.log('العنوان:', test4.title);
console.log('الرابط:', test4.url);
console.log('الرابط المولد:', generateSlug(test4.title, test4.url));
console.log('');

// اختبار 5: عنوان فارغ
const test5 = {
  title: "",
  url: "https://example.com/news/202"
};
console.log('اختبار 5 - عنوان فارغ:');
console.log('العنوان:', test5.title);
console.log('الرابط:', test5.url);
console.log('الرابط المولد:', generateSlug(test5.title, test5.url));
console.log('');

// اختبار 6: عنوان مع مسافات متعددة
const test6 = {
  title: "  News   with   multiple   spaces  ",
  url: "https://example.com/news/303"
};
console.log('اختبار 6 - عنوان مع مسافات متعددة:');
console.log('العنوان:', test6.title);
console.log('الرابط:', test6.url);
console.log('الرابط المولد:', generateSlug(test6.title, test6.url));
console.log('');

// اختبار التفرد
console.log('=== اختبار التفرد ===');
const sameTitle = "Same Title";
const url1 = "https://example.com/news/1";
const url2 = "https://example.com/news/2";

const slug1 = generateSlug(sameTitle, url1);
const slug2 = generateSlug(sameTitle, url2);

console.log('نفس العنوان، روابط مختلفة:');
console.log('الرابط 1:', slug1);
console.log('الرابط 2:', slug2);
console.log('هل الروابط مختلفة؟', slug1 !== slug2);
console.log('');

// اختبار الأداء
console.log('=== اختبار الأداء ===');
const startTime = Date.now();
for (let i = 0; i < 1000; i++) {
  generateSlug(`Test Title ${i}`, `https://example.com/news/${i}`);
}
const endTime = Date.now();
console.log(`وقت توليد 1000 رابط: ${endTime - startTime}ms`);

console.log('\n=== انتهى الاختبار ==='); 