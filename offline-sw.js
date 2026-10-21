/* Arlene's Beans TEST — offline cache pilot (2026-10-21).
   Never deploy to production without device verification. */
const VERSION = 'arlenes-test-offline-v1';
const CORE = [
  './screen-1-test.html','./screen-2-test.html','./screen-3-test.html',
  './screen-1-portrait-tested.html','./screen-2-portrait.html','./screen-3-portrait.html',
  './gf-enhancer.js','./screen-3-table-enhancer.js','./fall-theme.css'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.allSettled(CORE.map(path => cache.add(new Request(path, {cache:'reload'}))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('arlenes-test-offline-') && k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
function cacheKey(req) {
  const url = new URL(req.url);
  if (url.hostname === 'docs.google.com' && url.pathname.includes('/gviz/tq')) {
    url.searchParams.delete('_'); // Existing scripts append Date.now() as cache buster
  } else if (url.origin === self.location.origin) {
    url.searchParams.delete('v'); // Menu preview version strings
  }
  return url.toString();
}
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET')return;
  const url = new URL(req.url);
  const sameSite = url.origin === self.location.origin;
  const sheets = url.hostname==='docs.google.com' && url.pathname.includes('/gviz/tq');
  const fonts = ['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname);
  if(!sameSite && !sheets && !fonts)return;
  event.respondWith((async()=>{
    const cache = await caches.open(VERSION);
    const key=cacheKey(req);
    // 4s for Sheets allows quicker offline fallback than browser network timeout.
    const timeout = sheets ? 4000 : 6000;
    try{
      const controller = new AbortController();
      const timer = setTimeout(()=>controller.abort(),timeout);
      let response;
      try { response=await fetch(req,{signal:controller.signal}); }
      finally { clearTimeout(timer); }
      if(response && (response.ok || response.type==='opaque')){
        event.waitUntil(cache.put(key,response.clone()).catch(()=>{}));
        return response;
      }
      throw new Error('Remote resource not available');
    }catch(_){
      const saved=await cache.match(key);
      if(saved)return saved;
      if(req.mode==='navigate'){
        return new Response('<!doctype html><html><body style="font:20px sans-serif;background:#F7F0E3;padding:30px">Offline cache not initialized. Reconnect once to preload the menu.</body></html>',{headers:{'Content-Type':'text/html'}});
      }
      return Response.error();
    }
  })());
});
