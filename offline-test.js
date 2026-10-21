/* Register offline caching for TEST preview only; avoid impacting production. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./offline-sw.js', {scope:'./'})
    .then(reg => { document.documentElement.dataset.offlineCache = 'registered'; })
    .catch(err => { console.warn('Offline preview cache unsupported:',err); });
}
