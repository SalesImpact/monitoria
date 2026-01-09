import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdmin = token?.role === 'admin';

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const protectedPaths = [
      '/dashboard',
      '/monitoring',
      '/sdr-analysis',
      '/coaching',
      '/simulator',
      '/best-practices',
      '/trends',
      '/manual',
      '/objections',
      '/reports',
      '/criteria-analysis',
      '/training',
      '/select-organization',
      '/profile',
      '/organizations',
    ];

    const isProtectedPath = protectedPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    if (isProtectedPath) {
      const selectedOrgId = token.selectedOrganizationId;

      // Apenas admins podem acessar /organizations
      if (pathname === '/organizations' || pathname.startsWith('/organizations/')) {
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
      }

      // Admins sempre podem acessar a página de seleção
      if (isAdmin && pathname === '/select-organization') {
        return NextResponse.next();
      }

      if (!selectedOrgId && pathname !== '/select-organization') {
        return NextResponse.redirect(new URL('/select-organization', req.url));
      }

      // Não redirecionar admins da página de seleção para o dashboard
      if (selectedOrgId && pathname === '/select-organization' && !isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/monitoring/:path*',
    '/sdr-analysis/:path*',
    '/coaching/:path*',
    '/simulator/:path*',
    '/best-practices/:path*',
    '/trends/:path*',
    '/manual/:path*',
    '/objections/:path*',
    '/reports/:path*',
    '/criteria-analysis/:path*',
    '/training/:path*',
    '/select-organization/:path*',
    '/profile/:path*',
    '/organizations/:path*',
  ],
};

