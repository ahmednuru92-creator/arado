# ⚙️ ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — ይፋዊ የ `sw.js` (Service Worker) ፋይል

ይህ ሰነድ ለ**ደሴ ማርት (ሙጋድ ገበያ)** ለ PWABuilder፣ ለ Vercel፣ ለ Google Play (TWA / APK) እንዲሁም መተግበሪያው ከመስመር ውጭ (Offline Caching) ያለምንም እንከን እንዲሰራ የሚያስችለውን ይፋዊ የ **`sw.js`** ሙሉ ምንጭ ኮድ ይዟል።

---

## 📁 1. የፋይሉ አቀማመጥ (File Location)
```plaintext
dessie-mart/sw.js
```
*(ወይም በ `public/sw.js` ማውጫ ውስጥ)*

---

## 💻 2. የተሟላ የ `sw.js` ምንጭ ኮድ (Source Code)

```javascript
// ============================================================================
// 🇪🇹 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — Service Worker (sw.js)
// ስሪት: v1.0.0 (Production Release)
// ============================================================================

const CACHE_NAME = 'dessie-mart-v1.0.0';
const OFFLINE_URL = '/offline.html';

// 📦 ከመስመር ውጭ እንዲቀመጡ የሚፈለጉ ዋና ዋና ፋይሎች (Core Assets for Offline)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/icons/app_icon_192.png',
  '/assets/icons/app_icon_512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// 1. መጫን (Install Event) - ዋና ዋና ፋይሎችን በካሼ ውስጥ አስቀድሞ ማስቀመጥ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [Service Worker] ደሴ ማርት ፋይሎችን በካሼ ውስጥ በማስቀመጥ ላይ...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ማንቃት (Activate Event) - የቆዩ ካሼዎችን በማጽዳት አዲሱን ስሪት መቆጣጠር
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [Service Worker] የቆየ ካሼ ተወግዷል:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ጥያቄዎችን ማስተናገድ (Fetch Event - Stale-While-Revalidate with Offline Fallback)
self.addEventListener('fetch', (event) => {
  // የድረ-ገጽ ዳሰሳ ጥያቄ ከሆነ እና ኢንተርኔት ከተቋረጠ ወደ offline.html ማዞር
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // ምስሎች፣ ፎንቶች እና የስታይል ፋይሎች ከካሼ ወይም ከኔትወርክ ማቅረብ
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // የቅርብ ጊዜውን ከበስተጀርባ አምጥቶ ካሼን ማደስ
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/assets/icons/app_icon_192.png');
        }
      });
    })
  );
});
```

---

## 🔍 3. በ `sw.js` ውስጥ የተካተቱ ቁልፍ ሚናዎች፦
1. **Offline Mode Support፦** ኢንተርኔት በሚቋረጥበት ወቅት ተጠቃሚዎች ያለምንም ክፍተት ወደተዘጋጀው `offline.html` ገጽ እንዲዞሩ ያደርጋል።
2. **Instant Loading (PWA Speed)፦** የደሴ ማርት አዶዎች፣ ፎንቶችና የመነሻ ገጽ በስልኩ ካሼ ስለሚቀመጡ አፑ በቅጽበት ይከፈታል።
3. **PWABuilder Compliance፦** በ PWABuilder እና በ Google Play Store የ PWA/TWA ጥራት ፍተሻ ላይ 100% ውጤት (Pass) እንዲያገኝ ተደርጎ ተዋቅሯል።
