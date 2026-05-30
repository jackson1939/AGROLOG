export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/campo/:path*',
    '/parcelas/:path*',
    '/diagnostico/:path*',
    '/informes/:path*',
    '/configuracion/:path*',
  ],
};
