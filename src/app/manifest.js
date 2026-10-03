export default function manifest() {
  return {
    name: 'Bariahorra - Precios Bariloche',
    short_name: 'Bariahorra',
    description: 'Comparador comunitario de precios de supermercados en Bariloche',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d131f',
    theme_color: '#0ea5e9',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}