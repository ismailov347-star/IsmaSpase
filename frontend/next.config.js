/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизации для Telegram WebApp
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Оптимизация изображений для мобильных устройств
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Экспериментальные функции для производительности
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion'],
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

module.exports = nextConfig