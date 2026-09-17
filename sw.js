/* Service Worker — SG Visitas y Proveedores
   Subí el CACHE (v1 -> v2 -> ...) cada vez que cambies index.html u otros. */
var CACHE = 'sg-visitas-v1';
var ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).catch(function(){}));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Nunca cachear llamadas al backend (Apps Script): siempre a la red
  if(url.indexOf('script.google.com') !== -1 || url.indexOf('googleusercontent.com') !== -1){ return; }
  // App shell: cache-first con actualización en segundo plano
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var net = fetch(e.request).then(function(res){
        if(res && res.status===200 && e.request.method==='GET'){
          var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || net;
    })
  );
});
