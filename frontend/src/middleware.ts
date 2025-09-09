import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Оптимизация для Telegram WebApp
  if (request.headers.get('user-agent')?.includes('Telegram')) {
    // Установка заголовков для оптимизации кэширования
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Сжатие контента
    response.headers.set('Content-Encoding', 'gzip');
    
    // Предотвращение кэширования HTML страниц
    if (request.nextUrl.pathname.endsWith('.html') || 
        !request.nextUrl.pathname.includes('.')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    // Оптимизация для статических ресурсов
    if (request.nextUrl.pathname.startsWith('/_next/static/') ||
        request.nextUrl.pathname.startsWith('/images/') ||
        request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Добавление заголовков безопасности для Telegram WebApp
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CSP для Telegram WebApp
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.telegram.org;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};