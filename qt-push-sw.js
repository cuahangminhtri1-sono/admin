/* qt-push-sw.js — NHẬN BÁO ĐẨY cho app Quản trị (repo admin, đặt cạnh index.html và sw.js).
   App Quản trị 5.2 đăng ký file này với phạm vi ./qt-push/ (KHÔNG đụng sw.js của app). Máy chủ quản trị (codebase quantri) gửi
   tin FCM dạng data: { title, body, tag, url, loai, giu }. Bấm thông báo ⇒ mở / đưa app Quản trị lên trước và mở đúng màn (?qt=…). */
'use strict';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
const GOC = new URL('../', self.registration.scope).href;   /* thư mục app Quản trị */
self.addEventListener('push', e => {
  let j = {};
  try{ j = e.data ? e.data.json() : {}; }catch(x){ try{ j = { data: { body: e.data.text() } }; }catch(y){ j = {}; } }
  const d = (j && (j.data || j.notification)) || j || {};
  const title = String(d.title || 'Quản trị Sổ Nợ').slice(0, 120);
  const opt = { body: String(d.body || '').slice(0, 480), tag: String(d.tag || 'qt'), renotify: true,
                requireInteraction: d.giu === '1', data: { url: String(d.url || '') }, lang: 'vi' };
  /* Safari / iPhone: mỗi tin đẩy PHẢI hiện thông báo (không hiện là bị gỡ đăng ký) — luôn hiện */
  e.waitUntil((async () => {
    try{ const cu = await self.registration.getNotifications({ tag: opt.tag }); cu.forEach(n => { try{ n.close(); }catch(x){} }); }catch(x){}
    await self.registration.showNotification(title, opt);
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const duoi = (e.notification.data && e.notification.data.url) || '';
  const url = new URL(duoi, GOC).href;
  e.waitUntil((async () => {
    const ds = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for(const c of ds){
      if(c.url.indexOf(GOC) === 0 && c.url.indexOf('/qt-push/') < 0){
        try{ c.postMessage({ qt: 'mo', url }); }catch(x){}
        try{ return await c.focus(); }catch(x){}
      }
    }
    return self.clients.openWindow(url);
  })());
});
