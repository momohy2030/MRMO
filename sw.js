// هذا الملف وظيفته فقط تلبية شرط متصفح كروم لظهور زر التثبيت (Install)

self.addEventListener('install', (event) => {
  self.skipWaiting(); // تفعيل فوري
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// الشرط الإلزامي لكروم: يجب وجود مستمع لحدث الـ fetch
self.addEventListener('fetch', (event) => {
  // نمرر الطلبات كما هي دون التدخل لكي لا نعطل React و Babel
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('You are offline, but the app data is saved locally.');
  }));
});
