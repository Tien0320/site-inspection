// 離線快取：先用網路，失敗時用快取，讓工地沒有訊號也能開啟
// 只快取本站檔案與 Firebase 元件；雲端資料連線不經過這裡（由 Firestore 自己處理離線）
const C='site-inspection-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const mine=u.origin===location.origin, sdk=u.origin==='https://www.gstatic.com'&&u.pathname.startsWith('/firebasejs/');
  if(!mine&&!sdk)return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
