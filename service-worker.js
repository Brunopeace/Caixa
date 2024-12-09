const CACHE_NAME = "app-cache-v1";
const urlsToCache = [
    "/index.html", // Substitua pelos seus arquivos reais
    "/styles.css",
    "/script.js",
    "/icon.png", // Ícone do app (se houver)
    "/manifest.json"
];

// Instalação do Service Worker e cache dos arquivos
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Cache aberto");
            return cache.addAll(urlsToCache);
        })
    );
});

// Interceptação de requisições para servir arquivos em cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Retorna o recurso do cache ou faz o fetch da rede
            return response || fetch(event.request);
        })
    );
});

// Atualização do Service Worker e remoção de caches antigos
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Cache antigo removido:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});