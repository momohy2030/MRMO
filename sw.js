const CACHE_NAME = 'momohy-erp-v4';

// قائمة الملفات والمكتبات الخارجية التي سيتم تخزينها محلياً على الهاتف
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './survey.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.4.0/firebase-database-compat.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap'
];

// مرحلة التثبيت: حفظ جميع الملفات والمكتبات في ذاكرة الهاتف
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استخدام Promise.allSettled لضمان نجاح التخزين حتى لو تعثر رابط خط أو مكتبة
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn('Failed to cache:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// مرحلة التفعيل: مسح أي كاش قديم لتحديث البرنامج
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// مرحلة التعامل مع الطلبات: جلب من الكاش أولاً عند غياب الإنترنت
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // إذا لم يكن مخزناً، نحاول جلبه من الإنترنت وتخزينه للمرات القادمة
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // في حالة كان الطلب لصفحة HTML والإنترنت مقطوع تماماً
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./survey.html') || caches.match('./index.html');
        }
      });
    })
  );
});
