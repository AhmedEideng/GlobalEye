# إعداد Favicon في GlobalEye News

## الملفات المتاحة

يحتوي المشروع على عدة أحجام من favicon لضمان التوافق مع مختلف الأجهزة والمتصفحات:

### الملفات الأساسية:
- `favicon.ico` (15KB) - الحجم التقليدي للمتصفحات القديمة
- `favicon.svg` - نسخة SVG للدقة العالية والمتصفحات الحديثة
- `favicon-32x32.png` (966B) - للشاشات الصغيرة

### لأجهزة Android:
- `android-chrome-192x192.png` (21KB) - للأجهزة العادية
- `android-chrome-512x512.png` (132KB) - للأجهزة عالية الدقة

### لأجهزة Apple:
- `apple-touch-icon.png` (20KB) - لأجهزة iPhone و iPad

## الإعدادات المحدثة

### 1. ملف layout.tsx
تم تحديث إعدادات `metadata.icons` لتشمل جميع الأحجام:

```typescript
icons: {
  icon: [
    { url: '/favicon.svg', type: 'image/svg+xml' },
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  ],
  shortcut: '/favicon.ico',
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
  other: [
    { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}
```

### 2. ملف manifest.json
تم تحديث الأيقونات لتستخدم الصور الصحيحة:

```json
"icons": [
  {
    "src": "/android-chrome-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/android-chrome-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

### 3. ملف browserconfig.xml
تم تحديث إعدادات Windows:

```xml
<square150x150logo src="/android-chrome-192x192.png"/>
```

## المزايا

1. **توافق أفضل**: يدعم جميع المتصفحات والأجهزة
2. **دقة عالية**: SVG للشاشات عالية الدقة
3. **أداء محسن**: أحجام مختلفة للاستخدام الأمثل
4. **PWA جاهز**: إعدادات كاملة للتطبيق التقدمي

## كيفية إضافة أحجام جديدة

لإضافة حجم جديد من favicon:

1. أضف الملف الجديد إلى مجلد `public/`
2. حدث `layout.tsx` في قسم `metadata.icons`
3. أضف رابط في قسم `<head>` إذا لزم الأمر
4. حدث `manifest.json` إذا كان الحجم مناسباً لـ PWA

## أحجام موصى بها

- `16x16` - للشريط الجانبي
- `32x32` - للشريط العلوي
- `48x48` - للقوائم
- `64x64` - للشاشات عالية الدقة
- `128x128` - للشاشات الكبيرة
- `192x192` - لأجهزة Android
- `512x512` - لأجهزة Android عالية الدقة
- `180x180` - لأجهزة Apple 